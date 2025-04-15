<template>
  <div class="stream-player">
    <video-js
      ref="videoPlayer"
      class="vjs-custom-skin"
      controls
      preload="auto"
      width="100%"
      height="auto"
      :poster="poster"
    >
      <source :src="hlsUrl" type="application/x-mpegURL" />
    </video-js>
    
    <div class="stream-info">
      <div class="streamer-info">
        <img :src="streamerAvatar" alt="Avatar" class="avatar" />
        <div class="streamer-details">
          <h2>{{ streamerName }}</h2>
          <p>{{ gameTitle }}</p>
        </div>
      </div>
      
      <div class="betting-info" v-if="bettingOpen">
        <div class="betting-status open">
          Paris ouverts
        </div>
        <div class="odds">
          <span>Cote: {{ odds }}</span>
        </div>
        <div class="bet-controls">
          <input 
            type="number" 
            v-model="betAmount" 
            placeholder="Montant" 
            min="1" 
            class="bet-input"
          />
          <button @click="placeBet" class="bet-button">
            Parier
          </button>
        </div>
      </div>
      
      <div class="betting-info" v-else>
        <div class="betting-status closed">
          Paris fermés
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import axios from 'axios';

export default {
  props: {
    streamKey: {
      type: String,
      required: true
    },
    streamerName: {
      type: String,
      default: 'Streamer'
    },
    gameTitle: {
      type: String,
      default: 'Jeu'
    },
    streamerAvatar: {
      type: String,
      default: '/default-avatar.png'
    },
    poster: {
      type: String,
      default: '/stream-offline.jpg'
    },
    streamerId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      player: null,
      bettingOpen: false,
      odds: 1.5,
      betAmount: ''
    };
  },
  computed: {
    hlsUrl() {
      return `https://stream.gamebet.com/live/${this.streamKey}/index.m3u8`;
    }
  },
  mounted() {
    this.player = videojs(this.$refs.videoPlayer.$el, {
      autoplay: true,
      controls: true,
      sources: [{
        src: this.hlsUrl,
        type: 'application/x-mpegURL'
      }]
    });
    
    // Vérifier si les paris sont ouverts
    this.checkBettingStatus();
    
    // Vérifier le statut des paris toutes les 10 secondes
    this.statusInterval = setInterval(this.checkBettingStatus, 10000);
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
    
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  },
  methods: {
    async checkBettingStatus() {
      try {
        const response = await axios.get(`/api/streamer/${this.streamerId}/status`);
        this.bettingOpen = response.data.bettingOpen;
        this.odds = response.data.odds || 1.5;
      } catch (error) {
        console.error('Erreur lors de la vérification du statut des paris:', error);
      }
    },
    async placeBet() {
      if (!this.betAmount || this.betAmount <= 0) {
        alert('Veuillez entrer un montant valide');
        return;
      }
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$router.push('/login');
          return;
        }
        
        const response = await axios.post('/api/bet', {
          streamerId: this.streamerId,
          amount: parseFloat(this.betAmount)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        alert(`Pari de ${this.betAmount}€ placé avec succès !`);
        this.betAmount = '';
      } catch (error) {
        console.error('Erreur lors du placement du pari:', error);
        alert(error.response?.data?.error || 'Erreur lors du placement du pari');
      }
    }
  }
};
</script>

<style scoped>
.stream-player {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #1a1a2e;
  border-radius: 8px;
  overflow: hidden;
}

.vjs-custom-skin {
  width: 100%;
  aspect-ratio: 16/9;
}

.stream-info {
  padding: 15px;
  color: white;
}

.streamer-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

.streamer-details h2 {
  margin: 0;
  color: #a970ff;
  font-size: 1.2rem;
}

.streamer-details p {
  margin: 5px 0 0;
  color: #ccc;
  font-size: 0.9rem;
}

.betting-info {
  background-color: #2a2a3e;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.betting-status {
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 4px;
}

.betting-status.open {
  background-color: #4caf50;
  color: white;
}

.betting-status.closed {
  background-color: #f44336;
  color: white;
}

.odds {
  font-size: 1.1rem;
  font-weight: bold;
  color: #a970ff;
}

.bet-controls {
  display: flex;
  gap: 10px;
}

.bet-input {
  padding: 8px;
  border-radius: 4px;
  border: none;
  width: 100px;
}

.bet-button {
  background-color: #a970ff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
</style>
