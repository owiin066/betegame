const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

// Contrôleur pour l'inscription
exports.register = async (req, res) => {
  try {
    const { username, email, password, userType } = req.body;

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    // Vérifier si le nom d'utilisateur est déjà pris
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
    }

    // Créer un nouvel utilisateur
    user = new User({
      username,
      email,
      password,
      userType
    });

    // Si c'est un streamer, générer une clé de stream
    if (userType === 'streamer') {
      user.generateStreamKey();
    }

    // Sauvegarder l'utilisateur dans la base de données
    await user.save();

    // Générer un token JWT
    const token = user.generateAuthToken();

    // Renvoyer le token et les informations de l'utilisateur
    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour la connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Mettre à jour la date de dernière connexion
    user.lastLogin = Date.now();
    await user.save();

    // Générer un token JWT
    const token = user.generateAuthToken();

    // Renvoyer le token et les informations de l'utilisateur
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (err) {
    console.error('Erreur lors de la connexion:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Contrôleur pour obtenir l'utilisateur actuel
exports.getMe = async (req, res) => {
  try {
    // Vérifier si le token est présent dans les headers
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'Aucun token, autorisation refusée' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gamebet_secret_key');
    
    // Trouver l'utilisateur
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token invalide' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err.message);
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Contrôleur pour la déconnexion
exports.logout = (req, res) => {
  // Dans une implémentation JWT, la déconnexion se fait côté client
  // en supprimant le token, mais nous pouvons ajouter une logique supplémentaire ici
  res.json({ message: 'Déconnexion réussie' });
};

// Contrôleur pour rafraîchir le token
exports.refreshToken = async (req, res) => {
  try {
    // Vérifier si le token est présent dans les headers
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'Aucun token, autorisation refusée' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gamebet_secret_key');
    
    // Trouver l'utilisateur
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token invalide' });
    }
    
    // Générer un nouveau token
    const newToken = user.generateAuthToken();
    
    res.json({ token: newToken });
  } catch (err) {
    console.error('Erreur lors du rafraîchissement du token:', err.message);
    res.status(401).json({ message: 'Token invalide' });
  }
};
