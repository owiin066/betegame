const Wallet = require('../models/Wallet.model');
const User = require('../models/User.model');
const mongoose = require('mongoose');

// Contrôleur pour obtenir le solde du portefeuille
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver le portefeuille de l'utilisateur
    let wallet = await Wallet.findOne({ user: userId });

    // Si le portefeuille n'existe pas, en créer un nouveau
    if (!wallet) {
      wallet = new Wallet({ user: userId, balance: 0 });
      await wallet.save();
    }

    res.json({ balance: wallet.balance });
  } catch (err) {
    console.error('Erreur lors de la récupération du solde:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir l'historique des transactions
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver le portefeuille de l'utilisateur
    const wallet = await Wallet.findOne({ user: userId });

    // Si le portefeuille n'existe pas, renvoyer un tableau vide
    if (!wallet) {
      return res.json({ transactions: [] });
    }

    // Trier les transactions par date (les plus récentes d'abord)
    const transactions = wallet.transactions.sort((a, b) => b.createdAt - a.createdAt);

    res.json({ transactions });
  } catch (err) {
    console.error('Erreur lors de la récupération des transactions:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour effectuer un dépôt
exports.deposit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, paymentMethod } = req.body;

    // Vérifier si le montant est valide
    if (amount <= 0) {
      return res.status(400).json({ message: 'Le montant doit être supérieur à 0' });
    }

    // Trouver le portefeuille de l'utilisateur
    let wallet = await Wallet.findOne({ user: userId });

    // Si le portefeuille n'existe pas, en créer un nouveau
    if (!wallet) {
      wallet = new Wallet({ user: userId, balance: 0 });
    }

    // Ajouter la transaction
    await wallet.addTransaction(
      'deposit',
      amount,
      `Dépôt via ${paymentMethod}`,
      `DEP-${Date.now()}`
    );

    res.json({
      message: 'Dépôt effectué avec succès',
      balance: wallet.balance
    });
  } catch (err) {
    console.error('Erreur lors du dépôt:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour effectuer un retrait
exports.withdraw = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, withdrawalMethod, accountDetails } = req.body;

    // Vérifier si le montant est valide
    if (amount <= 0) {
      return res.status(400).json({ message: 'Le montant doit être supérieur à 0' });
    }

    // Trouver le portefeuille de l'utilisateur
    const wallet = await Wallet.findOne({ user: userId });

    // Vérifier si le portefeuille existe
    if (!wallet) {
      return res.status(404).json({ message: 'Portefeuille non trouvé' });
    }

    // Vérifier si le solde est suffisant
    if (!wallet.hasSufficientFunds(amount)) {
      return res.status(400).json({ message: 'Solde insuffisant' });
    }

    // Ajouter la transaction
    await wallet.addTransaction(
      'withdraw',
      amount,
      `Retrait via ${withdrawalMethod}`,
      `WIT-${Date.now()}`
    );

    res.json({
      message: 'Retrait effectué avec succès',
      balance: wallet.balance
    });
  } catch (err) {
    console.error('Erreur lors du retrait:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour transférer des fonds entre utilisateurs
exports.transfer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipientId, amount, message } = req.body;

    // Vérifier si l'ID du destinataire est valide
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: 'ID destinataire invalide' });
    }

    // Vérifier si le montant est valide
    if (amount <= 0) {
      return res.status(400).json({ message: 'Le montant doit être supérieur à 0' });
    }

    // Vérifier si l'utilisateur essaie de se transférer des fonds à lui-même
    if (userId === recipientId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous transférer des fonds à vous-même' });
    }

    // Vérifier si le destinataire existe
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Destinataire non trouvé' });
    }

    // Trouver le portefeuille de l'expéditeur
    const senderWallet = await Wallet.findOne({ user: userId });

    // Vérifier si le portefeuille de l'expéditeur existe
    if (!senderWallet) {
      return res.status(404).json({ message: 'Portefeuille non trouvé' });
    }

    // Vérifier si le solde est suffisant
    if (!senderWallet.hasSufficientFunds(amount)) {
      return res.status(400).json({ message: 'Solde insuffisant' });
    }

    // Trouver ou créer le portefeuille du destinataire
    let recipientWallet = await Wallet.findOne({ user: recipientId });
    if (!recipientWallet) {
      recipientWallet = new Wallet({ user: recipientId, balance: 0 });
    }

    // Créer une référence unique pour la transaction
    const reference = `TRF-${Date.now()}`;

    // Ajouter la transaction au portefeuille de l'expéditeur
    await senderWallet.addTransaction(
      'transfer',
      amount,
      `Transfert à ${recipient.username}${message ? ': ' + message : ''}`,
      reference
    );

    // Ajouter la transaction au portefeuille du destinataire
    await recipientWallet.addTransaction(
      'transfer',
      amount,
      `Transfert de ${req.user.username}${message ? ': ' + message : ''}`,
      reference
    );

    res.json({
      message: 'Transfert effectué avec succès',
      balance: senderWallet.balance
    });
  } catch (err) {
    console.error('Erreur lors du transfert:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
