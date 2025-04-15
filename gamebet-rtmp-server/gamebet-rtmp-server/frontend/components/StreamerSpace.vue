<template>
  <div class="streamer-space">
    <h1>Espace Streamer</h1>
    
    <div v-if="streamKey" class="stream-info">
      <h2>Informations de streaming</h2>
      <div class="info-item">
        <label>Serveur RTMP:</label>
        <div class="value">{{ rtmpUrl }}</div>
      </div>
      <div class="info-item">
        <label>Clé de stream:</label>
        <div class="value-with-button">
          <div class="value">{{ maskedStreamKey }}</div>
          <button @click="toggleShowKey" class="toggle-button">
            {{ showKey ? 'Masquer' : 'Afficher' }}
          </button>
        </div>
      </div>
      <div class="info-item">
        <label>URL du stream:</label>
        <div class="value">{{ streamUrl }}</div>
      </div>
      
      <div class="stream-controls">
        <button @click="regenerateStreamKey" class="action-button">
          Régénérer la clé de stream
        </button>
        <button @click="openStreamControls" class="action-button primary">
          Contrôles de paris
        </button>
      </div>
    </div>
    
    <div v-else class="generate-key">
      <p>Vous n'avez pas encore de clé de stream. Générez-en une pour commencer à streamer.</p>
      <button @click="generateStreamKey" class="action-button primary">
        Générer une clé de stream
      </button>
    </div>
    
    <div v-if="showStreamControls" class="betting-controls">
      <h2>Contrôles des paris</h2>
      <div class="control-buttons">
        <button @click="openBetting" class="betting-button open">
          Ouvrir les paris
        </button>
        <button @click="closeBetting" class="betting-button close">
          Fermer les paris
        </button>
      </div>
      <div class="game-result">
        <h3>Résultat de la partie</h3>
        <div class="result-buttons">
          <button @click="setResult('win')" class="result-button win">
            Victoire
          </button>
          <button @click="setResult('loss')" class="result-button loss">
            Défaite
          </button>
        </div>
      </div>
    </div>
    
    <div class="obs-guide">
      <h2>Guide de configuration OBS</h2>
      <ol>
        <li>Ouvrez OBS Studio</li>
        <li>Allez dans Paramètres > Stream</li>
        <li>Sélectionnez "Service personnalisé" dans le menu déroulant</li>
        <li>Dans "Serveur", entrez: <code>{{ rtmpUrl }}</code></li>
        <li>Dans "Clé de stream", entrez votre clé de stream</li>
        <li>Cliquez sur "OK" pour sauvegarder</li>
        <li>Cliquez sur "Commencer le streaming" pour démarrer votre stream</li>
      </ol>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      streamKey: '',
      rtmpUrl: 'rtmp://stream.gamebet.com/live',
      streamUrl: '',
      showKey: false,
      showStreamControls: false
    };
  },
  computed: {
    maskedStreamKey() {
      return this.showKey ? this.streamKey : this.streamKey.replace(/./g, '*');
    }
  },
  mounted() {
    // Charger la clé de stream existante si disponible
    this.loadStreamKey();
  },
  methods: {
    async loadStreamKey() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('/api/stream/key', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.streamKey = response.data.streamKey;
        this.streamUrl = response.data.streamUrl;
      } catch (error) {
        console.error('Erreur lors du chargement de la clé de stream:', error);
      }
    },
    async generateStreamKey() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$router.push('/login');
          return;
        }
        
        const response = await axios.post('/api/stream/key', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.streamKey = response.data.streamKey;
        this.streamUrl = response.data.streamUrl;
      } catch (error) {
        console.error('Erreur lors de la génération de la clé de stream:', error);
      }
    },
    regenerateStreamKey() {
      if (confirm('Êtes-vous sûr de vouloir régénérer votre clé de stream ? Cela interrompra votre stream actuel.')) {
        this.generateStreamKey();
      }
    },
    toggleShowKey() {
      this.showKey = !this.showKey;
    },
    openStreamControls() {
      this.showStreamControls = true;
    },
    async openBetting() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        await axios.post('/api/betting/open', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        alert('Les paris sont maintenant ouverts !');
      } catch (error) {
        console.error('Erreur lors de l\'ouverture des paris:', error);
        alert('Erreur lors de l\'ouverture des paris');
      }
    },
    async closeBetting() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        await axios.post('/api/betting/close', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        alert('Les paris sont maintenant fermés !');
      } catch (error) {
        console.error('Erreur lors de la fermeture des paris:', error);
        alert('Erreur lors de la fermeture des paris');
      }
    },
    async setResult(result) {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        await axios.post('/api/betting/result', { result }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        alert(`Résultat enregistré : ${result === 'win' ? 'Victoire' : 'Défaite'}`);
      } catch (error) {
        console.error('Erreur lors de la définition du résultat:', error);
        alert('Erreur lors de la définition du résultat');
      }
    }
  }
};
</script>

<style scoped>
.streamer-space {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  color: white;
}

h1, h2, h3 {
  color: #a970ff;
}

.stream-info, .generate-key, .betting-controls, .obs-guide {
  background-color: #1a1a2e;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #a970ff;
  font-weight: bold;
}

.value {
  background-color: #2a2a3e;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  word-break: break-all;
}

.value-with-button {
  display: flex;
  align-items: center;
}

.value-with-button .value {
  flex-grow: 1;
  margin-right: 10px;
}

.toggle-button {
  background-color: #2a2a3e;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.stream-controls, .control-buttons, .result-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.action-button, .betting-button, .result-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  background-color: #2a2a3e;
  color: white;
}

.action-button.primary {
  background-color: #a970ff;
}

.betting-button.open {
  background-color: #4caf50;
}

.betting-button.close {
  background-color: #f44336;
}

.result-button.win {
  background-color: #4caf50;
}

.result-button.loss {
  background-color: #f44336;
}

.obs-guide {
  line-height: 1.6;
}

.obs-guide code {
  background-color: #2a2a3e;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: monospace;
}
</style>
