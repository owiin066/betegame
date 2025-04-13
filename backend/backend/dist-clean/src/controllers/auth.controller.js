const User = require('../models/User.model');
const Wallet = require('../models/Wallet.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/auth.config');

// Fonction d'inscription
exports.register = async (req, res) => {
  try {
    // Récupérer les données du formulaire d'inscription
    const { username, email, password, userType } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      $or: [
        { username: username },
        { email: email }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "L'utilisateur existe déjà" 
      });
    }
    
    // Créer un nouvel utilisateur avec des statistiques initialisées à zéro
    const user = new User({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
      userType: userType || 'viewer',
      createdAt: new Date(),
      profilePicture: 'default-avatar.png',
      bio: '',
      socialLinks: {
        twitch: '',
        youtube: '',
        twitter: '',
        instagram: ''
      },
      following: [],
      followers: [],
      stats: {
        totalBets: 0,
        wonBets: 0,
        totalWagered: 0,
        totalWon: 0,
        totalStreams: 0,
        totalStreamTime: 0,
        totalViewers: 0,
        winRate: 0
      }
    });
    
    // Sauvegarder l'utilisateur dans la base de données
    await user.save();
    
    // Créer un portefeuille vide pour le nouvel utilisateur
    const wallet = new Wallet({
      userId: user._id,
      balance: 0,
      transactions: [] // Aucune transaction initiale
    });
    
    await wallet.save();
    
    // Générer un token JWT
    const token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // 24 heures
    });
    
    // Renvoyer les informations de l'utilisateur et le token
    res.status(201).json({
      success: true,
      message: "Utilisateur enregistré avec succès",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt
      },
      token: token
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ 
      success: false,
      message: "Une erreur est survenue lors de l'inscription" 
    });
  }
};

// Fonction de connexion
exports.login = async (req, res) => {
  try {
    // Récupérer les données du formulaire de connexion
    const { username, email, password, userType } = req.body;
    
    // Rechercher l'utilisateur par nom d'utilisateur ou email
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }
    
    // Vérifier si le type de compte correspond
    if (user.userType !== userType) {
      return res.status(403).json({
        success: false,
        message: "Type de compte incorrect. Veuillez vous connecter avec le bon type de compte."
      });
    }
    
    // Vérifier le mot de passe
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    
    if (!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: "Mot de passe incorrect"
      });
    }
    
    // Récupérer le portefeuille de l'utilisateur
    const wallet = await Wallet.findOne({ userId: user._id });
    
    // Générer un token JWT
    const token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // 24 heures
    });
    
    // Renvoyer les informations de l'utilisateur et le token
    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
        hasWallet: !!wallet,
        walletBalance: wallet ? wallet.balance : 0
      },
      token: token
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ 
      success: false,
      message: "Une erreur est survenue lors de la connexion" 
    });
  }
};

// Fonction pour récupérer les informations de l'utilisateur connecté
exports.getUserProfile = async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur à partir du token JWT
    const userId = req.userId;
    
    // Rechercher l'utilisateur dans la base de données
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }
    
    // Récupérer le portefeuille de l'utilisateur
    const wallet = await Wallet.findOne({ userId: user._id });
    
    // Renvoyer les informations de l'utilisateur
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
        profilePicture: user.profilePicture,
        bio: user.bio,
        socialLinks: user.socialLinks,
        following: user.following,
        followers: user.followers,
        stats: user.stats,
        hasWallet: !!wallet,
        walletBalance: wallet ? wallet.balance : 0
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({ 
      success: false,
      message: "Une erreur est survenue lors de la récupération du profil" 
    });
  }
};

// Fonction pour mettre à jour le profil de l'utilisateur
exports.updateUserProfile = async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur à partir du token JWT
    const userId = req.userId;
    
    // Récupérer les données du formulaire de mise à jour
    const { bio, socialLinks } = req.body;
    
    // Mettre à jour l'utilisateur dans la base de données
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        bio: bio,
        socialLinks: socialLinks
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }
    
    // Renvoyer les informations de l'utilisateur mises à jour
    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      user: updatedUser
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({ 
      success: false,
      message: "Une erreur est survenue lors de la mise à jour du profil" 
    });
  }
};

// Fonction pour changer le mot de passe
exports.changePassword = async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur à partir du token JWT
    const userId = req.userId;
    
    // Récupérer les données du formulaire de changement de mot de passe
    const { currentPassword, newPassword } = req.body;
    
    // Rechercher l'utilisateur dans la base de données
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Utilisateur non trouvé" 
      });
    }
    
    // Vérifier le mot de passe actuel
    const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);
    
    if (!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: "Mot de passe actuel incorrect"
      });
    }
    
    // Mettre à jour le mot de passe
    user.password = bcrypt.hashSync(newPassword, 8);
    await user.save();
    
    // Renvoyer un message de succès
    res.status(200).json({
      success: true,
      message: "Mot de passe changé avec succès"
    });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    res.status(500).json({ 
      success: false,
      message: "Une erreur est survenue lors du changement de mot de passe" 
    });
  }
};
