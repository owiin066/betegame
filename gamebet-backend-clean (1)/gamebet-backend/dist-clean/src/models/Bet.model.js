const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stream: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stream',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  odds: {
    type: Number,
    required: true,
    min: 1
  },
  betType: {
    type: String,
    enum: ['win', 'lose'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'won', 'lost', 'cancelled', 'refunded'],
    default: 'active'
  },
  potentialWinnings: {
    type: Number,
    required: true
  },
  actualWinnings: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  settledAt: {
    type: Date
  }
});

// Méthode pour calculer les gains potentiels
BetSchema.methods.calculatePotentialWinnings = function() {
  return this.amount * this.odds;
};

// Méthode pour marquer le pari comme gagné
BetSchema.methods.markAsWon = async function() {
  this.status = 'won';
  this.actualWinnings = this.potentialWinnings;
  this.settledAt = Date.now();
  return await this.save();
};

// Méthode pour marquer le pari comme perdu
BetSchema.methods.markAsLost = async function() {
  this.status = 'lost';
  this.actualWinnings = 0;
  this.settledAt = Date.now();
  return await this.save();
};

// Méthode pour annuler le pari
BetSchema.methods.cancel = async function() {
  this.status = 'cancelled';
  this.actualWinnings = 0;
  this.settledAt = Date.now();
  return await this.save();
};

// Méthode pour rembourser le pari
BetSchema.methods.refund = async function() {
  this.status = 'refunded';
  this.actualWinnings = this.amount; // Remboursement du montant initial
  this.settledAt = Date.now();
  return await this.save();
};

module.exports = mongoose.model('Bet', BetSchema);
