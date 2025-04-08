import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    error: null
  },
  getters: {
    isAuthenticated: state => !!state.token,
    isStreamer: state => state.user && state.user.accountType === 'streamer',
    currentUser: state => state.user,
    error: state => state.error
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    },
    LOGOUT(state) {
      state.token = null;
      state.user = null;
    }
  },
  actions: {
    async register({ commit }, userData) {
      try {
        commit('CLEAR_ERROR');
        // Dans une implémentation réelle, ceci serait un appel API
        // Pour l'instant, nous simulons une réponse réussie
        const response = { data: { token: 'fake-token', user: { ...userData, id: Date.now() } } };
        
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        commit('SET_TOKEN', token);
        commit('SET_USER', user);
        
        return { success: true };
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Erreur lors de l\'inscription');
        return { success: false, error: error.response?.data?.message || 'Erreur lors de l\'inscription' };
      }
    },
    
    async login({ commit }, credentials) {
      try {
        commit('CLEAR_ERROR');
        // Dans une implémentation réelle, ceci serait un appel API
        // Pour l'instant, nous simulons une réponse réussie
        const response = { 
          data: { 
            token: 'fake-token', 
            user: { 
              id: Date.now(),
              username: credentials.username,
              email: 'user@example.com',
              accountType: credentials.accountType || 'viewer'
            } 
          } 
        };
        
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        commit('SET_TOKEN', token);
        commit('SET_USER', user);
        
        return { success: true };
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Erreur lors de la connexion');
        return { success: false, error: error.response?.data?.message || 'Erreur lors de la connexion' };
      }
    },
    
    logout({ commit }) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      commit('LOGOUT');
      return { success: true };
    },
    
    checkAuth({ commit, state }) {
      if (state.token && state.user) {
        // Dans une implémentation réelle, nous vérifierions la validité du token
        // Pour l'instant, nous considérons que le token est valide
        return { isAuthenticated: true, user: state.user };
      } else {
        commit('LOGOUT');
        return { isAuthenticated: false };
      }
    }
  }
});
