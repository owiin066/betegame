<template>
  <div class="login-container">
    <h1>Connexion</h1>
    <p class="subtitle">Connectez-vous pour accéder à votre compte</p>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="username">Nom d'utilisateur ou Email</label>
        <input 
          id="username" 
          v-model="form.username" 
          type="text" 
          placeholder="Votre nom d'utilisateur ou email"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input 
          id="password" 
          v-model="form.password" 
          type="password" 
          placeholder="Votre mot de passe"
          required
        />
      </div>
      
      <div class="form-group account-type">
        <label>Type de compte</label>
        <div class="account-type-options">
          <div 
            class="account-type-option" 
            :class="{ active: form.accountType === 'viewer' }"
            @click="form.accountType = 'viewer'"
          >
            <span class="icon">👁️</span>
            <div class="account-type-details">
              <h3>Viewer</h3>
            </div>
          </div>
          
          <div 
            class="account-type-option" 
            :class="{ active: form.accountType === 'streamer' }"
            @click="form.accountType = 'streamer'"
          >
            <span class="icon">🎮</span>
            <div class="account-type-details">
              <h3>Streamer</h3>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-group remember-me">
        <input id="rememberMe" v-model="form.rememberMe" type="checkbox" />
        <label for="rememberMe">Se souvenir de moi</label>
      </div>
      
      <button type="submit" class="submit-button" :disabled="isSubmitting">
        {{ isSubmitting ? 'Connexion en cours...' : 'Se connecter' }}
      </button>
    </form>
    
    <div class="forgot-password">
      <a href="#">Mot de passe oublié?</a>
    </div>
    
    <div class="register-link">
      Vous n'avez pas de compte? 
      <router-link to="/register">S'inscrire</router-link>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: '',
        password: '',
        accountType: 'viewer',
        rememberMe: false
      },
      error: null,
      isSubmitting: false
    };
  },
  methods: {
    ...mapActions(['login']),
    async handleLogin() {
      this.isSubmitting = true;
      this.error = null;
      
      try {
        const { username, password, accountType } = this.form;
        
        // Déterminer si l'entrée est un email ou un nom d'utilisateur
        const isEmail = username.includes('@');
        
        // Préparer les données de connexion
        const loginData = {
          password,
          accountType
        };
        
        // Ajouter soit email soit username selon le format détecté
        if (isEmail) {
          loginData.email = username;
        } else {
          loginData.username = username;
        }
        
        const result = await this.login(loginData);
        
        if (result.success) {
          // Vérifier si l'utilisateur a un portefeuille avec des fonds
          const user = this.$store.getters.currentUser;
          
          // Redirection basée sur l'état du portefeuille
          if (user && user.hasWallet && user.walletBalance > 0) {
            // Rediriger vers la page des streams en direct
            this.$router.push('/streams');
          } else {
            // Rediriger vers la page de crédit du portefeuille
            this.$router.push('/wallet?tab=deposit');
          }
        } else {
          this.error = result.error || 'Nom d\'utilisateur ou mot de passe incorrect';
        }
      } catch (error) {
        this.error = 'Une erreur est survenue lors de la connexion';
        console.error(error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #1a1333;
  border-radius: 8px;
}

h1 {
  color: #ffffff;
  text-align: center;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: #8c8a97;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #ffffff;
  font-weight: bold;
}

input[type="text"],
input[type="password"] {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #2c2541;
  color: #ffffff;
}

.account-type-options {
  display: flex;
  gap: 1rem;
}

.account-type-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: #2c2541;
  cursor: pointer;
  transition: all 0.3s ease;
}

.account-type-option.active {
  background-color: #3a3158;
  border: 2px solid #8c52ff;
}

.account-type-option .icon {
  font-size: 1.5rem;
}

.account-type-details h3 {
  margin: 0;
  font-size: 1rem;
}

.remember-me {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.submit-button {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #8c52ff;
  color: #ffffff;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #7b45e0;
}

.submit-button:disabled {
  background-color: #5c3b99;
  cursor: not-allowed;
}

.forgot-password {
  text-align: center;
  margin-top: 1rem;
}

.forgot-password a {
  color: #8c52ff;
  text-decoration: none;
  font-size: 0.9rem;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #8c8a97;
}

.register-link a {
  color: #8c52ff;
  text-decoration: none;
}

.error-message {
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff6b6b;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
</style>
