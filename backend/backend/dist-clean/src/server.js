require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http') ;
const socketIo = require('socket.io');
const routes = require('./routes');

// Importation correcte du middleware errorHandler (sans déstructuration)
const errorHandler = require('./middleware/errorHandler');

// Initialisation de l'application Express
const app = express();
const server = http.createServer(app) ;
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true
  }
}) ;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}) );
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rendre l'instance io disponible pour nos routes
app.set('io', io);

// Routes
app.use('/api', routes);

// Middleware de gestion des erreurs (utilisé correctement)
app.use(errorHandler);

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamebet')
  .then(() => console.log('Connexion à MongoDB établie'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Configuration des événements Socket.io
io.on('connection', (socket) => {
  console.log('Nouvelle connexion socket:', socket.id);
  
  // Événement pour rejoindre une salle de stream
  socket.on('join-stream', (streamId) => {
    socket.join(`stream-${streamId}`);
    console.log(`Socket ${socket.id} a rejoint le stream ${streamId}`);
  });
  
  // Événement pour quitter une salle de stream
  socket.on('leave-stream', (streamId) => {
    socket.leave(`stream-${streamId}`);
    console.log(`Socket ${socket.id} a quitté le stream ${streamId}`);
  });
  
  // Événement de déconnexion
  socket.on('disconnect', () => {
    console.log('Socket déconnecté:', socket.id);
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = { app, server, io };
