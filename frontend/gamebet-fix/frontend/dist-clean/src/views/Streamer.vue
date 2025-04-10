<template>
  <div class="streamer-dashboard">
    <div class="dashboard-header">
      <h1>Espace Streamer</h1>
      <div class="streamer-status">
        <span class="status-label">Statut actuel:</span>
        <span class="status-value" :class="{ 'live': isLive }">
          {{ isLive ? 'En direct' : 'Hors ligne' }}
        </span>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="dashboard-section">
        <h2>Contrôles de Stream</h2>
        <div class="stream-key-section">
          <h3>Votre clé de stream</h3>
          <div class="stream-key-container">
            <input 
              type="text" 
              :value="streamKey" 
              readonly 
              class="stream-key-input"
            />
            <button @click="copyStreamKey" class="copy-button">Copier</button>
          </div>
          <div class="stream-instructions">
            <p>Utilisez cette clé dans votre logiciel de streaming (OBS, Streamlabs, etc.)</p>
            <p>Serveur RTMP: <strong>rtmp://stream.gamebet.com/live</strong></p>
          </div>
        </div>
        
        <div class="stream-settings">
          <h3>Paramètres de stream</h3>
          <div class="form-group">
            <label for="game">Jeu</label>
            <select id="game" v-model="streamSettings.game">
              <option value="fortnite">Fortnite</option>
              <option value="cod">Call of Duty</option>
              <option value="cs">Counter-Strike</option>
              <option value="valorant">Valorant</option>
              <option value="other">Autre</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="streamTitle">Titre du stream</label>
            <input 
              id="streamTitle" 
              v-model="streamSettings.title" 
              type="text" 
              placeholder="Entrez le titre de votre stream"
            />
          </div>
          
          <button @click="updateStreamSettings" class="update-settings-button">
            Mettre à jour les paramètres
          </button>
        </div>
      </div>
      
      <div class="dashboard-section">
        <h2>Contrôles des paris</h2>
        <div class="betting-controls">
          <p class="betting-info">Gérez les paris pendant les phases inter-game</p>
          <p class="betting-status">
            Statut actuel: 
            <span :class="{ 'open': bettingStatus === 'open', 'closed': bettingStatus === 'closed' }">
              {{ bettingStatus === 'open' ? 'Paris ouverts' : 'Paris fermés' }}
            </span>
          </p>
          
          <div class="betting-buttons">
            <button 
              @click="openBetting" 
              class="open-betting-button"
              :disabled="bettingStatus === 'open' || !isLive"
            >
              Ouvrir les paris
            </button>
            
            <button 
              @click="closeBetting" 
              class="close-betting-button"
              :disabled="bettingStatus === 'closed' || !isLive"
            >
              Fermer les paris
            </button>
          </div>
        </div>
        
        <div class="result-confirmation">
          <h3>Confirmation des résultats</h3>
          <p>Résultat de la partie</p>
          
          <div class="result-buttons">
            <button 
              @click="confirmResult('win')" 
              class="win-button"
              :disabled="bettingStatus === 'open' || !isLive"
            >
              Victoire
            </button>
            
            <button 
              @click="confirmResult('loss')" 
              class="loss-button"
              :disabled="bettingStatus === 'open' || !isLive"
            >
              Défaite
            </button>
          </div>
        </div>
      </div>
      
      <div class="dashboard-section">
        <h2>Statistiques & Performance</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.gamesPlayed }}</div>
            <div class="stat-label">Parties jouées</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ stats.wins }}</div>
            <div class="stat-label">Victoires</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ stats.winRate }}%</div>
            <div class="stat-label">Taux de victoire</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ stats.averageOdds }}</div>
            <div class="stat-label">Cote moyenne</div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-section">
        <h2>Historique des paris reçus</h2>
        <div class="bets-history">
          <div v-for="(bet, index) in betsHistory" :key="index" class="bet-card">
            <div class="bet-user">
              <div class="user-avatar">{{ bet.username.charAt(0) }}</div>
              <div class="user-name">{{ bet.username }}</div>
            </div>
            
            <div class="bet-details">
              <div class="bet-date">{{ formatDate(bet.date) }}</div>
              <div class="bet-amount">{{ formatCurrency(bet.amount) }}</div>
              <div class="bet-odds">Cote {{ bet.odds }}</div>
              <div class="bet-potential">Gain potentiel {{ formatCurrency(bet.amount * bet.odds) }}</div>
            </div>
            
            <div class="bet-status" :class="bet.status.toLowerCase()">
              {{ bet.status }}
            </div>
          </div>
          
          <div v-if="betsHistory.length === 0" class="empty-state">
            Aucun pari reçu pour le moment.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Streamer',
  data() {
    return {
      streamKey: 'rtmp://stream.gamebet.com/live/sk_123456789abcdef',
      isLive: false,
      bettingStatus: 'closed',
      streamSettings: {
        game: 'fortnite',
        title: ''
      },
      stats: {
        gamesPlayed: 42,
        wins: 28,
        winRate: 66.7,
        averageOdds: 1.75
      },
      betsHistory: [
        {
          username: 'User123',
          date: new Date(2025, 3, 5),
          amount: 50,
          odds: 1.75,
          status: 'Gagné'
        },
        {
          username: 'BetMaster',
          date: new Date(2025, 3, 4),
          amount: 25,
          odds: 2.25,
          status: 'Perdu'
        },
        {
          username: 'GamerPro',
          date: new Date(2025, 3, 3),
          amount: 100,
          odds: 1.45,
          status: 'Gagné'
        }
      ]
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'isStreamer', 'currentUser'])
  },
  methods: {
    copyStreamKey() {
      navigator.clipboard.writeText(this.streamKey)
        .then(() => {
          alert('Clé de stream copiée dans le presse-papier !');
        })
        .catch(err => {
          console.error('Erreur lors de la copie: ', err);
          alert('Erreur lors de la copie de la clé de stream.');
        });
    },
    updateStreamSettings() {
      // Dans une implémentation réelle, ceci serait un appel API
      alert('Paramètres de stream mis à jour !');
    },
    openBetting() {
      this.bettingStatus = 'open';
      // Dans une implémentation réelle, ceci serait un appel API
      alert('Les paris sont maintenant ouverts !');
    },
    closeBetting() {
      this.bettingStatus = 'closed';
      // Dans une implémentation réelle, ceci serait un appel API
      alert('Les paris sont maintenant fermés !');
    },
    confirmResult(result) {
      // Dans une implémentation réelle, ceci serait un appel API
      if (result === 'win') {
        this.stats.wins++;
        this.stats.gamesPlayed++;
        this.stats.winRate = ((this.stats.wins / this.stats.gamesPlayed) * 100).toFixed(1);
        alert('Victoire confirmée ! Les gains ont été distribués aux parieurs gagnants.');
      } else {
        this.stats.gamesPlayed++;
        this.stats.winRate = ((this.stats.wins / this.stats.gamesPlayed) * 100).toFixed(1);
        alert('Défaite confirmée. Meilleure chance la prochaine fois !');
      }
      
      // Simuler la mise à jour des cotes
      this.updateOdds();
    },
    updateOdds() {
      // Simuler un algorithme de mise à jour des cotes basé sur les performances
      const newOdds = (1 + (1 - (this.stats.winRate / 100))) * 1.1;
      this.stats.averageOdds = newOdds.toFixed(2);
    },
    formatDate(date) {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    },
    checkStreamStatus() {
      // Dans une implémentation réelle, ceci vérifierait périodiquement le statut du stream
      // Pour la démonstration, nous simulons un changement de statut après 3 secondes
      setTimeout(() => {
        this.isLive = true;
      }, 3000);
    }
  },
  mounted() {
    this.checkStreamStatus();
  },
  beforeRouteEnter(to, from, next) {
    // Cette route nécessite une authentification et un compte streamer
    next(vm => {
      if (!vm.$store.getters.isAuthenticated) {
        vm.$router.push('/login');
      } else if (!vm.$store.getters.isStreamer) {
        vm.$router.push('/');
      }
    });
  }
};
</script>

