const Stream = require('../models/Stream.model');
const Bet = require('../models/Bet.model');
const User = require('../models/User.model');
const fetch = require('node-fetch');
const mongoose = require('mongoose');

// Service d'IA pour vérifier les résultats des parties
class AIVerificationService {
  // Méthode pour analyser une image de fin de partie
  static async analyzeGameResult(imageUrl, game) {
    try {
      // Dans une implémentation réelle, nous ferions appel à une API d'IA
      // Pour cette démonstration, nous simulons une réponse
      console.log(`Analyse de l'image ${imageUrl} pour le jeu ${game}`);
      
      // Simulation d'un appel à une API d'IA
      const response = {
        success: true,
        result: Math.random() > 0.5 ? 'win' : 'lose',
        confidence: 0.85 + (Math.random() * 0.15),
        game: game,
        details: {
          score: Math.floor(Math.random() * 100),
          position: Math.random() > 0.5 ? 'first' : 'eliminated'
        }
      };
      
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'analyse de l\'image:', error);
      throw new Error('Erreur lors de l\'analyse de l\'image');
    }
  }
  
  // Méthode pour vérifier un stream en direct
  static async verifyLiveStream(streamUrl, game) {
    try {
      // Dans une implémentation réelle, nous ferions appel à une API d'IA
      // Pour cette démonstration, nous simulons une réponse
      console.log(`Vérification du stream en direct ${streamUrl} pour le jeu ${game}`);
      
      // Simulation d'un appel à une API d'IA
      const response = {
        success: true,
        isPlaying: true,
        game: game,
        confidence: 0.9 + (Math.random() * 0.1),
        details: {
          activity: 'gaming',
          viewers: Math.floor(Math.random() * 1000)
        }
      };
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la vérification du stream en direct:', error);
      throw new Error('Erreur lors de la vérification du stream en direct');
    }
  }
  
  // Méthode pour détecter la triche
  static async detectCheating(streamUrl, game) {
    try {
      // Dans une implémentation réelle, nous ferions appel à une API d'IA
      // Pour cette démonstration, nous simulons une réponse
      console.log(`Détection de triche pour le stream ${streamUrl} et le jeu ${game}`);
      
      // Simulation d'un appel à une API d'IA
      const response = {
        success: true,
        cheatingDetected: Math.random() > 0.95, // 5% de chance de détecter une triche
        confidence: 0.8 + (Math.random() * 0.2),
        details: {
          suspiciousActions: [],
          abnormalPatterns: []
        }
      };
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la détection de triche:', error);
      throw new Error('Erreur lors de la détection de triche');
    }
  }
}

// Contrôleur pour l'IA de vérification
exports.verifyGameResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const { streamId, imageUrl } = req.body;
    
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
      return res.status(400).json({ message: 'Les paris doivent être fermés avant de vérifier le résultat' });
    }
    
    // Analyser l'image avec l'IA
    const aiResult = await AIVerificationService.analyzeGameResult(imageUrl, stream.game);
    
    // Si l'analyse a réussi avec une confiance suffisante
    if (aiResult.success && aiResult.confidence > 0.8) {
      // Définir le résultat du stream
      await stream.setResult(aiResult.result);
      
      // Trouver tous les paris actifs pour ce stream
      const bets = await Bet.find({ stream: streamId, status: 'active' });
      
      // Traiter chaque pari
      for (const bet of bets) {
        const betUser = await User.findById(bet.user);
        const wallet = await Wallet.findOne({ user: bet.user });
        
        if (bet.betType === aiResult.result) {
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
      if (aiResult.result === 'win') {
        streamer.stats.winRate = ((streamer.stats.winRate * streamer.stats.totalStreams) + 100) / (streamer.stats.totalStreams + 1);
      } else {
        streamer.stats.winRate = ((streamer.stats.winRate * streamer.stats.totalStreams)) / (streamer.stats.totalStreams + 1);
      }
      await streamer.save();
      
      // Notifier les spectateurs via Socket.io
      const io = req.app.get('io');
      io.to(`stream-${streamId}`).emit('result-verified', {
        streamId: stream._id,
        result: stream.result,
        verified: true,
        confidence: aiResult.confidence
      });
      
      res.json({
        message: 'Résultat vérifié et gains distribués avec succès',
        stream: {
          id: stream._id,
          result: stream.result,
          bettingStatus: stream.bettingStatus
        },
        aiResult
      });
    } else {
      // Si l'analyse n'a pas réussi ou la confiance est insuffisante
      res.status(400).json({
        message: 'Impossible de vérifier le résultat avec certitude',
        aiResult
      });
    }
  } catch (err) {
    console.error('Erreur lors de la vérification du résultat:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour vérifier un stream en direct
exports.verifyLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    
    // Vérifier si l'ID du stream est valide
    if (!mongoose.Types.ObjectId.isValid(streamId)) {
      return res.status(400).json({ message: 'ID stream invalide' });
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
    
    // Simuler une URL de stream
    const streamUrl = `https://gamebet.com/stream/${streamId}`;
    
    // Vérifier le stream avec l'IA
    const aiResult = await AIVerificationService.verifyLiveStream(streamUrl, stream.game);
    
    res.json({
      message: 'Stream vérifié avec succès',
      stream: {
        id: stream._id,
        title: stream.title,
        game: stream.game,
        isLive: stream.isLive
      },
      aiResult
    });
  } catch (err) {
    console.error('Erreur lors de la vérification du stream en direct:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour détecter la triche
exports.detectCheating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { streamId } = req.params;
    
    // Vérifier si l'ID du stream est valide
    if (!mongoose.Types.ObjectId.isValid(streamId)) {
      return res.status(400).json({ message: 'ID stream invalide' });
    }
    
    // Trouver le stream
    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({ message: 'Stream non trouvé' });
    }
    
    // Simuler une URL de stream
    const streamUrl = `https://gamebet.com/stream/${streamId}`;
    
    // Détecter la triche avec l'IA
    const aiResult = await AIVerificationService.detectCheating(streamUrl, stream.game);
    
    // Si une triche est détectée avec une confiance suffisante
    if (aiResult.cheatingDetected && aiResult.confidence > 0.9) {
      // Notifier les administrateurs
      console.log(`ALERTE: Triche détectée sur le stream ${streamId}`);
      
      // Dans une implémentation réelle, nous pourrions prendre des mesures automatiques
      // comme suspendre le stream ou annuler les paris
      
      // Notifier les modérateurs via Socket.io
      const io = req.app.get('io');
      io.to('moderators').emit('cheating-detected', {
        streamId: stream._id,
        streamer: stream.streamer,
        confidence: aiResult.confidence,
        details: aiResult.details
      });
    }
    
    // Si l'utilisateur est un administrateur, renvoyer les détails complets
    // Sinon, renvoyer juste un message générique
    if (req.user.isAdmin) {
      res.json({
        message: 'Détection de triche effectuée',
        stream: {
          id: stream._id,
          title: stream.title,
          game: stream.game
        },
        aiResult
      });
    } else {
      res.json({
        message: 'Détection de triche effectuée',
        stream: {
          id: stream._id,
          title: stream.title,
          game: stream.game
        }
      });
    }
  } catch (err) {
    console.error('Erreur lors de la détection de triche:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  verifyGameResult: exports.verifyGameResult,
  verifyLiveStream: exports.verifyLiveStream,
  detectCheating: exports.detectCheating,
  AIVerificationService
};
