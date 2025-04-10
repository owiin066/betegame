const User = require('../models/User.model');
const mongoose = require('mongoose');

// Contrôleur pour obtenir le profil d'un utilisateur
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }

    // Trouver l'utilisateur et exclure le mot de passe et la clé de stream
    const user = await User.findById(userId)
      .select('-password -streamKey')
      .populate('following', 'username profilePicture userType')
      .populate('followers', 'username profilePicture userType');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération du profil:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour mettre à jour le profil d'un utilisateur
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, bio, socialLinks } = req.body;
    const userId = req.user.id;

    // Vérifier si le nom d'utilisateur est déjà pris
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
      }
    }

    // Construire l'objet de mise à jour
    const updateFields = {};
    if (username) updateFields.username = username;
    if (bio) updateFields.bio = bio;
    if (socialLinks) {
      updateFields.socialLinks = {};
      if (socialLinks.twitch) updateFields.socialLinks.twitch = socialLinks.twitch;
      if (socialLinks.youtube) updateFields.socialLinks.youtube = socialLinks.youtube;
      if (socialLinks.twitter) updateFields.socialLinks.twitter = socialLinks.twitter;
      if (socialLinks.instagram) updateFields.socialLinks.instagram = socialLinks.instagram;
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select('-password -streamKey');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du profil:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir les statistiques d'un utilisateur
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver l'utilisateur et récupérer ses statistiques
    const user = await User.findById(userId).select('stats userType');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user.stats);
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir l'historique des paris d'un utilisateur
exports.getBetHistory = async (req, res) => {
  try {
    // Cette fonction sera implémentée plus tard avec le modèle Bet
    // Pour l'instant, nous renvoyons un tableau vide
    res.json([]);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'historique des paris:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir les streamers suivis par un utilisateur
exports.getFollowingStreamers = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver l'utilisateur et récupérer les streamers qu'il suit
    const user = await User.findById(userId)
      .populate({
        path: 'following',
        match: { userType: 'streamer' },
        select: 'username profilePicture bio isStreaming stats'
      });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user.following);
  } catch (err) {
    console.error('Erreur lors de la récupération des streamers suivis:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour suivre un streamer
exports.followStreamer = async (req, res) => {
  try {
    const userId = req.user.id;
    const streamerId = req.params.streamerId;

    // Vérifier si l'ID du streamer est valide
    if (!mongoose.Types.ObjectId.isValid(streamerId)) {
      return res.status(400).json({ message: 'ID streamer invalide' });
    }

    // Vérifier si l'utilisateur essaie de se suivre lui-même
    if (userId === streamerId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous suivre vous-même' });
    }

    // Vérifier si le streamer existe et est bien un streamer
    const streamer = await User.findOne({ _id: streamerId, userType: 'streamer' });
    if (!streamer) {
      return res.status(404).json({ message: 'Streamer non trouvé' });
    }

    // Vérifier si l'utilisateur suit déjà ce streamer
    const user = await User.findById(userId);
    if (user.following.includes(streamerId)) {
      return res.status(400).json({ message: 'Vous suivez déjà ce streamer' });
    }

    // Ajouter le streamer aux streamers suivis par l'utilisateur
    await User.findByIdAndUpdate(userId, { $push: { following: streamerId } });

    // Ajouter l'utilisateur aux followers du streamer
    await User.findByIdAndUpdate(streamerId, { $push: { followers: userId } });

    res.json({ message: 'Streamer suivi avec succès' });
  } catch (err) {
    console.error('Erreur lors du suivi du streamer:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour ne plus suivre un streamer
exports.unfollowStreamer = async (req, res) => {
  try {
    const userId = req.user.id;
    const streamerId = req.params.streamerId;

    // Vérifier si l'ID du streamer est valide
    if (!mongoose.Types.ObjectId.isValid(streamerId)) {
      return res.status(400).json({ message: 'ID streamer invalide' });
    }

    // Vérifier si l'utilisateur suit ce streamer
    const user = await User.findById(userId);
    if (!user.following.includes(streamerId)) {
      return res.status(400).json({ message: 'Vous ne suivez pas ce streamer' });
    }

    // Retirer le streamer des streamers suivis par l'utilisateur
    await User.findByIdAndUpdate(userId, { $pull: { following: streamerId } });

    // Retirer l'utilisateur des followers du streamer
    await User.findByIdAndUpdate(streamerId, { $pull: { followers: userId } });

    res.json({ message: 'Streamer retiré des abonnements avec succès' });
  } catch (err) {
    console.error('Erreur lors du retrait du streamer des abonnements:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir la liste des streamers populaires
exports.getPopularStreamers = async (req, res) => {
  try {
    // Trouver les streamers populaires (basé sur le nombre de followers)
    const popularStreamers = await User.find({ userType: 'streamer' })
      .sort({ 'followers.length': -1 })
      .limit(10)
      .select('username profilePicture bio isStreaming stats followers');

    res.json(popularStreamers);
  } catch (err) {
    console.error('Erreur lors de la récupération des streamers populaires:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