<style scoped>
.streamer-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  color: #ffffff;
  margin: 0;
}

.streamer-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-label {
  color: #8c8a97;
}

.status-value {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  background-color: #2c2541;
  color: #f44336;
}

.status-value.live {
  background-color: rgba(0, 255, 0, 0.1);
  color: #4caf50;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.dashboard-section {
  background-color: #1a1333;
  border-radius: 8px;
  padding: 1.5rem;
}

h2 {
  color: #8c52ff;
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #2c2541;
  padding-bottom: 0.5rem;
}

h3 {
  color: #ffffff;
  margin-top: 0;
  margin-bottom: 1rem;
}

.stream-key-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stream-key-input {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #2c2541;
  color: #ffffff;
  font-family: monospace;
}

.copy-button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #8c52ff;
  color: #ffffff;
  cursor: pointer;
}

.stream-instructions {
  background-color: #2c2541;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.stream-instructions p {
  margin: 0.5rem 0;
  color: #8c8a97;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

select, input[type="text"] {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #2c2541;
  color: #ffffff;
}

.update-settings-button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #8c52ff;
  color: #ffffff;
  cursor: pointer;
  width: 100%;
}

.betting-info {
  margin-bottom: 0.5rem;
  color: #8c8a97;
}

.betting-status {
  margin-bottom: 1rem;
  font-weight: bold;
}

.betting-status .open {
  color: #4caf50;
}

.betting-status .closed {
  color: #f44336;
}

.betting-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.open-betting-button, .close-betting-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.open-betting-button {
  background-color: #4caf50;
  color: #ffffff;
}

.close-betting-button {
  background-color: #f44336;
  color: #ffffff;
}

.open-betting-button:disabled, .close-betting-button:disabled {
  background-color: #2c2541;
  color: #8c8a97;
  cursor: not-allowed;
}

.result-confirmation {
  margin-top: 2rem;
}

.result-buttons {
  display: flex;
  gap: 1rem;
}

.win-button, .loss-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.win-button {
  background-color: #4caf50;
  color: #ffffff;
}

.loss-button {
  background-color: #f44336;
  color: #ffffff;
}

.win-button:disabled, .loss-button:disabled {
  background-color: #2c2541;
  color: #8c8a97;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  background-color: #2c2541;
  border-radius: 4px;
  padding: 1.5rem;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #8c52ff;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #8c8a97;
}

.bets-history {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.bet-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #2c2541;
  border-radius: 4px;
  padding: 1rem;
}

.bet-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #8c52ff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.bet-details {
  flex: 1;
}

.bet-date {
  font-size: 0.8rem;
  color: #8c8a97;
  margin-bottom: 0.25rem;
}

.bet-amount {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.bet-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9rem;
}

.bet-status.gagné {
  background-color: rgba(0, 255, 0, 0.1);
  color: #4caf50;
}

.bet-status.perdu {
  background-color: rgba(255, 0, 0, 0.1);
  color: #f44336;
}

.bet-status.en.cours {
  background-color: rgba(255, 165, 0, 0.1);
  color: #ff9800;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #8c8a97;
}
</style>
