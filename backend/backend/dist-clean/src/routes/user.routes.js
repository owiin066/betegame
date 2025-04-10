const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth } = require('../middleware/auth');
const { check } = require('express-validator');
const { validateRequest } = require('../middleware/validator');

// Route pour obtenir le profil d'un utilisateur
router.get('/profile/:id', auth, userController.getUserProfile);

// Route pour mettre à jour le profil d'un utilisateur
router.put(
  '/profile',
  [
    auth,
    check('username', 'Le nom d\'utilisateur est requis').optional(),
    check('bio', 'La bio ne peut pas dépasser 500 caractères').optional().isLength({ max: 500 }),
    check('socialLinks.twitch', 'L\'URL Twitch n\'est pas valide').optional().isURL(),
    check('socialLinks.youtube', 'L\'URL YouTube n\'est pas valide').optional().isURL(),
    check('socialLinks.twitter', 'L\'URL Twitter n\'est pas valide').optional().isURL(),
    check('socialLinks.instagram', 'L\'URL Instagram n\'est pas valide').optional().isURL()
  ],
  validateRequest,
  userController.updateUserProfile
);

// Route pour obtenir les statistiques d'un utilisateur
router.get('/stats', auth, userController.getUserStats);

// Route pour obtenir l'historique des paris d'un utilisateur
router.get('/bet-history', auth, userController.getBetHistory);

// Route pour obtenir les streamers suivis par un utilisateur
router.get('/following', auth, userController.getFollowingStreamers);

// Route pour suivre un streamer
router.post(
  '/follow/:streamerId',
  auth,
  userController.followStreamer
);

// Route pour ne plus suivre un streamer
router.delete(
  '/follow/:streamerId',
  auth,
  userController.unfollowStreamer
);

// Route pour obtenir la liste des streamers populaires
router.get('/popular-streamers', userController.getPopularStreamers);

module.exports = router;
