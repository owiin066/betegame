const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { auth, streamerOnly } = require('../middleware/auth');
const { check } = require('express-validator');
const { validateRequest } = require('../middleware/validator');

// Route pour vérifier le résultat d'un jeu
router.post(
  '/verify-result',
  [
    auth,
    streamerOnly,
    check('streamId', 'L\'ID du stream est requis').not().isEmpty(),
    check('imageUrl', 'L\'URL de l\'image est requise').isURL()
  ],
  validateRequest,
  aiController.verifyGameResult
);

// Route pour vérifier un stream en direct
router.get(
  '/verify-stream/:streamId',
  auth,
  aiController.verifyLiveStream
);

// Route pour détecter la triche
router.get(
  '/detect-cheating/:streamId',
  auth,
  aiController.detectCheating
);

module.exports = router;
