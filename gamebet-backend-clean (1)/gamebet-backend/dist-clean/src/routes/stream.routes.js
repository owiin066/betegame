const express = require('express');
const router = express.Router();
const streamController = require('../controllers/stream.controller');
const { auth, streamerOnly } = require('../middleware/auth');
const { check } = require('express-validator');
const { validateRequest } = require('../middleware/validator');

// Routes accessibles à tous les utilisateurs
// Obtenir tous les streams en direct
router.get('/live', streamController.getLiveStreams);

// Obtenir les détails d'un stream spécifique
router.get('/:id', streamController.getStreamById);

// Routes accessibles uniquement aux streamers authentifiés
// Obtenir la clé de streaming
router.get('/key', [auth, streamerOnly], streamController.getStreamKey);

// Régénérer la clé de streaming
router.post('/key/regenerate', [auth, streamerOnly], streamController.regenerateStreamKey);

// Démarrer un stream
router.post(
  '/start',
  [
    auth,
    streamerOnly,
    check('title', 'Le titre du stream est requis').not().isEmpty(),
    check('game', 'Le jeu est requis').not().isEmpty(),
    check('description', 'La description ne peut pas dépasser 500 caractères').optional().isLength({ max: 500 })
  ],
  validateRequest,
  streamController.startStream
);

// Terminer un stream
router.post('/end/:id', [auth, streamerOnly], streamController.endStream);

// Mettre à jour les informations d'un stream
router.put(
  '/:id',
  [
    auth,
    streamerOnly,
    check('title', 'Le titre du stream est requis').optional(),
    check('game', 'Le jeu est requis').optional(),
    check('description', 'La description ne peut pas dépasser 500 caractères').optional().isLength({ max: 500 })
  ],
  validateRequest,
  streamController.updateStream
);

// Obtenir l'historique des streams d'un streamer
router.get('/history', [auth, streamerOnly], streamController.getStreamHistory);

// Obtenir les statistiques des streams d'un streamer
router.get('/stats', [auth, streamerOnly], streamController.getStreamStats);

module.exports = router;
