const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: [{
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'bet', 'win', 'commission', 'transfer'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    reference: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'paypal', 'crypto', 'bank'],
      required: true
    },
    details: {
      type: Object,
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Méthode pour ajouter une transaction
WalletSchema.methods.addTransaction = async function(type, amount, description, reference = '') {
  this.transactions.push({
    type,
    amount,
    description,
    reference,
    status: 'completed',
    createdAt: Date.now()
  });
  
  // Mettre à jour le solde en fonction du type de transaction
  if (type === 'deposit' || type === 'win' || type === 'commission') {
    this.balance += amount;
  } else if (type === 'withdraw' || type === 'bet' || type === 'transfer') {
    this.balance -= amount;
  }
  
  this.updatedAt = Date.now();
  return await this.save();
};

// Méthode pour vérifier si le solde est suffisant
WalletSchema.methods.hasSufficientFunds = function(amount) {
  return this.balance >= amount;
};

// Méthode pour ajouter une méthode de paiement
WalletSchema.methods.addPaymentMethod = async function(type, details, isDefault = false) {
  // Si la nouvelle méthode est définie comme par défaut, mettre à jour les autres
  if (isDefault) {
    this.paymentMethods.forEach(method => {
      method.isDefault = false;
    });
  }
  
  this.paymentMethods.push({
    type,
    details,
    isDefault,
    createdAt: Date.now()
  });
  
  this.updatedAt = Date.now();
  return await this.save();
};

module.exports = mongoose.model('Wallet', WalletSchema);
