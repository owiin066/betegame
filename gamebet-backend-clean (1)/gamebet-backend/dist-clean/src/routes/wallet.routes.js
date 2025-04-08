const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { auth } = require('../middleware/auth');
const { check } = require('express-validator');
const { validateRequest } = require('../middleware/validator');

// Route pour obtenir le solde du portefeuille
router.get('/balance', auth, walletController.getBalance);

// Route pour obtenir l'historique des transactions
router.get('/transactions', auth, walletController.getTransactions);

// Route pour effectuer un dépôt
router.post(
  '/deposit',
  [
    auth,
    check('amount', 'Le montant doit être un nombre positif').isFloat({ min: 10 }),
    check('paymentMethod', 'La méthode de paiement est requise').isIn(['card', 'paypal', 'crypto'])
  ],
  validateRequest,
  walletController.deposit
);

// Route pour effectuer un retrait
router.post(
  '/withdraw',
  [
    auth,
    check('amount', 'Le montant doit être un nombre positif').isFloat({ min: 10 }),
    check('withdrawalMethod', 'La méthode de retrait est requise').isIn(['bank', 'paypal', 'crypto']),
    check('accountDetails', 'Les détails du compte sont requis').not().isEmpty()
  ],
  validateRequest,
  walletController.withdraw
);

// Route pour transférer des fonds entre utilisateurs
router.post(
  '/transfer',
  [
    auth,
    check('recipientId', 'L\'ID du destinataire est requis').not().isEmpty(),
    check('amount', 'Le montant doit être un nombre positif').isFloat({ min: 1 }),
    check('message', 'Le message ne peut pas dépasser 200 caractères').optional().isLength({ max: 200 })
  ],
  validateRequest,
  walletController.transfer
);

module.exports = router;
