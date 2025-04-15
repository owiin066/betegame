# Guide d'installation du serveur RTMP pour GameBet

Ce fichier README contient les instructions pour installer et configurer le serveur de streaming RTMP pour la plateforme GameBet.

## Structure des fichiers

```
gamebet-rtmp-server/
├── backend/
│   ├── app.js                 # Application principale du serveur RTMP
│   ├── package.json           # Dépendances du projet
│   ├── .env                   # Variables d'environnement
│   └── models/
│       ├── Bet.model.js       # Modèle pour les paris
│       ├── StreamKey.model.js # Modèle pour les clés de stream
│       └── User.model.js      # Modèle pour les utilisateurs
├── frontend/
│   └── components/
│       ├── StreamerSpace.vue  # Composant pour l'espace streamer
│       └── StreamPlayer.vue   # Composant pour le lecteur vidéo
└── nginx/
    └── stream.gamebet.com.conf # Configuration Nginx
```

## Prérequis

- Node.js 14+ et npm
- MongoDB
- Nginx
- FFmpeg

## Installation du serveur RTMP

### 1. Configurer le serveur

```bash
# Créer un répertoire pour le serveur
mkdir -p /opt/gamebet-rtmp-server
cp -r backend/* /opt/gamebet-rtmp-server/

# Installer les dépendances
cd /opt/gamebet-rtmp-server
npm install

# Installer FFmpeg si nécessaire
sudo apt update
sudo apt install -y ffmpeg
```

### 2. Configurer les variables d'environnement

Modifiez le fichier `.env` avec vos propres valeurs :

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/gamebet
JWT_SECRET=votre_secret_jwt
RTMP_SECRET=votre_secret_rtmp
NODE_ENV=production
```

### 3. Configurer le service systemd

Créez un fichier de service systemd :

```bash
sudo nano /etc/systemd/system/gamebet-rtmp.service
```

Contenu du fichier :

```
[Unit]
Description=GameBet RTMP Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/gamebet-rtmp-server
ExecStart=/usr/bin/node app.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Activez et démarrez le service :

```bash
sudo systemctl enable gamebet-rtmp
sudo systemctl start gamebet-rtmp
```

## Configuration de Nginx

### 1. Installer Nginx et Certbot

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Configurer le proxy inverse

Copiez le fichier de configuration Nginx :

```bash
sudo cp nginx/stream.gamebet.com.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/stream.gamebet.com.conf /etc/nginx/sites-enabled/
```

### 3. Obtenir un certificat SSL

```bash
sudo certbot --nginx -d stream.gamebet.com
sudo systemctl restart nginx
```

## Configuration DNS

Configurez votre DNS pour que `stream.gamebet.com` pointe vers l'adresse IP de votre serveur.

## Intégration avec le frontend GameBet

### 1. Ajouter les composants Vue.js

Copiez les composants Vue.js dans votre projet frontend :

```bash
cp -r frontend/components/* /chemin/vers/votre/projet/frontend/src/components/
```

### 2. Importer les composants

Dans votre application Vue.js, importez les composants :

```javascript
import StreamerSpace from '@/components/StreamerSpace.vue';
import StreamPlayer from '@/components/StreamPlayer.vue';
```

### 3. Utiliser les composants

Exemple d'utilisation du composant StreamerSpace :

```vue
<template>
  <div>
    <streamer-space v-if="isStreamer" />
  </div>
</template>

<script>
import StreamerSpace from '@/components/StreamerSpace.vue';

export default {
  components: {
    StreamerSpace
  },
  computed: {
    isStreamer() {
      return this.$store.getters.isStreamer;
    }
  }
}
</script>
```

Exemple d'utilisation du composant StreamPlayer :

```vue
<template>
  <div>
    <stream-player 
      v-if="stream"
      :stream-key="stream.key"
      :streamer-name="stream.streamerName"
      :game-title="stream.gameTitle"
      :streamer-id="stream.streamerId"
    />
  </div>
</template>

<script>
import StreamPlayer from '@/components/StreamPlayer.vue';

export default {
  components: {
    StreamPlayer
  },
  data() {
    return {
      stream: null
    }
  },
  async mounted() {
    // Récupérer les informations du stream
    const streamId = this.$route.params.id;
    const response = await this.$axios.get(`/api/stream/${streamId}`);
    this.stream = response.data;
  }
}
</script>
```

## Vérification de l'installation

Pour vérifier que le serveur RTMP fonctionne correctement :

```bash
sudo systemctl status gamebet-rtmp
```

Pour vérifier que Nginx est correctement configuré :

```bash
sudo nginx -t
```

## Dépannage

### Le serveur RTMP ne démarre pas

Vérifiez les logs :

```bash
journalctl -u gamebet-rtmp
```

### Problèmes de connexion OBS

1. Vérifiez que le serveur RTMP est en cours d'exécution
2. Vérifiez que la configuration DNS est correcte
3. Vérifiez que la clé de stream est valide

### Problèmes de lecture du stream

1. Vérifiez que le stream est actif
2. Vérifiez que les fichiers HLS sont générés dans `/opt/gamebet-rtmp-server/media/live/`
3. Vérifiez les permissions des répertoires

## Support

Pour toute question ou problème, veuillez contacter l'équipe de support GameBet.
