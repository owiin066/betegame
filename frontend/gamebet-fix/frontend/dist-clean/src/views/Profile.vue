<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="profile-avatar">
        <div class="avatar-circle">
          <span>{{ userInitials }}</span>
        </div>
      </div>
      
      <div class="profile-info">
        <h1>{{ user.username }}</h1>
        <div class="profile-meta">
          <span class="user-type">{{ userTypeLabel }}</span>
          <span class="member-since">Membre depuis {{ memberSince }}</span>
        </div>
        <button @click="activeTab = 'settings'" class="edit-profile-button">Modifier le profil</button>
      </div>
    </div>
    
    <div class="profile-tabs">
      <button 
        @click="activeTab = 'history'" 
        :class="{ active: activeTab === 'history' }"
        class="tab-button"
      >
        Historique des paris
      </button>
      
      <button 
        @click="activeTab = 'streamers'" 
        :class="{ active: activeTab === 'streamers' }"
        class="tab-button"
      >
        Streamers suivis
      </button>
      
      <button 
        @click="activeTab = 'settings'" 
        :class="{ active: activeTab === 'settings' }"
        class="tab-button"
      >
        Paramètres
      </button>
    </div>
    
    <div class="profile-content">
      <!-- Historique des paris -->
      <div v-if="activeTab === 'history'" class="betting-history-tab">
        <h2>Historique des paris</h2>
        
        <div v-if="isLoading.bettingHistory" class="loading-indicator">
          Chargement de l'historique des paris...
        </div>
        <div v-else-if="bettingHistory.length === 0" class="empty-state">
          Vous n'avez pas encore placé de paris.
        </div>
        <div v-else class="betting-history">
          <div v-for="(bet, index) in bettingHistory" :key="index" class="bet-card">
            <div class="bet-header">
              <h3>{{ bet.streamerName }}</h3>
              <span class="bet-date">{{ formatDate(bet.date) }}</span>
            </div>
            
            <div class="bet-details">
              <div class="bet-amount">
                <span class="label">Montant</span>
                <span class="value">{{ bet.amount }} €</span>
              </div>
              
              <div class="bet-odds">
                <span class="label">Cote</span>
                <span class="value">{{ bet.odds }}</span>
              </div>
              
              <div class="bet-potential">
                <span class="label">Gain potentiel</span>
                <span class="value">{{ bet.potentialWin }} €</span>
              </div>
            </div>
            
            <div class="bet-result" :class="{ 'won': bet.result === 'won', 'lost': bet.result === 'lost' }">
              {{ bet.result === 'won' ? 'Gagné' : 'Perdu' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Streamers suivis -->
      <div v-if="activeTab === 'streamers'" class="followed-streamers-tab">
        <h2>Streamers suivis</h2>
        
        <div v-if="isLoading.followedStreamers" class="loading-indicator">
          Chargement des streamers suivis...
        </div>
        <div v-else-if="followedStreamers.length === 0" class="empty-state">
          Vous ne suivez aucun streamer pour le moment.
        </div>
        <div v-else class="followed-streamers">
          <div v-for="(streamer, index) in followedStreamers" :key="index" class="streamer-card">
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
            
            <button class="unfollow-button">Ne plus suivre</button>
          </div>
        </div>
      </div>
      
      <!-- Paramètres -->
      <div v-if="activeTab === 'settings'" class="settings-tab">
        <h2>Paramètres du compte</h2>
        
        <form @submit.prevent="saveSettings" class="settings-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email" 
              v-model="settings.email" 
              type="email" 
              placeholder="Votre email"
            />
          </div>
          
          <div class="form-group">
            <label>Notifications</label>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input 
                  id="notifyStreamerLive" 
                  v-model="settings.notifications.streamerLive" 
                  type="checkbox"
                />
                <label for="notifyStreamerLive">Streamer en direct</label>
              </div>
              
              <div class="checkbox-item">
                <input 
                  id="notifyBetResult" 
                  v-model="settings.notifications.betResult" 
                  type="checkbox"
                />
                <label for="notifyBetResult">Résultat des paris</label>
              </div>
              
              <div class="checkbox-item">
                <input 
                  id="notifyPromotions" 
                  v-model="settings.notifications.promotions" 
                  type="checkbox"
                />
                <label for="notifyPromotions">Promotions et offres spéciales</label>
              </div>
            </div>
          </div>
          
          <button type="submit" class="save-button">Enregistrer les modifications</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import axios from 'axios';

export default {
  name: 'Profile',
  data() {
    return {
      activeTab: 'history',
      bettingHistory: [], // Tableau vide au lieu des paris fictifs
      followedStreamers: [], // Tableau vide au lieu des streamers fictifs
      isLoading: {
        bettingHistory: true,
        followedStreamers: true
      },
      settings: {
        email: '',
        notifications: {
          streamerLive: true,
          betResult: true,
          promotions: false
        }
      }
    };
  },
  computed: {
    ...mapGetters(['currentUser']),
    user() {
      return this.currentUser || {
        username: 'Utilisateur',
        userType: 'viewer',
        createdAt: new Date()
      };
    },
    userInitials() {
      return this.user.username ? this.user.username.charAt(0).toUpperCase() : 'U';
    },
    userTypeLabel() {
      return this.user.userType === 'streamer' ? 'Streamer' : 'Viewer';
    },
    memberSince() {
      const date = this.user.createdAt ? new Date(this.user.createdAt) : new Date();
      return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    async fetchBettingHistory() {
      this.isLoading.bettingHistory = true;
      
      try {
        const response = await axios.get('/api/bets/history', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        this.bettingHistory = response.data || [];
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique des paris:', error);
        this.bettingHistory = [];
      } finally {
        this.isLoading.bettingHistory = false;
      }
    },
    async fetchFollowedStreamers() {
      this.isLoading.followedStreamers = true;
      
      try {
        const response = await axios.get('/api/streamers/followed', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        this.followedStreamers = response.data || [];
      } catch (error) {
        console.error('Erreur lors de la récupération des streamers suivis:', error);
        this.followedStreamers = [];
      } finally {
        this.isLoading.followedStreamers = false;
      }
    },
    async saveSettings() {
      try {
        await axios.post('/api/user/settings', this.settings, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        alert('Paramètres enregistrés avec succès !');
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement des paramètres:', error);
        alert('Une erreur est survenue lors de l\'enregistrement des paramètres.');
      }
    }
  },
  async created() {
    // Initialiser l'email avec celui de l'utilisateur connecté
    if (this.user && this.user.email) {
      this.settings.email = this.user.email;
    }
    
    // Charger les données réelles
    this.fetchBettingHistory();
    this.fetchFollowedStreamers();
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  background-color: #1a1333;
  border-radius: 8px;
  padding: 2rem;
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #8c52ff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  font-weight: bold;
  color: #ffffff;
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  margin: 0;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.profile-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #8c8a97;
}

.user-type {
  background-color: #2c2541;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.edit-profile-button {
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid #8c52ff;
  color: #8c52ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-profile-button:hover {
  background-color: #8c52ff;
  color: #ffffff;
}

.profile-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #2c2541;
}

.tab-button {
  padding: 1rem 2rem;
  background-color: transparent;
  border: none;
  color: #8c8a97;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  color: #8c52ff;
  border-bottom-color: #8c52ff;
}

.profile-content h2 {
  margin-top: 0;
  margin-bottom: 2rem;
  color: #ffffff;
}

.betting-history, .followed-streamers {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.bet-card {
  background-color: #1a1333;
  border-radius: 8px;
  padding: 1.5rem;
}

.bet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.bet-header h3 {
  margin: 0;
  color: #ffffff;
}

.bet-date {
  color: #8c8a97;
  font-size: 0.9rem;
}

.bet-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.bet-amount, .bet-odds, .bet-potential {
  display: flex;
  flex-direction: column;
}

.label {
  color: #8c8a97;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.value {
  color: #ffffff;
  font-weight: bold;
}

.bet-result {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
}

.bet-result.won {
  background-color: rgba(0, 255, 0, 0.1);
  color: #4caf50;
}

.bet-result.lost {
  background-color: rgba(255, 0, 0, 0.1);
  color: #f44336;
}

.streamer-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #1a1333;
  border-radius: 8px;
  padding: 1.5rem;
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
  margin-right: 1rem;
}

.streamer-status.online {
  background-color: rgba(0, 255, 0, 0.1);
  color: #4caf50;
}

.unfollow-button {
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid #f44336;
  color: #f44336;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.unfollow-button:hover {
  background-color: #f44336;
  color: #ffffff;
}

.settings-form {
  background-color: #1a1333;
  border-radius: 8px;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ffffff;
  font-weight: bold;
}

.form-group input[type="email"] {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #2c2541;
  color: #ffffff;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-item label {
  margin-bottom: 0;
  font-weight: normal;
}

.save-button {
  padding: 0.75rem 1.5rem;
  background-color: #8c52ff;
  border: none;
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-button:hover {
  background-color: #7b45e0;
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
