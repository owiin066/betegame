<template>
  <div class="home-container">
    <section class="hero-section">
      <div class="hero-content">
        <h1>Pariez en direct sur vos streamers préférés</h1>
        <p>Des cotes en temps réel basées sur leurs performances</p>
        <router-link @click.native.prevent="handleCtaClick" class="cta-button">Commencer à parier</router-link>
      </div>
    </section>
    
    <!-- Intégration du composant StreamPlayer -->
    <section class="stream-player-section">
      <h2>Regardez les streams en direct</h2>
      <StreamPlayer />
    </section>
    
    <section v-if="hasLiveStreams || isLoading" class="live-streams-section">
      <h2>Streams en direct avec cotes en temps réel</h2>
      <div v-if="isLoading" class="loading-indicator">Chargement des streams en direct...</div>
      <div v-else-if="!hasLiveStreams" class="empty-state">
        Aucun stream en direct pour le moment. Revenez plus tard !
      </div>
      <div v-else class="streams-grid">
        <div v-for="(stream, index) in liveStreams" :key="index" class="stream-card">
          <div class="stream-preview">
            <span class="live-badge">LIVE</span>
            <span class="stream-duration">{{ stream.duration }}</span>
            <img :src="stream.thumbnail" :alt="stream.streamerName" class="stream-thumbnail" />
          </div>
          
          <div class="stream-info">
            <h3>{{ stream.streamerName }}</h3>
            <p class="game-name">{{ stream.game }}</p>
            <div class="stream-stats">
              <span class="odds">Cote: {{ stream.odds }}</span>
              <span class="bet-status">Paris ouverts</span>
            </div>
          </div>
          
          <div class="betting-form">
            <input 
              type="number" 
              v-model="stream.betAmount" 
              placeholder="Montant" 
              min="1" 
              step="1"
              class="bet-input"
            />
            <button 
              @click="placeBet(stream)" 
              class="bet-button"
              :disabled="!isAuthenticated"
            >
              Parier maintenant
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <section class="how-it-works-section">
      <h2>Comment ça marche</h2>
      <div class="steps-container">
        <div class="step-card">
          <div class="step-icon">👤</div>
          <h3>Créez un compte</h3>
          <p>Inscrivez-vous en tant que viewer pour parier ou en tant que streamer pour recevoir des paris.</p>
        </div>
        
        <div class="step-card">
          <div class="step-icon">🎮</div>
          <h3>Choisissez un streamer</h3>
          <p>Parcourez les streams en direct et sélectionnez celui sur lequel vous souhaitez parier.</p>
        </div>
        
        <div class="step-card">
          <div class="step-icon">💰</div>
          <h3>Placez votre pari</h3>
          <p>Misez sur la victoire du streamer avec des cotes basées sur ses performances passées.</p>
        </div>
        
        <div class="step-card">
          <div class="step-icon">🏆</div>
          <h3>Gagnez des récompenses</h3>
          <p>Si le streamer gagne sa partie, vous remportez votre mise multipliée par la cote.</p>
        </div>
      </div>
    </section>
    
    <section v-if="hasPopularStreamers || isLoading" class="popular-streamers-section">
      <h2>Streamers populaires</h2>
      <div v-if="isLoading" class="loading-indicator">Chargement des streamers populaires...</div>
      <div v-else-if="!hasPopularStreamers" class="empty-state">
        Aucun streamer populaire pour le moment.
      </div>
      <div v-else class="streamers-grid">
        <div v-for="(streamer, index) in popularStreamers" :key="index" class="streamer-card">
          <div class="streamer-avatar">
            <img :src="streamer.avatar" :alt="streamer.name" />
          </div>
          
          <div class="streamer-info">
            <h3>{{ streamer.name }}</h3>
            <p class="streamer-game">{{ streamer.game }}</p>
            <div class="streamer-stats">
              <span class="win-rate">{{ streamer.winRate }}% de victoires</span>
              <span class="avg-odds">Cote moyenne: {{ streamer.avgOdds }}</span>
            </div>
          </div>
          
          <div class="streamer-status" :class="{ 'online': streamer.isLive }">
            {{ streamer.isLive ? 'En direct' : 'Hors ligne' }}
          </div>
        </div>
      </div>
    </section>
    
    <section class="become-streamer-section">
      <div class="become-streamer-content">
        <h2>Vous êtes streamer ?</h2>
        <p>Rejoignez GameBet et permettez à vos viewers de parier sur vos performances.</p>
        <router-link to="/register" class="cta-button">Devenir streamer</router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import axios from 'axios';
import StreamPlayer from '@/views/StreamPlayer.vue';

