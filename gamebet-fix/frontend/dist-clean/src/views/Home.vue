<template>
  <div class="home-container">
    <section class="hero-section">
      <div class="hero-content">
        <h1>Pariez en direct sur vos streamers préférés</h1>
        <p>Des cotes en temps réel basées sur leurs performances</p>
        <router-link to="/register" class="cta-button">Commencer à parier</router-link>
      </div>
    </section>
    
    <section class="live-streams-section">
      <h2>Streams en direct avec cotes en temps réel</h2>
      <div class="streams-grid">
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
    
    <section class="popular-streamers-section">
      <h2>Streamers populaires</h2>
      <div class="streamers-grid">
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

export default {
  name: 'Home',
  data() {
    return {
      liveStreams: [
        {
          streamerName: 'RisingSun',
          game: 'Fortnite',
          duration: '1:35',
          thumbnail: 'https://via.placeholder.com/300x200/1a1333/ffffff?text=RisingSun',
          odds: 1.75,
          betAmount: null
        },
        {
          streamerName: 'ShadowAcc',
          game: 'Call of Duty',
          duration: '2:10',
          thumbnail: 'https://via.placeholder.com/300x200/1a1333/ffffff?text=ShadowAcc',
          odds: 2.25,
          betAmount: null
        },
        {
          streamerName: 'JinMaster',
          game: 'Valorant',
          duration: '3:25',
          thumbnail: 'https://via.placeholder.com/300x200/1a1333/ffffff?text=JinMaster',
          odds: 1.45,
          betAmount: null
        }
      ],
      popularStreamers: [
        {
          name: 'RisingSun',
          game: 'Fortnite',
          avatar: 'https://via.placeholder.com/100/8c52ff/ffffff?text=R',
          winRate: 66.7,
          avgOdds: 1.75,
          isLive: true
        },
        {
          name: 'ShadowAcc',
          game: 'Call of Duty',
          avatar: 'https://via.placeholder.com/100/8c52ff/ffffff?text=S',
          winRate: 58.3,
          avgOdds: 2.25,
          isLive: true
        },
        {
          name: 'JinMaster',
          game: 'Valorant',
          avatar: 'https://via.placeholder.com/100/8c52ff/ffffff?text=J',
          winRate: 72.1,
          avgOdds: 1.45,
          isLive: false
        },
        {
          name: 'NightOwl',
          game: 'League of Legends',
          avatar: 'https://via.placeholder.com/100/8c52ff/ffffff?text=N',
          winRate: 63.5,
          avgOdds: 1.85,
          isLive: false
        }
      ]
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated'])
  },
  methods: {
    placeBet(stream) {
      if (!this.isAuthenticated) {
        this.$router.push('/login');
        return;
      }
      
      if (!stream.betAmount || stream.betAmount < 1) {
        alert('Veuillez entrer un montant valide (minimum 1€)');
        return;
      }
      
      // Dans une implémentation réelle, ceci serait un appel API
      alert(`Pari de ${stream.betAmount}€ placé sur ${stream.streamerName} avec une cote de ${stream.odds}`);
      stream.betAmount = null;
    }
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
</style>
