const express = require('express');
const router = express.Router();

// Importer les routes
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const walletRoutes = require('./wallet.routes');
const streamRoutes = require('./stream.routes');
const betRoutes = require('./bet.routes');
const aiRoutes = require('./ai.routes');

// Définir les routes principales
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wallet', walletRoutes);
router.use('/streams', streamRoutes);
router.use('/bets', betRoutes);
router.use('/ai', aiRoutes);

// Route de base pour vérifier que l'API fonctionne
router.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API GameBet' });
});

module.exports = router;
