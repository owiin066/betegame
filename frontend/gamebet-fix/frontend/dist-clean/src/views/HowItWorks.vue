<template>
  <div class="how-it-works-container">
    <h1>Comment ça marche</h1>
    
    <div class="steps-container">
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h2>Créez votre compte</h2>
          <p>Inscrivez-vous gratuitement en quelques secondes. Choisissez entre un compte viewer pour parier ou un compte streamer pour diffuser vos parties.</p>
          <img src="https://via.placeholder.com/600x300/1a1333/ffffff?text=Inscription" alt="Inscription" class="step-image">
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h2>Déposez des fonds (viewers)</h2>
          <p>Alimentez votre portefeuille avec le montant de votre choix via nos méthodes de paiement sécurisées.</p>
          <img src="https://via.placeholder.com/600x300/1a1333/ffffff?text=Dépôt" alt="Dépôt" class="step-image">
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h2>Configurez votre stream (streamers)</h2>
          <p>Utilisez votre clé de stream unique pour configurer votre logiciel de streaming préféré (OBS, Streamlabs, etc.).</p>
          <img src="https://via.placeholder.com/600x300/1a1333/ffffff?text=Configuration+Stream" alt="Configuration Stream" class="step-image">
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">4</div>
        <div class="step-content">
          <h2>Placez vos paris (viewers)</h2>
          <p>Parcourez les streams en direct, analysez les cotes et placez vos paris sur les streamers que vous pensez voir gagner.</p>
          <img src="https://via.placeholder.com/600x300/1a1333/ffffff?text=Paris" alt="Paris" class="step-image">
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">5</div>
        <div class="step-content">
          <h2>Gérez vos paris (streamers)</h2>
          <p>Ouvrez et fermez les paris entre vos parties. Notre système d'IA vérifie automatiquement les résultats pour garantir l'équité.</p>
          <img src="https://via.placeholder.com/600x300/1a1333/ffffff?text=Gestion+Paris" alt="Gestion Paris" class="step-image">
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">6</div>
        <div class="step-content">
          <h2>Recevez vos gains</h2>
          <p>Les gains sont automatiquement crédités sur votre portefeuille après vérification des résultats. Les streamers reçoivent une commission sur les paris placés.</p>
          <img src="https://via.placeholder.com/600x300/1a1333/ffffff?text=Gains" alt="Gains" class="step-image">
        </div>
      </div>
    </div>
    
    <div class="faq-section">
      <h2>Questions fréquentes</h2>
      
      <div class="faq-item">
        <h3>Comment les cotes sont-elles calculées ?</h3>
        <p>Les cotes sont calculées automatiquement en fonction des performances passées du streamer, de son taux de victoire et d'autres facteurs. Elles sont mises à jour en temps réel pour refléter les chances de victoire actuelles.</p>
      </div>
      
      <div class="faq-item">
        <h3>Comment l'IA vérifie-t-elle les résultats ?</h3>
        <p>Notre système d'intelligence artificielle analyse le flux vidéo et les données du jeu pour déterminer automatiquement si le streamer a gagné ou perdu sa partie. Cette vérification garantit l'équité et la transparence des paris.</p>
      </div>
      
      <div class="faq-item">
        <h3>Quels jeux sont supportés ?</h3>
        <p>GameBet supporte actuellement les jeux les plus populaires comme Fortnite, Call of Duty, Valorant, League of Legends, Counter-Strike et bien d'autres. Nous ajoutons régulièrement de nouveaux jeux à notre catalogue.</p>
      </div>
      
      <div class="faq-item">
        <h3>Quelle commission les streamers reçoivent-ils ?</h3>
        <p>Les streamers reçoivent une commission de 5% sur tous les paris placés sur leurs streams, qu'ils gagnent ou perdent la partie. C'est une nouvelle façon de monétiser votre contenu tout en engageant votre communauté.</p>
      </div>
    </div>
    
    <div class="cta-section">
      <h2>Prêt à commencer ?</h2>
      <router-link to="/register" class="cta-button">Créer un compte</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HowItWorks'
}
</script>

<style scoped>
.how-it-works-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
}

h1 {
  text-align: center;
  margin-bottom: 3rem;
  color: #ffffff;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin-bottom: 3rem;
}

.step {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.step-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #8c52ff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h2 {
  color: #8c52ff;
  margin-top: 0;
  margin-bottom: 1rem;
}

.step-content p {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.step-image {
  width: 100%;
  border-radius: 8px;
}

.faq-section {
  background-color: #1a1333;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 3rem;
}

.faq-section h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #8c52ff;
}

.faq-item {
  margin-bottom: 1.5rem;
}

.faq-item h3 {
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.faq-item p {
  color: #8c8a97;
  line-height: 1.6;
}

.cta-section {
  text-align: center;
  margin-bottom: 2rem;
}

.cta-section h2 {
  margin-bottom: 1.5rem;
  color: #ffffff;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #8c52ff;
  color: #ffffff;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  font-size: 1.2rem;
  transition: background-color 0.3s ease;
}

.cta-button:hover {
  background-color: #7b45e0;
}

@media (max-width: 768px) {
  .step {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .step-number {
    margin-bottom: 1rem;
  }
}
</style>
