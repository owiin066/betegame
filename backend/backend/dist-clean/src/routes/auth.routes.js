const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validator');

// Route d'inscription
router.post(
  '/register',
  [
    check('username', 'Le nom d\'utilisateur est requis').not().isEmpty(),
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Veuillez entrer un mot de passe avec 6 caractères ou plus').isLength({ min: 6 }),
    check('userType', 'Le type d\'utilisateur doit être "viewer" ou "streamer"').isIn(['viewer', 'streamer'])
  ],
  validateRequest,
  authController.register
);

// Route de connexion
router.post(
  '/login',
  [
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Le mot de passe est requis').exists()
  ],
  validateRequest,
  authController.login
);

// Route pour obtenir le profil de l'utilisateur actuel
router.get('/me', authController.getUserProfile);

module.exports = router;
