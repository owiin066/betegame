const axios = require('axios');

// Configuration de base pour les requêtes API
const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api';

// Service d'authentification
const AuthService = {
  // Inscription d'un utilisateur
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Connexion d'un utilisateur
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Déconnexion d'un utilisateur
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Récupération de l'utilisateur actuel
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Vérification si l'utilisateur est connecté
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  // Vérification si l'utilisateur est un streamer
  isStreamer: () => {
    const user = AuthService.getCurrentUser();
    return user && user.userType === 'streamer';
  },

  // Récupération du token d'authentification
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Rafraîchissement du token
  refreshToken: async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
};

// Service de gestion des utilisateurs
const UserService = {
  // Récupération du profil d'un utilisateur
  getProfile: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/profile/${userId}`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Mise à jour du profil d'un utilisateur
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/users/profile`, profileData, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Récupération des statistiques d'un utilisateur
  getStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/users/stats`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Récupération de l'historique des paris d'un utilisateur
  getBetHistory: async () => {
    try {
      const response = await axios.get(`${API_URL}/users/bet-history`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Récupération des streamers suivis par un utilisateur
  getFollowingStreamers: async () => {
    try {
      const response = await axios.get(`${API_URL}/users/following`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Suivre un streamer
  followStreamer: async (streamerId) => {
    try {
      const response = await axios.post(`${API_URL}/users/follow/${streamerId}`, {}, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Ne plus suivre un streamer
  unfollowStreamer: async (streamerId) => {
    try {
      const response = await axios.delete(`${API_URL}/users/follow/${streamerId}`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Récupération des streamers populaires
  getPopularStreamers: async () => {
    try {
      const response = await axios.get(`${API_URL}/users/popular-streamers`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
};

// Service de gestion du portefeuille
const WalletService = {
  // Récupération du solde du portefeuille
  getBalance: async () => {
    try {
      const response = await axios.get(`${API_URL}/wallet/balance`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Récupération de l'historique des transactions
  getTransactions: async () => {
    try {
      const response = await axios.get(`${API_URL}/wallet/transactions`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Effectuer un dépôt
  deposit: async (amount, paymentMethod) => {
    try {
      const response = await axios.post(`${API_URL}/wallet/deposit`, {
        amount,
        paymentMethod
      }, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Effectuer un retrait
  withdraw: async (amount, withdrawalMethod, accountDetails) => {
    try {
      const response = await axios.post(`${API_URL}/wallet/withdraw`, {
        amount,
        withdrawalMethod,
        accountDetails
      }, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Transférer des fonds
  transfer: async (recipientId, amount, message) => {
    try {
      const response = await axios.post(`${API_URL}/wallet/transfer`, {
        recipientId,
        amount,
        message
      }, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
};

// Service de gestion des streams
const StreamService = {
  // Récupération des streams en direct
  getLiveStreams: async () => {
    try {
      const response = await axios.get(`${API_URL}/streams/live`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Récupération des détails d'un stream
  getStreamById: async (streamId) => {
    try {
      const response = await axios.get(`${API_URL}/streams/${streamId}`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Récupération de la clé de streaming
  getStreamKey: async () => {
    try {
      const response = await axios.get(`${API_URL}/streams/key`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Régénération de la clé de streaming
  regenerateStreamKey: async () => {
    try {
      const response = await axios.post(`${API_URL}/streams/key/regenerate`, {}, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Démarrage d'un stream
  startStream: async (streamData) => {
    try {
      const response = await axios.post(`${API_URL}/streams/start`, streamData, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Fin d'un stream
  endStream: async (streamId) => {
    try {
      const response = await axios.post(`${API_URL}/streams/end/${streamId}`, {}, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Mise à jour d'un stream
  updateStream: async (streamId, streamData) => {
    try {
      const response = await axios.put(`${API_URL}/streams/${streamId}`, streamData, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Récupération de l'historique des streams
  getStreamHistory: async () => {
    try {
      const response = await axios.get(`${API_URL}/streams/history`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Récupération des statistiques des streams
  getStreamStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/streams/stats`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
};

// Service de gestion des paris
const BetService = {
  // Placement d'un pari
  placeBet: async (betData) => {
    try {
      const response = await axios.post(`${API_URL}/bets/place`, betData, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Récupération des paris actifs
  getActiveBets: async () => {
    try {
      const response = await axios.get(`${API_URL}/bets/active`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Récupération de l'historique des paris
  getBetHistory: async () => {
    try {
      const response = await axios.get(`${API_URL}/bets/history`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Récupération des détails d'un pari
  getBetById: async (betId) => {
    try {
      const response = await axios.get(`${API_URL}/bets/${betId}`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Ouverture des paris pour un stream
  openBets: async (streamId, odds, duration) => {
    try {
      const response = await axios.post(`${API_URL}/bets/open`, {
        streamId,
        odds,
        duration
      }, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Fermeture des paris pour un stream
  closeBets: async (streamId) => {
    try {
      const response = await axios.post(`${API_URL}/bets/close`, {
        streamId
      }, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Confirmation du résultat d'un stream
  confirmResult: async (streamId, result) => {
    try {
      const response = await axios.post(`${API_URL}/bets/result`, {
        streamId,
        result
      }, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Récupération des statistiques des paris
  getBetStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/bets/stats`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
};

// Service de vérification par IA
const AIService = {
  // Vérification du résultat d'un jeu
  verifyGameResult: async (streamId, imageUrl) => {
    try {
      const response = await axios.post(`${API_URL}/ai/verify-result`, {
        streamId,
        imageUrl
      }, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Vérification d'un stream en direct
  verifyLiveStream: async (streamId) => {
    try {
      const response = await axios.get(`${API_URL}/ai/verify-stream/${streamId}`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  },

  // Détection de triche
  detectCheating: async (streamId) => {
    try {
      const response = await axios.get(`${API_URL}/ai/detect-cheating/${streamId}`, {
        headers: { 'x-auth-token': AuthService.getToken() }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
};

// Configuration d'Axios pour inclure le token dans toutes les requêtes
axios.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await AuthService.refreshToken();
        return axios(originalRequest);
      } catch (refreshError) {
        AuthService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export {
  AuthService,
  UserService,
  WalletService,
  StreamService,
  BetService,
  AIService
};
