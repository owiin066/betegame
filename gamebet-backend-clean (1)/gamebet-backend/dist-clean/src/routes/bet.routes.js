const express = require('express');
const router = express.Router();
const betController = require('../controllers/bet.controller');
const { auth } = require('../middleware/auth');
const { streamerOnly } = require('../middleware/auth');
const { check } = require('express-validator');
const { validateRequest } = require('../middleware/validator');

// Routes pour les parieurs (viewers)
// Placer un pari
router.post(
  '/place',
  [
    auth,
    check('streamId', 'L\'ID du stream est requis').not().isEmpty(),
    check('amount', 'Le montant doit être un nombre positif').isFloat({ min: 1 }),
    check('betType', 'Le type de pari est requis').isIn(['win', 'lose'])
  ],
  validateRequest,
  betController.placeBet
);

// Obtenir les paris actifs d'un utilisateur
router.get('/active', auth, betController.getActiveBets);

// Obtenir l'historique des paris d'un utilisateur
router.get('/history', auth, betController.getBetHistory);

// Obtenir les détails d'un pari spécifique
router.get('/:id', auth, betController.getBetById);

// Routes pour les streamers
// Ouvrir les paris pour un stream
router.post(
  '/open',
  [
    auth,
    streamerOnly,
    check('streamId', 'L\'ID du stream est requis').not().isEmpty(),
    check('odds', 'Les cotes doivent être un nombre positif').isFloat({ min: 1 }),
    check('duration', 'La durée doit être un nombre positif en minutes').optional().isInt({ min: 1 })
  ],
  validateRequest,
  betController.openBets
);

// Fermer les paris pour un stream
router.post(
  '/close',
  [
    auth,
    streamerOnly,
    check('streamId', 'L\'ID du stream est requis').not().isEmpty()
  ],
  validateRequest,
  betController.closeBets
);

// Confirmer le résultat d'un stream et distribuer les gains
router.post(
  '/result',
  [
    auth,
    streamerOnly,
    check('streamId', 'L\'ID du stream est requis').not().isEmpty(),
    check('result', 'Le résultat doit être "win" ou "lose"').isIn(['win', 'lose'])
  ],
  validateRequest,
  betController.confirmResult
);

// Obtenir les statistiques des paris pour un streamer
router.get('/stats', [auth, streamerOnly], betController.getBetStats);

module.exports = router;
