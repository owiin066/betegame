<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="avatar-section">
        <div class="avatar">
          <!-- Placeholder pour l'avatar -->
          <div class="avatar-placeholder">{{ userInitials }}</div>
        </div>
        <h2>{{ user.username }}</h2>
        <p>{{ userTypeLabel }}</p>
        <p>Membre depuis {{ memberSince }}</p>
        <button class="edit-profile-btn">Modifier le profil</button>
      </div>
      
      <div class="profile-tabs">
        <div 
          class="tab" 
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          Historique des paris
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'followed' }"
          @click="activeTab = 'followed'"
        >
          Streamers suivis
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'settings' }"
          @click="activeTab = 'settings'"
        >
          Paramètres
        </div>
      </div>
    </div>
    
    <div class="profile-content">
      <!-- Historique des paris -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <h3>Historique des paris</h3>
        <div v-if="userBettingHistory.length === 0" class="empty-state">
          Vous n'avez pas encore placé de paris.
        </div>
        <div v-else class="betting-history">
          <div v-for="(bet, index) in userBettingHistory" :key="index" class="bet-card">
            <div class="bet-header">
              <span class="streamer-name">{{ bet.streamerName }}</span>
              <span class="bet-date">{{ formatDate(bet.date) }}</span>
            </div>
            <div class="bet-details">
              <div class="bet-amount">{{ bet.amount }} €</div>
              <div class="bet-odds">Cote {{ bet.odds }}</div>
              <div class="bet-potential">Gain potentiel: {{ (bet.amount * bet.odds).toFixed(2) }} €</div>
            </div>
            <div class="bet-status" :class="bet.status.toLowerCase()">
              {{ bet.status }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Streamers suivis -->
      <div v-if="activeTab === 'followed'" class="tab-content">
        <h3>Streamers suivis</h3>
        <div v-if="userFollowedStreamers.length === 0" class="empty-state">
          Vous ne suivez aucun streamer pour le moment.
        </div>
        <div v-else class="followed-streamers">
          <div v-for="(streamer, index) in userFollowedStreamers" :key="index" class="streamer-card">
            <div class="streamer-avatar">{{ streamer.name.charAt(0) }}</div>
            <div class="streamer-info">
              <h4>{{ streamer.name }}</h4>
              <p>{{ streamer.game }}</p>
              <div class="streamer-stats">
                <span>{{ streamer.winRate }}% de victoires</span>
                <span>Cote moyenne: {{ streamer.averageOdds }}</span>
              </div>
            </div>
            <div class="streamer-status" :class="{ online: streamer.isLive }">
              {{ streamer.isLive ? 'En direct' : 'Hors ligne' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Paramètres -->
      <div v-if="activeTab === 'settings'" class="tab-content">
        <h3>Paramètres du compte</h3>
        <form class="settings-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="settings.email" />
          </div>
          
          <div class="form-group">
            <label for="notifications">Notifications</label>
            <div class="checkbox-group">
              <div class="checkbox">
                <input type="checkbox" id="notifyStreamerLive" v-model="settings.notifications.streamerLive" />
                <label for="notifyStreamerLive">Quand un streamer suivi est en direct</label>
              </div>
              <div class="checkbox">
                <input type="checkbox" id="notifyBetResult" v-model="settings.notifications.betResult" />
                <label for="notifyBetResult">Résultats des paris</label>
              </div>
              <div class="checkbox">
                <input type="checkbox" id="notifyPromo" v-model="settings.notifications.promotions" />
                <label for="notifyPromo">Promotions et événements spéciaux</label>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Changer le mot de passe</label>
            <input type="password" id="currentPassword" placeholder="Mot de passe actuel" />
            <input type="password" id="newPassword" placeholder="Nouveau mot de passe" />
            <input type="password" id="confirmPassword" placeholder="Confirmer le nouveau mot de passe" />
          </div>
          
          <button type="submit" class="save-settings-btn">Enregistrer les modifications</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Profile',
  data() {
    return {
      activeTab: 'history',
      // Données de démonstration - ne seront utilisées que pour les comptes de démonstration
      demoBettingHistory: [
        {
          streamerName: 'RisingSun',
          date: new Date(2025, 3, 5),
          amount: 50,
          odds: 1.75,
          status: 'Gagné'
        },
        {
          streamerName: 'ShadowAcc',
          date: new Date(2025, 3, 4),
          amount: 25,
          odds: 2.25,
          status: 'Perdu'
        },
        {
          streamerName: 'JinMaster',
          date: new Date(2025, 3, 3),
          amount: 100,
          odds: 1.45,
          status: 'Gagné'
        }
      ],
      demoFollowedStreamers: [
        {
          name: 'RisingSun',
          game: 'Fortnite',
          winRate: 66.7,
          averageOdds: 1.75,
          isLive: true
        },
        {
          name: 'ShadowAcc',
          game: 'Call of Duty',
          winRate: 58.3,
          averageOdds: 2.25,
          isLive: true
        },
        {
          name: 'JinMaster',
          game: 'Valorant',
          winRate: 72.1,
          averageOdds: 1.45,
          isLive: false
        }
      ],
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
        accountType: 'viewer',
        createdAt: new Date()
      };
    },
    userInitials() {
      return this.user.username ? this.user.username.charAt(0).toUpperCase() : 'U';
    },
    userTypeLabel() {
      return this.user.accountType === 'streamer' ? 'Streamer' : 'Viewer';
    },
    memberSince() {
      const date = this.user.createdAt ? new Date(this.user.createdAt) : new Date();
      return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    // Vérifier si l'utilisateur est nouveau (inscrit aujourd'hui)
    isNewUser() {
      if (!this.user || !this.user.createdAt) return true;
      
      const createdDate = new Date(this.user.createdAt);
      const today = new Date();
      
      // Vérifier si l'utilisateur s'est inscrit aujourd'hui
      return (
        createdDate.getDate() === today.getDate() &&
        createdDate.getMonth() === today.getMonth() &&
        createdDate.getFullYear() === today.getFullYear()
      );
    },
    // Retourner un historique de paris vide pour les nouveaux utilisateurs
    userBettingHistory() {
      // Si c'est un nouvel utilisateur, retourner un tableau vide
      if (this.isNewUser) {
        return [];
      }
      
      // Sinon, retourner les données de démonstration
      return this.demoBettingHistory;
    },
    // Retourner une liste de streamers suivis vide pour les nouveaux utilisateurs
    userFollowedStreamers() {
      // Si c'est un nouvel utilisateur, retourner un tableau vide
      if (this.isNewUser) {
        return [];
      }
      
      // Sinon, retourner les données de démonstration
      return this.demoFollowedStreamers;
    }
  },
  created() {
    // Initialiser l'email avec celui de l'utilisateur connecté
    if (this.user && this.user.email) {
      this.settings.email = this.user.email;
    }
  },
  methods: {
    formatDate(date) {
      return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    }
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
  flex-direction: column;
  background-color: #1a1333;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #8c52ff;
  color: #ffffff;
  font-size: 3rem;
  font-weight: bold;
}

.edit-profile-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #8c52ff;
  color: #ffffff;
  cursor: pointer;
}

.profile-tabs {
  display: flex;
  border-top: 1px solid #2c2541;
}

.tab {
  flex: 1;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab:hover {
  background-color: #2c2541;
}

.tab.active {
  background-color: #2c2541;
  border-bottom: 3px solid #8c52ff;
}

.profile-content {
  background-color: #1a1333;
  border-radius: 8px;
  padding: 2rem;
}

.tab-content h3 {
  margin-bottom: 1.5rem;
  color: #8c52ff;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #8c8a97;
}

.betting-history, .followed-streamers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.bet-card, .streamer-card {
  background-color: #2c2541;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.3s ease;
}

.bet-card:hover, .streamer-card:hover {
  transform: translateY(-5px);
}

.bet-header, .streamer-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.streamer-name, .bet-date {
  font-size: 0.9rem;
}

.bet-details {
  margin-bottom: 1rem;
}

.bet-amount {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.bet-status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
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

.streamer-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.streamer-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #8c52ff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.streamer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.streamer-info h4 {
  margin: 0;
}

.streamer-info p {
  margin: 0;
  color: #8c8a97;
}

.streamer-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
}

.streamer-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  background-color: #2c2541;
  color: #8c8a97;
}

.streamer-status.online {
  background-color: rgba(0, 255, 0, 0.1);
  color: #4caf50;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
}

.form-group input[type="email"],
.form-group input[type="password"] {
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

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-settings-btn {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #8c52ff;
  color: #ffffff;
  font-weight: bold;
  cursor: pointer;
  align-self: flex-start;
}
</style>
