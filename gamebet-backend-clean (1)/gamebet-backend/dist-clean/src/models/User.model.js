const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['viewer', 'streamer'],
    required: true
  },
  profilePicture: {
    type: String,
    default: 'default-avatar.png'
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  socialLinks: {
    twitch: { type: String, default: '' },
    youtube: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  streamKey: {
    type: String,
    unique: true,
    sparse: true
  },
  isStreaming: {
    type: Boolean,
    default: false
  },
  stats: {
    totalBets: { type: Number, default: 0 },
    wonBets: { type: Number, default: 0 },
    totalWagered: { type: Number, default: 0 },
    totalWon: { type: Number, default: 0 },
    // Pour les streamers
    totalStreams: { type: Number, default: 0 },
    totalStreamTime: { type: Number, default: 0 }, // en minutes
    totalViewers: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 } // pourcentage
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Méthode pour hacher le mot de passe avant de sauvegarder
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer un token JWT
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, userType: this.userType },
    process.env.JWT_SECRET || 'gamebet_secret_key',
    { expiresIn: '24h' }
  );
};

// Méthode pour générer une clé de stream unique
UserSchema.methods.generateStreamKey = function() {
  const streamKey = require('crypto').randomBytes(20).toString('hex');
  this.streamKey = streamKey;
  return streamKey;
};

module.exports = mongoose.model('User', UserSchema);
