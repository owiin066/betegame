const Stream = require('../models/Stream.model');
const User = require('../models/User.model');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Contrôleur pour obtenir tous les streams en direct
exports.getLiveStreams = async (req, res) => {
  try {
    // Trouver tous les streams en direct
    const liveStreams = await Stream.find({ isLive: true })
      .populate('streamer', 'username profilePicture')
      .sort({ viewers: -1 });

    res.json(liveStreams);
  } catch (err) {
    console.error('Erreur lors de la récupération des streams en direct:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir les détails d'un stream spécifique
exports.getStreamById = async (req, res) => {
  try {
    const streamId = req.params.id;

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(streamId)) {
      return res.status(400).json({ message: 'ID stream invalide' });
    }

    // Trouver le stream
    const stream = await Stream.findById(streamId)
      .populate('streamer', 'username profilePicture bio socialLinks stats');

    if (!stream) {
      return res.status(404).json({ message: 'Stream non trouvé' });
    }

    res.json(stream);
  } catch (err) {
    console.error('Erreur lors de la récupération du stream:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir la clé de streaming
exports.getStreamKey = async (req, res) => {
  try {
    const userId = req.user.id;

    // Vérifier si l'utilisateur est un streamer
    const user = await User.findById(userId);
    if (!user || user.userType !== 'streamer') {
      return res.status(403).json({ message: 'Accès refusé. Réservé aux streamers.' });
    }

    // Si l'utilisateur n'a pas de clé de stream, en générer une
    if (!user.streamKey) {
      user.streamKey = crypto.randomBytes(20).toString('hex');
      await user.save();
    }

    res.json({ streamKey: user.streamKey });
  } catch (err) {
    console.error('Erreur lors de la récupération de la clé de streaming:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour régénérer la clé de streaming
exports.regenerateStreamKey = async (req, res) => {
  try {
    const userId = req.user.id;

    // Vérifier si l'utilisateur est un streamer
    const user = await User.findById(userId);
    if (!user || user.userType !== 'streamer') {
      return res.status(403).json({ message: 'Accès refusé. Réservé aux streamers.' });
    }

    // Générer une nouvelle clé de stream
    user.streamKey = crypto.randomBytes(20).toString('hex');
    await user.save();

    res.json({ streamKey: user.streamKey });
  } catch (err) {
    console.error('Erreur lors de la régénération de la clé de streaming:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour démarrer un stream
exports.startStream = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, game, description } = req.body;

    // Vérifier si l'utilisateur est un streamer
    const user = await User.findById(userId);
    if (!user || user.userType !== 'streamer') {
      return res.status(403).json({ message: 'Accès refusé. Réservé aux streamers.' });
    }

    // Vérifier si l'utilisateur a déjà un stream en direct
    const existingStream = await Stream.findOne({ streamer: userId, isLive: true });
    if (existingStream) {
      return res.status(400).json({ message: 'Vous avez déjà un stream en direct' });
    }

    // Créer un nouveau stream
    const newStream = new Stream({
      streamer: userId,
      title,
      game,
      description: description || '',
      startTime: Date.now(),
      isLive: true
    });

    await newStream.save();

    // Mettre à jour le statut du streamer
    user.isStreaming = true;
    await user.save();

    // Mettre à jour les statistiques du streamer
    user.stats.totalStreams += 1;
    await user.save();

    // Notifier les abonnés via Socket.io
    const io = req.app.get('io');
    io.emit('stream-started', {
      streamId: newStream._id,
      streamer: {
        id: user._id,
        username: user.username,
        profilePicture: user.profilePicture
      },
      title,
      game
    });

    res.status(201).json(newStream);
  } catch (err) {
    console.error('Erreur lors du démarrage du stream:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour terminer un stream
exports.endStream = async (req, res) => {
  try {
    const userId = req.user.id;
    const streamId = req.params.id;

    // Vérifier si l'ID est valide
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

    // Vérifier si le stream est déjà terminé
    if (!stream.isLive) {
      return res.status(400).json({ message: 'Ce stream est déjà terminé' });
    }

    // Terminer le stream
    await stream.endStream();

    // Mettre à jour le statut du streamer
    const user = await User.findById(userId);
    user.isStreaming = false;
    user.stats.totalStreamTime += stream.duration;
    await user.save();

    // Notifier les spectateurs via Socket.io
    const io = req.app.get('io');
    io.to(`stream-${streamId}`).emit('stream-ended', {
      streamId: stream._id,
      duration: stream.duration
    });

    res.json({ message: 'Stream terminé avec succès', stream });
  } catch (err) {
    console.error('Erreur lors de la fin du stream:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour mettre à jour les informations d'un stream
exports.updateStream = async (req, res) => {
  try {
    const userId = req.user.id;
    const streamId = req.params.id;
    const { title, game, description } = req.body;

    // Vérifier si l'ID est valide
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
      return res.status(400).json({ message: 'Impossible de mettre à jour un stream terminé' });
    }

    // Mettre à jour les informations du stream
    if (title) stream.title = title;
    if (game) stream.game = game;
    if (description !== undefined) stream.description = description;

    await stream.save();

    // Notifier les spectateurs via Socket.io
    const io = req.app.get('io');
    io.to(`stream-${streamId}`).emit('stream-updated', {
      streamId: stream._id,
      title: stream.title,
      game: stream.game,
      description: stream.description
    });

    res.json(stream);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du stream:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir l'historique des streams d'un streamer
exports.getStreamHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver tous les streams terminés du streamer
    const streams = await Stream.find({ streamer: userId, isLive: false })
      .sort({ startTime: -1 });

    res.json(streams);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'historique des streams:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir les statistiques des streams d'un streamer
exports.getStreamStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver tous les streams du streamer
    const streams = await Stream.find({ streamer: userId });

    // Calculer les statistiques
    const totalStreams = streams.length;
    const totalStreamTime = streams.reduce((total, stream) => total + (stream.duration || 0), 0);
    const totalViewers = streams.reduce((total, stream) => total + (stream.viewers || 0), 0);
    const avgViewers = totalStreams > 0 ? totalViewers / totalStreams : 0;
    const totalBets = streams.reduce((total, stream) => total + (stream.totalBets || 0), 0);
    const totalBetAmount = streams.reduce((total, stream) => total + (stream.totalBetAmount || 0), 0);

    // Compter les résultats
    const wins = streams.filter(stream => stream.result === 'win').length;
    const losses = streams.filter(stream => stream.result === 'lose').length;
    const winRate = totalStreams > 0 ? (wins / totalStreams) * 100 : 0;

    res.json({
      totalStreams,
      totalStreamTime,
      avgViewers,
      totalBets,
      totalBetAmount,
      wins,
      losses,
      winRate
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques des streams:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
