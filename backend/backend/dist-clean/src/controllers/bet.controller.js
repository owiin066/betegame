const Bet = require('../models/Bet.model');
const Stream = require('../models/Stream.model');
const User = require('../models/User.model');
const Wallet = require('../models/Wallet.model');
const mongoose = require('mongoose');

// Contrôleur pour placer un pari
exports.placeBet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { streamId, amount, betType } = req.body;

    // Vérifier si l'ID du stream est valide
    if (!mongoose.Types.ObjectId.isValid(streamId)) {
      return res.status(400).json({ message: 'ID stream invalide' });
    }

    // Vérifier si le montant est valide
    if (amount <= 0) {
      return res.status(400).json({ message: 'Le montant doit être supérieur à 0' });
    }

    // Trouver le stream
    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({ message: 'Stream non trouvé' });
    }

    // Vérifier si le stream est en direct
    if (!stream.isLive) {
      return res.status(400).json({ message: 'Ce stream n\'est pas en direct' });
    }

    // Vérifier si les paris sont ouverts pour ce stream
    if (stream.bettingStatus !== 'open') {
      return res.status(400).json({ message: 'Les paris sont fermés pour ce stream' });
    }

    // Vérifier si l'utilisateur est le streamer
    if (stream.streamer.toString() === userId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas parier sur votre propre stream' });
    }

    // Trouver le portefeuille de l'utilisateur
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Portefeuille non trouvé' });
    }

    // Vérifier si le solde est suffisant
    if (!wallet.hasSufficientFunds(amount)) {
      return res.status(400).json({ message: 'Solde insuffisant' });
    }

    // Créer le pari
    const bet = new Bet({
      user: userId,
      stream: streamId,
      amount,
      odds: stream.currentOdds,
      betType,
      potentialWinnings: amount * stream.currentOdds
    });

    // Sauvegarder le pari
    await bet.save();

    // Mettre à jour le portefeuille de l'utilisateur
    await wallet.addTransaction(
      'bet',
      amount,
      `Pari sur le stream de ${stream.title}`,
      `BET-${bet._id}`
    );

    // Mettre à jour les statistiques du stream
    stream.totalBets += 1;
    stream.totalBetAmount += amount;
    await stream.save();

    // Mettre à jour les statistiques de l'utilisateur
    const user = await User.findById(userId);
    user.stats.totalBets += 1;
    user.stats.totalWagered += amount;
    await user.save();

    // Notifier le streamer via Socket.io
    const io = req.app.get('io');
    io.to(`stream-${streamId}`).emit('new-bet', {
      betId: bet._id,
      username: user.username,
      amount,
      betType
    });

    res.status(201).json({
      message: 'Pari placé avec succès',
      bet: {
        id: bet._id,
        amount: bet.amount,
        odds: bet.odds,
        betType: bet.betType,
        potentialWinnings: bet.potentialWinnings,
        status: bet.status,
        createdAt: bet.createdAt
      }
    });
  } catch (err) {
    console.error('Erreur lors du placement du pari:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir les paris actifs d'un utilisateur
exports.getActiveBets = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver tous les paris actifs de l'utilisateur
    const activeBets = await Bet.find({ user: userId, status: 'active' })
      .populate('stream', 'title game streamer isLive')
      .populate('stream.streamer', 'username');

    res.json(activeBets);
  } catch (err) {
    console.error('Erreur lors de la récupération des paris actifs:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir l'historique des paris d'un utilisateur
exports.getBetHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver tous les paris de l'utilisateur qui ne sont pas actifs
    const betHistory = await Bet.find({ 
      user: userId, 
      status: { $ne: 'active' } 
    })
      .populate('stream', 'title game streamer')
      .populate('stream.streamer', 'username')
      .sort({ createdAt: -1 });

    res.json(betHistory);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'historique des paris:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir les détails d'un pari spécifique
exports.getBetById = async (req, res) => {
  try {
    const userId = req.user.id;
    const betId = req.params.id;

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(betId)) {
      return res.status(400).json({ message: 'ID pari invalide' });
    }

    // Trouver le pari
    const bet = await Bet.findById(betId)
      .populate('stream', 'title game streamer isLive bettingStatus result')
      .populate('stream.streamer', 'username');

    if (!bet) {
      return res.status(404).json({ message: 'Pari non trouvé' });
    }

    // Vérifier si l'utilisateur est le propriétaire du pari
    if (bet.user.toString() !== userId) {
      return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas le propriétaire de ce pari.' });
    }

    res.json(bet);
  } catch (err) {
    console.error('Erreur lors de la récupération du pari:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour ouvrir les paris pour un stream
exports.openBets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { streamId, odds, duration } = req.body;

    // Vérifier si l'ID du stream est valide
    if (!mongoose.Types.ObjectId.isValid(streamId)) {
      return res.status(400).json({ message: 'ID stream invalide' });
    }

    // Trouver le stream
    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({ message: 'Stream non trouvé' });
    }

    // Vérifier si l'utilisateur est le propriétaire du stream
    if (stream.streamer.toString() !== userId) {
      return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas le propriétaire de ce stream.' });
    }

    // Vérifier si le stream est en direct
    if (!stream.isLive) {
      return res.status(400).json({ message: 'Ce stream n\'est pas en direct' });
    }

    // Vérifier si les paris sont déjà ouverts
    if (stream.bettingStatus === 'open') {
      return res.status(400).json({ message: 'Les paris sont déjà ouverts pour ce stream' });
    }

    // Ouvrir les paris
    await stream.openBetting(odds);

    // Si une durée est spécifiée, programmer la fermeture automatique des paris
    if (duration) {
      setTimeout(async () => {
        try {
          const updatedStream = await Stream.findById(streamId);
          if (updatedStream && updatedStream.bettingStatus === 'open') {
            await updatedStream.closeBetting();
            
            // Notifier les spectateurs via Socket.io
            const io = req.app.get('io');
            io.to(`stream-${streamId}`).emit('betting-closed', {
              streamId: updatedStream._id
            });
          }
        } catch (err) {
          console.error('Erreur lors de la fermeture automatique des paris:', err.message);
        }
      }, duration * 60 * 1000); // Convertir les minutes en millisecondes
    }

    // Notifier les spectateurs via Socket.io
    const io = req.app.get('io');
    io.to(`stream-${streamId}`).emit('betting-opened', {
      streamId: stream._id,
      odds: stream.currentOdds,
      duration
    });

    res.json({
      message: 'Paris ouverts avec succès',
      stream: {
        id: stream._id,
        bettingStatus: stream.bettingStatus,
        currentOdds: stream.currentOdds
      }
    });
  } catch (err) {
    console.error('Erreur lors de l\'ouverture des paris:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour fermer les paris pour un stream
exports.closeBets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { streamId } = req.body;

    // Vérifier si l'ID du stream est valide
    if (!mongoose.Types.ObjectId.isValid(streamId)) {
      return res.status(400).json({ message: 'ID stream invalide' });
    }

    // Trouver le stream
    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({ message: 'Stream non trouvé' });
    }

    // Vérifier si l'utilisateur est le propriétaire du stream
    if (stream.streamer.toString() !== userId) {
      return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas le propriétaire de ce stream.' });
    }

    // Vérifier si le stream est en direct
    if (!stream.isLive) {
      return res.status(400).json({ message: 'Ce stream n\'est pas en direct' });
    }

    // Vérifier si les paris sont ouverts
    if (stream.bettingStatus !== 'open') {
      return res.status(400).json({ message: 'Les paris ne sont pas ouverts pour ce stream' });
    }

    // Fermer les paris
    await stream.closeBetting();

    // Notifier les spectateurs via Socket.io
    const io = req.app.get('io');
    io.to(`stream-${streamId}`).emit('betting-closed', {
      streamId: stream._id
    });

    res.json({
      message: 'Paris fermés avec succès',
      stream: {
        id: stream._id,
        bettingStatus: stream.bettingStatus
      }
    });
  } catch (err) {
    console.error('Erreur lors de la fermeture des paris:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour confirmer le résultat d'un stream et distribuer les gains
exports.confirmResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const { streamId, result } = req.body;

    // Vérifier si l'ID du stream est valide
    if (!mongoose.Types.ObjectId.isValid(streamId)) {
      return res.status(400).json({ message: 'ID stream invalide' });
    }

    // Trouver le stream
    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({ message: 'Stream non trouvé' });
    }

    // Vérifier si l'utilisateur est le propriétaire du stream
    if (stream.streamer.toString() !== userId) {
      return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas le propriétaire de ce stream.' });
    }

    // Vérifier si les paris sont fermés
    if (stream.bettingStatus !== 'closed') {
      return res.status(400).json({ message: 'Les paris doivent être fermés avant de confirmer le résultat' });
    }

    // Définir le résultat du stream
    await stream.setResult(result);

    // Trouver tous les paris actifs pour ce stream
    const bets = await Bet.find({ stream: streamId, status: 'active' });

    // Traiter chaque pari
    for (const bet of bets) {
      const betUser = await User.findById(bet.user);
      const wallet = await Wallet.findOne({ user: bet.user });

      if (bet.betType === result) {
        // Le parieur a gagné
        await bet.markAsWon();
        
        // Mettre à jour le portefeuille du parieur
        await wallet.addTransaction(
          'win',
          bet.potentialWinnings,
          `Gain du pari sur le stream de ${stream.title}`,
          `WIN-${bet._id}`
        );

        // Mettre à jour les statistiques du parieur
        betUser.stats.wonBets += 1;
        betUser.stats.totalWon += bet.potentialWinnings;
        await betUser.save();
      } else {
        // Le parieur a perdu
        await bet.markAsLost();
      }
    }

    // Mettre à jour les statistiques du streamer
    const streamer = await User.findById(userId);
    if (result === 'win') {
      streamer.stats.winRate = ((streamer.stats.winRate * streamer.stats.totalStreams) + 100) / (streamer.stats.totalStreams + 1);
    } else {
      streamer.stats.winRate = ((streamer.stats.winRate * streamer.stats.totalStreams)) / (streamer.stats.totalStreams + 1);
    }
    await streamer.save();

    // Notifier les spectateurs via Socket.io
    const io = req.app.get('io');
    io.to(`stream-${streamId}`).emit('result-confirmed', {
      streamId: stream._id,
      result: stream.result
    });

    res.json({
      message: 'Résultat confirmé et gains distribués avec succès',
      stream: {
        id: stream._id,
        result: stream.result,
        bettingStatus: stream.bettingStatus
      }
    });
  } catch (err) {
    console.error('Erreur lors de la confirmation du résultat:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir les statistiques des paris pour un streamer
exports.getBetStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver tous les streams du streamer
    const streams = await Stream.find({ streamer: userId });
    const streamIds = streams.map(stream => stream._id);

    // Trouver tous les paris pour ces streams
    const bets = await Bet.find({ stream: { $in: streamIds } });

    // Calculer les statistiques
    const totalBets = bets.length;
    const totalBetAmount = bets.reduce((total, bet) => total + bet.amount, 0);
    const wonBets = bets.filter(bet => bet.status === 'won').length;
    const lostBets = bets.filter(bet => bet.status === 'lost').length;
    const activeBets = bets.filter(bet => bet.status === 'active').length;
    const totalPayout = bets.filter(bet => bet.status === 'won').reduce((total, bet) => total + bet.actualWinnings, 0);

    res.json({
      totalBets,
      totalBetAmount,
      wonBets,
      lostBets,
      activeBets,
      totalPayout
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques des paris:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
