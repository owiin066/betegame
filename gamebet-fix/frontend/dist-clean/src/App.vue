<template>
  <div id="app">
    <header>
      <nav class="navbar">
        <div class="logo">
          <router-link to="/">GAMEBet</router-link>
        </div>
        <div class="search-bar">
          <input type="text" placeholder="Rechercher un streamer..." />
          <button>🔍</button>
        </div>
        <div class="nav-links">
          <template v-if="isAuthenticated">
            <router-link to="/profile">👤 Mon Profil</router-link>
            <router-link to="/wallet">💰 Mon Portefeuille</router-link>
            <router-link v-if="isStreamer" to="/streamer">🎮 Espace Streamers</router-link>
            <button @click="logout" class="auth-button">Déconnexion</button>
          </template>
          <template v-else>
            <router-link to="/login" class="auth-button">Connexion</router-link>
            <router-link to="/register" class="auth-button">S'inscrire</router-link>
          </template>
        </div>
      </nav>
    </header>
    
    <main>
      <router-view />
    </main>
    
    <footer>
      <div class="footer-section">
        <h3>GameBet</h3>
        <ul>
          <li><router-link to="/about">À propos</router-link></li>
          <li><router-link to="/how-it-works">Comment ça marche</router-link></li>
          <li><router-link to="/become-streamer">Devenir streamer</router-link></li>
          <li><router-link to="/careers">Carrières</router-link></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Liens utiles</h3>
        <ul>
          <li><router-link to="/terms">CGU</router-link></li>
          <li><router-link to="/privacy">Politique de confidentialité</router-link></li>
          <li><router-link to="/faq">FAQ</router-link></li>
          <li><router-link to="/contact">Contact</router-link></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Suivez-nous</h3>
        <div class="social-links">
          <a href="#" target="_blank">f</a>
          <a href="#" target="_blank">t</a>
          <a href="#" target="_blank">i</a>
        </div>
      </div>
      
      <div class="copyright">
        © 2025 GameBet. Tous droits réservés.
      </div>
    </footer>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'App',
  computed: {
    ...mapGetters(['isAuthenticated', 'isStreamer'])
  },
  methods: {
    ...mapActions(['logout'])
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #0f0b1e;
  color: #ffffff;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #1a1333;
}

.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #8c52ff;
  text-decoration: none;
}

.search-bar {
  display: flex;
  align-items: center;
}

.search-bar input {
  padding: 0.5rem;
  border: none;
  border-radius: 4px 0 0 4px;
  background-color: #2c2541;
  color: #ffffff;
}

.search-bar button {
  padding: 0.5rem;
  border: none;
  border-radius: 0 4px 4px 0;
  background-color: #8c52ff;
  color: #ffffff;
  cursor: pointer;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-links a {
  color: #ffffff;
  text-decoration: none;
}

.auth-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #8c52ff;
  color: #ffffff;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
}

main {
  flex: 1;
  padding: 2rem;
}

footer {
  background-color: #1a1333;
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.footer-section h3 {
  margin-bottom: 1rem;
  color: #8c52ff;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section ul li a {
  color: #ffffff;
  text-decoration: none;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2c2541;
  color: #ffffff;
  text-decoration: none;
}

.copyright {
  grid-column: 1 / -1;
  text-align: center;
  margin-top: 2rem;
  color: #8c8a97;
}
</style>
