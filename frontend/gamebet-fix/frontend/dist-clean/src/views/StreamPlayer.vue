<template>
  <div class="stream-container">
    <!-- Lecteur vidéo -->
    <video
      id="stream-player"
      class="video-js vjs-default-skin vjs-big-play-centered"
      controls
      preload="auto"
      width="640"
      height="360"
      poster="https://betegame.com/images/stream-placeholder.jpg"
      data-setup='{}'>
      <p class="vjs-no-js">
        Pour voir cette vidéo, veuillez activer JavaScript et envisager de passer à un navigateur web qui
        prend en charge la vidéo HTML5.
      </p>
    </video>

    <!-- Liste des streams actifs -->
    <div class="streams-list">
      <h3>Streams en direct</h3>
      <ul id="active-streams">
        <li v-if="streams.length === 0">Aucun stream en direct pour le moment</li>
        <li v-for="(stream, index) in streams" :key="index">
          <strong>{{ stream.username }}</strong>: {{ stream.title }}
          <button @click="loadStream(stream.key)">Regarder</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import 'video.js/dist/video-js.css';
import videojs from 'video.js';
import Hls from 'hls.js';
import { mapGetters } from 'vuex';
import StreamService from '../services/stream.service';

export default {
  name: 'StreamPlayer',
  data() {
    return {
      player: null,
      streams: [],
      refreshInterval: null
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser'])
  },
  methods: {
    initializePlayer() {
      this.player = videojs('stream-player');
    },
    loadStream(streamKey) {
      const hlsUrl = `http://stream.betegame.com:8000/live/${streamKey}/index.m3u8`;
      
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(hlsUrl);
        hls.attachMedia(this.player.tech().el());
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.player.play();
        });
      } else if (this.player.canPlayType('application/vnd.apple.mpegurl')) {
        this.player.src({
          src: hlsUrl,
          type: 'application/vnd.apple.mpegurl'
        });
        this.player.play();
      } else {
        console.error('Votre navigateur ne supporte pas HLS');
      }
    },
    async refreshStreamsList() {
      try {
        const response = await StreamService.getLiveStreams();
        this.streams = response.data;
        
        // Charger automatiquement le premier stream s'il y en a un et qu'aucun n'est déjà chargé
        if (this.streams.length > 0 && !this.player.src()) {
          this.loadStream(this.streams[0].key);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des streams:', error);
      }
    }
  },
  mounted() {
    this.initializePlayer();
    this.refreshStreamsList();
    
    // Rafraîchir la liste toutes les 30 secondes
    this.refreshInterval = setInterval(() => {
      this.refreshStreamsList();
    }, 30000);
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
};
</script>

<style scoped>
.stream-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
  background-color: #1a1333;
  border-radius: 8px;
}

.streams-list {
  margin-top: 20px;
  border: 1px solid #2c2541;
  padding: 15px;
  border-radius: 5px;
  background-color: #2c2541;
}

.streams-list h3 {
  margin-top: 0;
  border-bottom: 1px solid #3a3158;
  padding-bottom: 10px;
  color: #ffffff;
}

#active-streams {
  list-style: none;
  padding: 0;
}

#active-streams li {
  padding: 10px;
  border-bottom: 1px solid #3a3158;
  color: #8c8a97;
}

#active-streams li:last-child {
  border-bottom: none;
}

#active-streams strong {
  color: #ffffff;
}

#active-streams button {
  background-color: #8c52ff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 10px;
}

#active-streams button:hover {
  background-color: #7b45e0;
}

/* Styles pour le lecteur vidéo */
.video-js {
  width: 100%;
  height: auto;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.vjs-big-play-centered .vjs-big-play-button {
  background-color: rgba(140, 82, 255, 0.7);
  border-color: #8c52ff;
}

@media (max-width: 768px) {
  .stream-container {
    padding: 10px;
  }
}
</style>
