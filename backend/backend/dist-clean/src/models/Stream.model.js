const mongoose = require('mongoose');

const StreamSchema = new mongoose.Schema({
  streamer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  game: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  thumbnail: {
    type: String,
    default: 'default-thumbnail.jpg'
  },
  isLive: {
    type: Boolean,
    default: true
  },
  viewers: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // en minutes
    default: 0
  },
  bettingStatus: {
    type: String,
    enum: ['open', 'closed', 'settled'],
    default: 'closed'
  },
  currentOdds: {
    type: Number,
    default: 2.0
  },
  totalBets: {
    type: Number,
    default: 0
  },
  totalBetAmount: {
    type: Number,
    default: 0
  },
  result: {
    type: String,
    enum: ['win', 'lose', 'pending'],
    default: 'pending'
  },
  streamKey: {
    type: String,
    unique: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  chat: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 200
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

// Méthode pour ajouter un message au chat
StreamSchema.methods.addChatMessage = async function(userId, username, message) {
  this.chat.push({
    user: userId,
    username,
    message,
    timestamp: Date.now()
  });
  
  return await this.save();
};

// Méthode pour mettre à jour le nombre de spectateurs
StreamSchema.methods.updateViewers = async function(count) {
  this.viewers = count;
  return await this.save();
};

// Méthode pour ouvrir les paris
StreamSchema.methods.openBetting = async function(odds) {
  this.bettingStatus = 'open';
  this.currentOdds = odds || this.currentOdds;
  return await this.save();
};

// Méthode pour fermer les paris
StreamSchema.methods.closeBetting = async function() {
  this.bettingStatus = 'closed';
  return await this.save();
};

// Méthode pour définir le résultat du stream
StreamSchema.methods.setResult = async function(result) {
  this.result = result;
  this.bettingStatus = 'settled';
  return await this.save();
};

// Méthode pour terminer le stream
StreamSchema.methods.endStream = async function() {
  this.isLive = false;
  this.endTime = Date.now();
  this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // Durée en minutes
  return await this.save();
};

module.exports = mongoose.model('Stream', StreamSchema);
