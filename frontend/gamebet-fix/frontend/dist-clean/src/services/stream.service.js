import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/streams/';

class StreamService {
  // Obtenir tous les streams en direct
  getLiveStreams() {
    return axios.get(API_URL + 'live');
  }

  // Obtenir les détails d'un stream spécifique
  getStreamById(id) {
    return axios.get(API_URL + id);
  }

  // Obtenir la clé de streaming (nécessite authentification)
  getStreamKey() {
    return axios.get(API_URL + 'key', { headers: authHeader() });
  }

  // Régénérer la clé de streaming (nécessite authentification)
  regenerateStreamKey() {
    return axios.post(API_URL + 'key/regenerate', {}, { headers: authHeader() });
  }

  // Démarrer un stream (nécessite authentification)
  startStream(streamData) {
    return axios.post(API_URL + 'start', streamData, { headers: authHeader() });
  }

  // Terminer un stream (nécessite authentification)
  endStream(streamId) {
    return axios.post(API_URL + 'end/' + streamId, {}, { headers: authHeader() });
  }

  // Mettre à jour les informations d'un stream (nécessite authentification)
  updateStream(streamId, streamData) {
    return axios.put(API_URL + streamId, streamData, { headers: authHeader() });
  }

  // Obtenir l'historique des streams (nécessite authentification)
  getStreamHistory() {
    return axios.get(API_URL + 'history', { headers: authHeader() });
  }

  // Obtenir les statistiques des streams (nécessite authentification)
  getStreamStats() {
    return axios.get(API_URL + 'stats', { headers: authHeader() });
  }

  // Ouvrir les paris sur un stream (nécessite authentification)
  openBetting(streamId, odds) {
    return axios.post(API_URL + streamId + '/betting/open', { odds }, { headers: authHeader() });
  }

  // Fermer les paris sur un stream (nécessite authentification)
  closeBetting(streamId) {
    return axios.post(API_URL + streamId + '/betting/close', {}, { headers: authHeader() });
  }

  // Définir le résultat d'un stream (nécessite authentification)
  setStreamResult(streamId, result) {
    return axios.post(API_URL + streamId + '/result', { result }, { headers: authHeader() });
  }
}

export default new StreamService();