export default {
  name: 'Home',
  components: {
    StreamPlayer
  },
  data() {
    return {
      liveStreams: [], // Tableau vide au lieu des streams fictifs
      popularStreamers: [], // Tableau vide au lieu des streamers fictifs
      isLoading: true
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser']),
    hasLiveStreams() {
      return this.liveStreams && this.liveStreams.length > 0;
    },
    hasPopularStreamers() {
      return this.popularStreamers && this.popularStreamers.length > 0;
    }
  },
  methods: {
    async fetchLiveStreams() {
      try {
        const response = await axios.get('/api/streams/live');
        this.liveStreams = response.data || [];
      } catch (error) {
        console.error('Erreur lors de la récupération des streams en direct:', error);
        this.liveStreams = [];
      }
    },
    async fetchPopularStreamers() {
      try {
        const response = await axios.get('/api/streamers/popular');
        this.popularStreamers = response.data || [];
      } catch (error) {
        console.error('Erreur lors de la récupération des streamers populaires:', error);
        this.popularStreamers = [];
      }
    },
    async placeBet(stream) {
      if (!this.isAuthenticated) {
        this.$router.push('/login');
        return;
      }
      
      if (!stream.betAmount || stream.betAmount < 1) {
        alert('Veuillez entrer un montant valide (minimum 1€)');
        return;
      }
      
      try {
        // Vérifier si l'utilisateur a un portefeuille avec des fonds
        const walletResponse = await axios.get('/api/wallet', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const balance = walletResponse.data?.balance || 0;
        
        if (balance < stream.betAmount) {
          // Rediriger vers la page de crédit du portefeuille
          this.$router.push('/wallet?tab=deposit');
          alert('Solde insuffisant. Veuillez créditer votre compte.');
          return;
        }
        
        // Placer le pari
        const response = await axios.post('/api/bets/place', {
          streamerId: stream.streamerId,
          amount: stream.betAmount,
          odds: stream.odds
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data && response.data.success) {
          alert(`Pari de ${stream.betAmount}€ placé sur ${stream.streamerName} avec une cote de ${stream.odds}`);
          stream.betAmount = null;
        }
      } catch (error) {
        console.error('Erreur lors du placement du pari:', error);
        alert('Une erreur est survenue lors du placement du pari.');
      }
    },
    handleCtaClick() {
      if (!this.isAuthenticated) {
        // Si non connecté, rediriger vers l'inscription
        this.$router.push('/register');
        return;
      }
      
      // Vérifier si l'utilisateur a un portefeuille avec des fonds
      axios.get('/api/wallet', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }).then(response => {
        const balance = response.data?.balance || 0;
        
        if (balance <= 0) {
          // Rediriger vers la page de crédit du portefeuille
          this.$router.push('/wallet?tab=deposit');
        } else {
          // Rediriger vers la page des streams en direct
          this.$router.push('/streams');
        }
      }).catch(error => {
        console.error('Erreur lors de la vérification du portefeuille:', error);
        // En cas d'erreur, rediriger vers la page des streams
        this.$router.push('/streams');
      });
    }
  },
  async created() {
    this.isLoading = true;
    
    // Charger les données réelles
    await Promise.all([
      this.fetchLiveStreams(),
      this.fetchPopularStreamers()
    ]);
    
    this.isLoading = false;
  }
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  height: 500px;
  background-image: linear-gradient(rgba(10, 7, 19, 0.7), rgba(10, 7, 19, 0.7)), url('https://via.placeholder.com/1200x500/1a1333/ffffff?text=GameBet');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 3rem;
  border-radius: 8px;
  overflow: hidden;
}

.hero-content {
  max-width: 800px;
  padding: 2rem;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ffffff;
}

.hero-content p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #8c8a97;
}

/* Styles pour la section du lecteur de streaming */
.stream-player-section {
  margin-bottom: 3rem;
  background-color: #1a1333;
  border-radius: 8px;
  padding: 2rem;
}

.stream-player-section h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #ffffff;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #8c52ff;
  color: #ffffff;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  font-size: 1.2rem;
  transition: background-color 0.3s ease;
}

.cta-button:hover {
  background-color: #7b45e0;
}

section {
  margin-bottom: 3rem;
}

h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #ffffff;
  text-align: center;
}

.streams-grid, .streamers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.stream-card {
  background-color: #1a1333;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.stream-card:hover {
  transform: translateY(-5px);
}

.stream-preview {
  position: relative;
  height: 200px;
}

.stream-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.live-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #f44336;
  color: #ffffff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.stream-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.stream-info {
  padding: 1.5rem;
}

.stream-info h3 {
  margin: 0;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.game-name {
  color: #8c8a97;
  margin-bottom: 1rem;
}

.stream-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.odds {
  font-weight: bold;
  color: #8c52ff;
}

.bet-status {
  background-color: rgba(0, 255, 0, 0.1);
  color: #4caf50;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.betting-form {
  display: flex;
  padding: 1.5rem;
  background-color: #2c2541;
}

.bet-input {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px 0 0 4px;
  background-color: #3a3158;
  color: #ffffff;
}

.bet-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0 4px 4px 0;
  background-color: #8c52ff;
  color: #ffffff;
  font-weight: bold;
  cursor: pointer;
}

.bet-button:disabled {
  background-color: #5c3b99;
  cursor: not-allowed;
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.step-card {
  background-color: #1a1333;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

.step-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.step-card h3 {
  margin-bottom: 1rem;
  color: #8c52ff;
}

.step-card p {
  color: #8c8a97;
}

.streamer-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #1a1333;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.3s ease;
}

.streamer-card:hover {
  transform: translateY(-5px);
}

.streamer-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
}

.streamer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.streamer-info {
  flex: 1;
}

.streamer-info h3 {
  margin: 0;
  margin-bottom: 0.25rem;
  color: #ffffff;
}

.streamer-game {
  color: #8c8a97;
  margin-bottom: 0.5rem;
}

.streamer-stats {
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
}

.win-rate {
  color: #4caf50;
}

.avg-odds {
  color: #8c52ff;
}

.streamer-status {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #2c2541;
  color: #8c8a97;
  font-size: 0.8rem;
}

.streamer-status.online {
  background-color: rgba(0, 255, 0, 0.1);
  color: #4caf50;
}

.become-streamer-section {
  background-color: #1a1333;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
}

.become-streamer-content h2 {
  margin-bottom: 1rem;
}

.become-streamer-content p {
  max-width: 600px;
  margin: 0 auto;
  margin-bottom: 2rem;
  color: #8c8a97;
  font-size: 1.2rem;
}

.loading-indicator {
  text-align: center;
  padding: 2rem;
  color: #8c8a97;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #8c8a97;
  background-color: #1a1333;
  border-radius: 8px;
  margin-bottom: 2rem;
}
</style>
