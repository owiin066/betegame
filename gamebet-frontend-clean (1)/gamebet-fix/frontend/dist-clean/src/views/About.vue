<template>
  <div class="about-container">
    <h1>À propos de GameBet</h1>
    
    <section class="about-section">
      <h2>Notre mission</h2>
      <p>
        GameBet est née d'une passion pour l'eSport et le streaming. Notre mission est de créer une plateforme 
        innovante qui rapproche les streamers et leurs communautés en permettant aux viewers de parier sur les 
        performances de leurs streamers préférés.
      </p>
      <p>
        Nous croyons que les paris sur les performances des streamers ajoutent une nouvelle dimension d'engagement 
        et d'excitation à l'expérience de visionnage, tout en offrant aux streamers une nouvelle façon de monétiser 
        leur contenu et de renforcer leur communauté.
      </p>
    </section>
    
    <section class="about-section">
      <h2>Comment ça fonctionne</h2>
      <div class="how-it-works">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Inscription</h3>
            <p>Créez un compte en tant que viewer pour parier ou en tant que streamer pour recevoir des paris.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Streaming et paris</h3>
            <p>Les streamers diffusent leurs parties en direct, et les viewers peuvent parier sur leur victoire.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Cotes dynamiques</h3>
            <p>Les cotes sont calculées automatiquement en fonction des performances passées du streamer.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3>Vérification des résultats</h3>
            <p>Notre système d'IA vérifie automatiquement les résultats des parties pour garantir l'équité.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">5</div>
          <div class="step-content">
            <h3>Gains et récompenses</h3>
            <p>Les viewers gagnants reçoivent leurs gains, et les streamers reçoivent une commission sur les paris.</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="about-section">
      <h2>Notre équipe</h2>
      <div class="team-grid">
        <div class="team-member">
          <div class="member-avatar">JD</div>
          <h3>Jean Dupont</h3>
          <p>Fondateur & CEO</p>
        </div>
        
        <div class="team-member">
          <div class="member-avatar">ML</div>
          <h3>Marie Lefèvre</h3>
          <p>CTO</p>
        </div>
        
        <div class="team-member">
          <div class="member-avatar">PB</div>
          <h3>Pierre Blanc</h3>
          <p>Responsable Produit</p>
        </div>
        
        <div class="team-member">
          <div class="member-avatar">SM</div>
          <h3>Sophie Martin</h3>
          <p>Responsable Marketing</p>
        </div>
      </div>
    </section>
    
    <section class="about-section">
      <h2>Nos valeurs</h2>
      <div class="values-grid">
        <div class="value-card">
          <div class="value-icon">🔒</div>
          <h3>Sécurité</h3>
          <p>Nous garantissons la sécurité des transactions et la protection des données personnelles.</p>
        </div>
        
        <div class="value-card">
          <div class="value-icon">⚖️</div>
          <h3>Équité</h3>
          <p>Notre système d'IA assure l'équité des paris et la transparence des résultats.</p>
        </div>
        
        <div class="value-card">
          <div class="value-icon">🤝</div>
          <h3>Communauté</h3>
          <p>Nous favorisons les liens entre streamers et viewers pour créer une communauté engagée.</p>
        </div>
        
        <div class="value-card">
          <div class="value-icon">🚀</div>
          <h3>Innovation</h3>
          <p>Nous innovons constamment pour offrir la meilleure expérience possible à nos utilisateurs.</p>
        </div>
      </div>
    </section>
    
    <section class="about-section">
      <h2>Contactez-nous</h2>
      <p>
        Vous avez des questions ou des suggestions ? N'hésitez pas à nous contacter à 
        <a href="mailto:contact@gamebet.com">contact@gamebet.com</a> ou via notre 
        <router-link to="/contact">formulaire de contact</router-link>.
      </p>
    </section>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

<style scoped>
.about-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #ffffff;
}

.about-section {
  margin-bottom: 3rem;
  background-color: #1a1333;
  border-radius: 8px;
  padding: 2rem;
}

h2 {
  color: #8c52ff;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #2c2541;
  padding-bottom: 0.5rem;
}

p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.how-it-works {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step {
  display: flex;
  gap: 1.5rem;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #8c52ff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.team-grid, .values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
}

.team-member {
  text-align: center;
}

.member-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #8c52ff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: bold;
}

.team-member h3 {
  margin: 0;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.team-member p {
  margin: 0;
  color: #8c8a97;
}

.value-card {
  background-color: #2c2541;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.value-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.value-card h3 {
  margin: 0;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.value-card p {
  margin: 0;
  color: #8c8a97;
  font-size: 0.9rem;
}

a {
  color: #8c52ff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
