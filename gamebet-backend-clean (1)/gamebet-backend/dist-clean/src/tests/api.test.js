const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User.model');
const Wallet = require('../models/Wallet.model');
const Stream = require('../models/Stream.model');
const Bet = require('../models/Bet.model');

// Configuration pour les tests
beforeAll(async () => {
  // Connexion à la base de données de test
  const mongoURI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/gamebet_test';
  await mongoose.connect(mongoURI);
  
  // Nettoyer la base de données avant les tests
  await User.deleteMany({});
  await Wallet.deleteMany({});
  await Stream.deleteMany({});
  await Bet.deleteMany({});
});

afterAll(async () => {
  // Fermer la connexion à la base de données après les tests
  await mongoose.connection.close();
});

describe('API d\'authentification', () => {
  let token;
  
  test('Inscription d\'un utilisateur', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        userType: 'viewer'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('username', 'testuser');
    
    token = res.body.token;
  });
  
  test('Connexion d\'un utilisateur', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('username', 'testuser');
  });
  
  test('Récupération de l\'utilisateur actuel', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('x-auth-token', token);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username', 'testuser');
  });
});

describe('API de gestion des profils', () => {
  let token;
  let userId;
  
  beforeAll(async () => {
    // Créer un utilisateur pour les tests
    const user = new User({
      username: 'profileuser',
      email: 'profile@example.com',
      password: 'password123',
      userType: 'viewer'
    });
    
    await user.save();
    userId = user._id;
    token = user.generateAuthToken();
  });
  
  test('Récupération du profil d\'un utilisateur', async () => {
    const res = await request(app)
      .get(`/api/users/profile/${userId}`)
      .set('x-auth-token', token);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username', 'profileuser');
  });
  
  test('Mise à jour du profil d\'un utilisateur', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('x-auth-token', token)
      .send({
        bio: 'Ceci est ma bio de test'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('bio', 'Ceci est ma bio de test');
  });
});

describe('API de portefeuille', () => {
  let token;
  let userId;
  
  beforeAll(async () => {
    // Créer un utilisateur pour les tests
    const user = new User({
      username: 'walletuser',
      email: 'wallet@example.com',
      password: 'password123',
      userType: 'viewer'
    });
    
    await user.save();
    userId = user._id;
    token = user.generateAuthToken();
    
    // Créer un portefeuille pour l'utilisateur
    const wallet = new Wallet({
      user: userId,
      balance: 100
    });
    
    await wallet.save();
  });
  
  test('Récupération du solde du portefeuille', async () => {
    const res = await request(app)
      .get('/api/wallet/balance')
      .set('x-auth-token', token);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('balance', 100);
  });
  
  test('Effectuer un dépôt', async () => {
    const res = await request(app)
      .post('/api/wallet/deposit')
      .set('x-auth-token', token)
      .send({
        amount: 50,
        paymentMethod: 'card'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('balance', 150);
  });
});

describe('API de streaming', () => {
  let streamerToken;
  let streamerId;
  let streamId;
  
  beforeAll(async () => {
    // Créer un streamer pour les tests
    const streamer = new User({
      username: 'teststreamer',
      email: 'streamer@example.com',
      password: 'password123',
      userType: 'streamer',
      streamKey: 'test-stream-key'
    });
    
    await streamer.save();
    streamerId = streamer._id;
    streamerToken = streamer.generateAuthToken();
  });
  
  test('Démarrage d\'un stream', async () => {
    const res = await request(app)
      .post('/api/streams/start')
      .set('x-auth-token', streamerToken)
      .send({
        title: 'Test Stream',
        game: 'Test Game',
        description: 'This is a test stream'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'Test Stream');
    expect(res.body).toHaveProperty('isLive', true);
    
    streamId = res.body._id;
  });
  
  test('Récupération des streams en direct', async () => {
    const res = await request(app)
      .get('/api/streams/live');
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Mise à jour d\'un stream', async () => {
    const res = await request(app)
      .put(`/api/streams/${streamId}`)
      .set('x-auth-token', streamerToken)
      .send({
        title: 'Updated Test Stream'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', 'Updated Test Stream');
  });
});

describe('API de paris', () => {
  let viewerToken;
  let viewerId;
  let streamerToken;
  let streamerId;
  let streamId;
  
  beforeAll(async () => {
    // Créer un viewer pour les tests
    const viewer = new User({
      username: 'testviewer',
      email: 'viewer@example.com',
      password: 'password123',
      userType: 'viewer'
    });
    
    await viewer.save();
    viewerId = viewer._id;
    viewerToken = viewer.generateAuthToken();
    
    // Créer un portefeuille pour le viewer
    const wallet = new Wallet({
      user: viewerId,
      balance: 100
    });
    
    await wallet.save();
    
    // Créer un streamer pour les tests
    const streamer = new User({
      username: 'betstreamer',
      email: 'betstreamer@example.com',
      password: 'password123',
      userType: 'streamer',
      streamKey: 'bet-stream-key'
    });
    
    await streamer.save();
    streamerId = streamer._id;
    streamerToken = streamer.generateAuthToken();
    
    // Créer un stream pour les tests
    const stream = new Stream({
      streamer: streamerId,
      title: 'Bet Test Stream',
      game: 'Test Game',
      isLive: true,
      bettingStatus: 'open',
      currentOdds: 2.0
    });
    
    await stream.save();
    streamId = stream._id;
  });
  
  test('Placement d\'un pari', async () => {
    const res = await request(app)
      .post('/api/bets/place')
      .set('x-auth-token', viewerToken)
      .send({
        streamId,
        amount: 10,
        betType: 'win'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Pari placé avec succès');
    expect(res.body.bet).toHaveProperty('amount', 10);
    expect(res.body.bet).toHaveProperty('betType', 'win');
  });
  
  test('Récupération des paris actifs', async () => {
    const res = await request(app)
      .get('/api/bets/active')
      .set('x-auth-token', viewerToken);
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Fermeture des paris', async () => {
    const res = await request(app)
      .post('/api/bets/close')
      .set('x-auth-token', streamerToken)
      .send({
        streamId
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Paris fermés avec succès');
  });
  
  test('Confirmation du résultat', async () => {
    const res = await request(app)
      .post('/api/bets/result')
      .set('x-auth-token', streamerToken)
      .send({
        streamId,
        result: 'win'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Résultat confirmé et gains distribués avec succès');
  });
});

describe('API de vérification par IA', () => {
  let streamerToken;
  let streamerId;
  let streamId;
  
  beforeAll(async () => {
    // Créer un streamer pour les tests
    const streamer = new User({
      username: 'aistreamer',
      email: 'aistreamer@example.com',
      password: 'password123',
      userType: 'streamer',
      streamKey: 'ai-stream-key'
    });
    
    await streamer.save();
    streamerId = streamer._id;
    streamerToken = streamer.generateAuthToken();
    
    // Créer un stream pour les tests
    const stream = new Stream({
      streamer: streamerId,
      title: 'AI Test Stream',
      game: 'Test Game',
      isLive: true,
      bettingStatus: 'closed'
    });
    
    await stream.save();
    streamId = stream._id;
  });
  
  test('Vérification du résultat d\'un jeu', async () => {
    const res = await request(app)
      .post('/api/ai/verify-result')
      .set('x-auth-token', streamerToken)
      .send({
        streamId,
        imageUrl: 'https://example.com/game-result.jpg'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Résultat vérifié et gains distribués avec succès');
    expect(res.body).toHaveProperty('aiResult');
  });
  
  test('Vérification d\'un stream en direct', async () => {
    const res = await request(app)
      .get(`/api/ai/verify-stream/${streamId}`)
      .set('x-auth-token', streamerToken);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Stream vérifié avec succès');
    expect(res.body).toHaveProperty('aiResult');
  });
  
  test('Détection de triche', async () => {
    const res = await request(app)
      .get(`/api/ai/detect-cheating/${streamId}`)
      .set('x-auth-token', streamerToken);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Détection de triche effectuée');
  });
});
