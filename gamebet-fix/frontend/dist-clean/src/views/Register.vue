<template>
  <div class="register-container">
    <h1>Créer un compte</h1>
    <p class="subtitle">Rejoignez GameBet et commencez à parier sur vos streamers préférés</p>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <form @submit.prevent="register" class="register-form">
      <div class="form-group">
        <label for="username">Nom d'utilisateur</label>
        <input 
          id="username" 
          v-model="form.username" 
          type="text" 
          placeholder="Votre nom d'utilisateur"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email" 
          v-model="form.email" 
          type="email" 
          placeholder="votre-email@example.com"
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
      
      <div class="form-group">
        <label for="confirmPassword">Confirmer le mot de passe</label>
        <input 
          id="confirmPassword" 
          v-model="form.confirmPassword" 
          type="password" 
          placeholder="Confirmez votre mot de passe"
          required
        />
      </div>
      
      <div class="form-group">
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
              <p>Je souhaite parier sur des streamers</p>
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
              <p>Je souhaite diffuser mes streams et recevoir des paris</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-group terms-checkbox">
        <input 
          id="termsAccepted" 
          v-model="form.termsAccepted" 
          type="checkbox"
          required
        />
        <label for="termsAccepted">
          J'accepte les 
          <router-link to="/terms">conditions d'utilisation</router-link> 
          et la 
          <router-link to="/privacy">politique de confidentialité</router-link>
        </label>
      </div>
      
      <button type="submit" class="submit-button" :disabled="isSubmitting">
        {{ isSubmitting ? 'Création en cours...' : 'Créer un compte' }}
      </button>
    </form>
    
    <div class="login-link">
      Vous avez déjà un compte? 
      <router-link to="/login">Se connecter</router-link>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'Register',
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        accountType: 'viewer',
        termsAccepted: false
      },
      error: null,
      isSubmitting: false
    };
  },
  methods: {
    ...mapActions(['register']),
    async register() {
      // Validation
      if (this.form.password !== this.form.confirmPassword) {
        this.error = 'Les mots de passe ne correspondent pas';
        return;
      }
      
      if (!this.form.termsAccepted) {
        this.error = 'Vous devez accepter les conditions d\'utilisation';
        return;
      }
      
      this.isSubmitting = true;
      this.error = null;
      
      try {
        const { username, email, password, accountType } = this.form;
        const result = await this.register({ username, email, password, accountType });
        
        if (result.success) {
          // Redirection vers la page de connexion après inscription réussie
          this.$router.push('/login');
        } else {
          this.error = result.error || 'Une erreur est survenue lors de l\'inscription';
        }
      } catch (error) {
        this.error = 'Une erreur est survenue lors de l\'inscription';
        console.error(error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  max-width: 600px;
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

.register-form {
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
input[type="email"],
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

.account-type-details p {
  margin: 0;
  font-size: 0.8rem;
  color: #8c8a97;
}

.terms-checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.terms-checkbox a {
  color: #8c52ff;
  text-decoration: none;
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

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #8c8a97;
}

.login-link a {
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
