const NodeMediaServer = require('node-media-server');
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamebet', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB réussie'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Configuration du serveur RTMP
const rtmpConfig = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  },
  auth: {
    play: false,
    publish: true,  // Exiger une authentification pour publier
    secret: process.env.RTMP_SECRET || 'gamebet_rtmp_secret'
  },
  trans: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
      }
    ]
  }
};

// Initialiser le serveur RTMP
const nms = new NodeMediaServer(rtmpConfig);

// API pour la gestion des clés de stream
const app = express();
app.use(cors());
app.use(express.json());

// Middleware d'authentification
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'gamebet_secret_key', (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Importer les modèles
const StreamKey = require('./models/StreamKey.model');
const User = require('./models/User.model');
const Bet = require('./models/Bet.model');

// Routes pour la gestion des clés de stream
app.post('/api/stream/key', authenticateJWT, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un streamer
    const user = await User.findById(req.user.id);
    if (!user || user.userType !== 'streamer') {
      return res.status(403).json({ error: 'Seuls les streamers peuvent générer des clés de stream' });
    }

    // Vérifier si l'utilisateur a déjà une clé
    let streamKey = await StreamKey.findOne({ userId: req.user.id });
    
    if (streamKey) {
      // Régénérer la clé
      streamKey.key = `sk_${req.user.id}_${Date.now().toString(36)}`;
      await streamKey.save();
    } else {
      // Créer une nouvelle clé
      streamKey = new StreamKey({
        userId: req.user.id,
        key: `sk_${req.user.id}_${Date.now().toString(36)}`
      });
      await streamKey.save();
    }

    res.json({
      streamKey: streamKey.key,
      rtmpUrl: 'rtmp://stream.gamebet.com/live',
      streamUrl: `https://stream.gamebet.com/live/${streamKey.key}`
    });
  } catch (error) {
    console.error('Erreur lors de la génération de la clé de stream:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer la clé de stream de l'utilisateur
app.get('/api/stream/key', authenticateJWT, async (req, res) => {
  try {
    const streamKey = await StreamKey.findOne({ userId: req.user.id });
    
    if (!streamKey) {
      return res.status(404).json({ error: 'Aucune clé de stream trouvée' });
    }

    res.json({
      streamKey: streamKey.key,
      rtmpUrl: 'rtmp://stream.gamebet.com/live',
      streamUrl: `https://stream.gamebet.com/live/${streamKey.key}`
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la clé de stream:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes pour la gestion des paris
app.post('/api/betting/open', authenticateJWT, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un streamer
    const user = await User.findById(req.user.id);
    if (!user || user.userType !== 'streamer') {
      return res.status(403).json({ error: 'Seuls les streamers peuvent ouvrir les paris' });
    }

    // Mettre à jour le statut des paris pour ce streamer
    await User.findByIdAndUpdate(req.user.id, { bettingOpen: true });

    res.json({ success: true, message: 'Paris ouverts avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ouverture des paris:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/betting/close', authenticateJWT, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un streamer
    const user = await User.findById(req.user.id);
    if (!user || user.userType !== 'streamer') {
      return res.status(403).json({ error: 'Seuls les streamers peuvent fermer les paris' });
    }

    // Mettre à jour le statut des paris pour ce streamer
    await User.findByIdAndUpdate(req.user.id, { bettingOpen: false });

    res.json({ success: true, message: 'Paris fermés avec succès' });
  } catch (error) {
    console.error('Erreur lors de la fermeture des paris:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/betting/result', authenticateJWT, async (req, res) => {
  try {
    const { result } = req.body;
    
    if (!result || (result !== 'win' && result !== 'loss')) {
      return res.status(400).json({ error: 'Résultat invalide' });
    }

    // Vérifier si l'utilisateur est un streamer
    const user = await User.findById(req.user.id);
    if (!user || user.userType !== 'streamer') {
      return res.status(403).json({ error: 'Seuls les streamers peuvent définir le résultat' });
    }

    // Mettre à jour les paris et distribuer les gains
    const bets = await Bet.find({ streamerId: req.user.id, settled: false });
    
    for (const bet of bets) {
      bet.result = result;
      bet.settled = true;
      
      if (result === 'win') {
        // Mettre à jour le portefeuille du parieur
        const bettor = await User.findById(bet.userId);
        if (bettor) {
          const winnings = bet.amount * bet.odds;
          bettor.balance += winnings;
          await bettor.save();
        }
      }
      
      await bet.save();
    }

    res.json({ 
      success: true, 
      message: `Résultat défini comme ${result === 'win' ? 'victoire' : 'défaite'}`,
      settledBets: bets.length
    });
  } catch (error) {
    console.error('Erreur lors de la définition du résultat:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Placer un pari
app.post('/api/bet', authenticateJWT, async (req, res) => {
  try {
    const { streamerId, amount } = req.body;
    
    if (!streamerId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Données de pari invalides' });
    }

    // Vérifier si les paris sont ouverts pour ce streamer
    const streamer = await User.findById(streamerId);
    if (!streamer || !streamer.bettingOpen) {
      return res.status(400).json({ error: 'Les paris sont fermés pour ce streamer' });
    }

    // Vérifier si l'utilisateur a suffisamment de fonds
    const user = await User.findById(req.user.id);
    if (!user || user.balance < amount) {
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    // Calculer les cotes (dans une application réelle, cela serait plus complexe)
    const odds = 1.5; // Exemple simple

    // Créer le pari
    const bet = new Bet({
      userId: req.user.id,
      streamerId,
      amount,
      odds,
      settled: false
    });
    
    await bet.save();

    // Déduire le montant du portefeuille de l'utilisateur
    user.balance -= amount;
    await user.save();

    res.json({
      success: true,
      message: 'Pari placé avec succès',
      bet: {
        id: bet._id,
        amount,
        odds,
        potentialWinnings: amount * odds
      }
    });
  } catch (error) {
    console.error('Erreur lors du placement du pari:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Événement de pré-publication pour valider la clé de stream
nms.on('prePublish', async (id, StreamPath, args) => {
  const streamKey = StreamPath.split('/')[2];
  
  try {
    // Vérifier si la clé existe dans la base de données
    const keyExists = await StreamKey.findOne({ key: streamKey });
    
    if (!keyExists) {
      const session = nms.getSession(id);
      session.reject();
    } else {
      // Mettre à jour la date de dernière utilisation
      keyExists.lastUsed = new Date();
      await keyExists.save();
    }
  } catch (error) {
    console.error('Erreur lors de la validation de la clé de stream:', error);
    const session = nms.getSession(id);
    session.reject();
  }
});

// Démarrer le serveur API
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server started on port ${PORT}`);
});

// Démarrer le serveur RTMP
nms.run();
console.log('RTMP server started');
