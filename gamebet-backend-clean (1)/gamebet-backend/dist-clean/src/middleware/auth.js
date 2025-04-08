const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Middleware pour gérer les erreurs de validation
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Middleware d'authentification
exports.auth = async (req, res, next) => {
  try {
    // Vérifier si le token est présent dans les headers
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'Aucun token, autorisation refusée' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gamebet_secret_key');
    
    // Ajouter l'utilisateur à la requête
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token invalide' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error('Erreur dans le middleware d\'authentification:', err.message);
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Middleware pour vérifier si l'utilisateur est un streamer
exports.streamerOnly = (req, res, next) => {
  if (req.user && req.user.userType === 'streamer') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Réservé aux streamers.' });
  }
};

// Middleware pour vérifier si l'utilisateur est un viewer
exports.viewerOnly = (req, res, next) => {
  if (req.user && req.user.userType === 'viewer') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Réservé aux viewers.' });
  }
};
