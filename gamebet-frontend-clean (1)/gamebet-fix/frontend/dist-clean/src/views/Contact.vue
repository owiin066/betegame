<template>
  <div class="contact-container">
    <h1>Contactez-nous</h1>
    
    <div class="contact-intro">
      <p>
        Vous avez des questions, des suggestions ou besoin d'assistance ? 
        N'hésitez pas à nous contacter. Notre équipe est là pour vous aider.
      </p>
    </div>
    
    <div class="contact-grid">
      <div class="contact-form-section">
        <h2>Formulaire de contact</h2>
        
        <form @submit.prevent="submitForm" class="contact-form">
          <div class="form-group">
            <label for="name">Nom complet</label>
            <input 
              id="name" 
              v-model="form.name" 
              type="text" 
              placeholder="Votre nom"
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
            <label for="subject">Sujet</label>
            <select id="subject" v-model="form.subject" required>
              <option value="" disabled selected>Sélectionnez un sujet</option>
              <option value="support">Support technique</option>
              <option value="account">Question sur mon compte</option>
              <option value="payment">Problème de paiement</option>
              <option value="suggestion">Suggestion</option>
              <option value="partnership">Partenariat</option>
              <option value="other">Autre</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="message">Message</label>
            <textarea 
              id="message" 
              v-model="form.message" 
              placeholder="Votre message"
              rows="6"
              required
            ></textarea>
          </div>
          
          <button type="submit" class="submit-button" :disabled="isSubmitting">
            {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le message' }}
          </button>
          
          <div v-if="formSuccess" class="success-message">
            Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
          </div>
          
          <div v-if="formError" class="error-message">
            {{ formError }}
          </div>
        </form>
      </div>
      
      <div class="contact-info-section">
        <h2>Informations de contact</h2>
        
        <div class="contact-info">
          <div class="contact-item">
            <div class="contact-icon">✉️</div>
            <div class="contact-details">
              <h3>Email</h3>
              <p><a href="mailto:contact@gamebet.com">contact@gamebet.com</a></p>
            </div>
          </div>
          
          <div class="contact-item">
            <div class="contact-icon">🕒</div>
            <div class="contact-details">
              <h3>Horaires du support</h3>
              <p>7j/7, 24h/24</p>
            </div>
          </div>
          
          <div class="contact-item">
            <div class="contact-icon">🌐</div>
            <div class="contact-details">
              <h3>Réseaux sociaux</h3>
              <div class="social-links">
                <a href="#" target="_blank" class="social-link">Twitter</a>
                <a href="#" target="_blank" class="social-link">Facebook</a>
                <a href="#" target="_blank" class="social-link">Instagram</a>
                <a href="#" target="_blank" class="social-link">Discord</a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="faq-link">
          <h3>Questions fréquentes</h3>
          <p>
            Avant de nous contacter, consultez notre 
            <router-link to="/faq">FAQ</router-link> 
            pour trouver rapidement des réponses à vos questions.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Contact',
  data() {
    return {
      form: {
        name: '',
        email: '',
        subject: '',
        message: ''
      },
      isSubmitting: false,
      formSuccess: false,
      formError: null
    };
  },
  methods: {
    submitForm() {
      this.isSubmitting = true;
      this.formSuccess = false;
      this.formError = null;
      
      // Simulation d'un appel API
      setTimeout(() => {
        // Simuler une réponse réussie
        this.isSubmitting = false;
        this.formSuccess = true;
        
        // Réinitialiser le formulaire
        this.form = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };
        
        // Dans une implémentation réelle, nous enverrions les données du formulaire à un backend
      }, 1500);
    }
  }
};
</script>

<style scoped>
.contact-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #ffffff;
}

.contact-intro {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
  margin-bottom: 3rem;
}

.contact-intro p {
  font-size: 1.1rem;
  color: #8c8a97;
}

.contact-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2rem;
}

h2 {
  color: #8c52ff;
  margin-bottom: 1.5rem;
}

.contact-form-section {
  background-color: #1a1333;
  border-radius: 8px;
  padding: 2rem;
}

.contact-form {
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
  font-weight: bold;
  color: #ffffff;
}

input[type="text"],
input[type="email"],
select,
textarea {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #2c2541;
  color: #ffffff;
}

textarea {
  resize: vertical;
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

.success-message {
  padding: 1rem;
  background-color: rgba(0, 255, 0, 0.1);
  color: #4caf50;
  border-radius: 4px;
}

.error-message {
  padding: 1rem;
  background-color: rgba(255, 0, 0, 0.1);
  color: #f44336;
  border-radius: 4px;
}

.contact-info-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background-color: #1a1333;
  border-radius: 8px;
  padding: 1.5rem;
}

.contact-icon {
  font-size: 1.5rem;
}

.contact-details {
  flex: 1;
}

.contact-details h3 {
  margin: 0;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.contact-details p {
  margin: 0;
  color: #8c8a97;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.social-link {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #2c2541;
  color: #ffffff;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.social-link:hover {
  background-color: #8c52ff;
}

.faq-link {
  background-color: #1a1333;
  border-radius: 8px;
  padding: 1.5rem;
}

.faq-link h3 {
  margin: 0;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.faq-link p {
  margin: 0;
  color: #8c8a97;
}

.faq-link a {
  color: #8c52ff;
  text-decoration: none;
}

.faq-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
