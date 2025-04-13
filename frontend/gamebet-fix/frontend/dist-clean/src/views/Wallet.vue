<template>
  <div class="wallet-container">
    <div class="wallet-header">
      <h1>Portefeuille</h1>
      <div class="wallet-balance">
        <span class="balance-label">Solde actuel</span>
        <span class="balance-amount">{{ formatCurrency(balance) }}</span>
      </div>
    </div>
    
    <div class="wallet-tabs">
      <button 
        @click="activeTab = 'deposit'" 
        :class="{ active: activeTab === 'deposit' }"
        class="tab-button"
      >
        Dépôt
      </button>
      
      <button 
        @click="activeTab = 'withdraw'" 
        :class="{ active: activeTab === 'withdraw' }"
        class="tab-button"
      >
        Retrait
      </button>
      
      <button 
        @click="activeTab = 'history'" 
        :class="{ active: activeTab === 'history' }"
        class="tab-button"
      >
        Historique
      </button>
    </div>
    
    <div class="wallet-content">
      <!-- Dépôt -->
      <div v-if="activeTab === 'deposit'" class="deposit-tab">
        <h2>Déposer de l'argent</h2>
        
        <form @submit.prevent="handleDeposit" class="deposit-form">
          <div class="form-group">
            <label for="depositAmount">Montant (€)</label>
            <input 
              id="depositAmount" 
              v-model="depositForm.amount" 
              type="number" 
              min="10" 
              step="5"
              placeholder="Minimum 10€"
              required
            />
          </div>
          
          <div class="form-group">
            <label>Méthode de paiement</label>
            <div class="payment-methods">
              <div 
                class="payment-method" 
                :class="{ active: depositForm.method === 'card' }"
                @click="depositForm.method = 'card'"
              >
                <span class="method-icon">💳</span>
                <span class="method-name">Carte bancaire</span>
              </div>
              
              <div 
                class="payment-method" 
                :class="{ active: depositForm.method === 'paypal' }"
                @click="depositForm.method = 'paypal'"
              >
                <span class="method-icon">🅿️</span>
                <span class="method-name">PayPal</span>
              </div>
              
              <div 
                class="payment-method" 
                :class="{ active: depositForm.method === 'crypto' }"
                @click="depositForm.method = 'crypto'"
              >
                <span class="method-icon">₿</span>
                <span class="method-name">Crypto</span>
              </div>
            </div>
          </div>
          
          <button type="submit" class="submit-button" :disabled="isSubmitting">
            {{ isSubmitting ? 'Traitement en cours...' : 'Déposer maintenant' }}
          </button>
          
          <p class="security-note">
            <span class="security-icon">🔒</span>
            Paiement sécurisé avec authentification 3D Secure
          </p>
        </form>
      </div>
      
      <!-- Retrait -->
      <div v-if="activeTab === 'withdraw'" class="withdraw-tab">
        <h2>Retirer de l'argent</h2>
        
        <form @submit.prevent="handleWithdraw" class="withdraw-form">
          <div class="form-group">
            <label for="withdrawAmount">Montant (€)</label>
            <input 
              id="withdrawAmount" 
              v-model="withdrawForm.amount" 
              type="number" 
              min="10" 
              :max="balance"
              step="5"
              placeholder="Minimum 10€"
              required
            />
            <span class="available-balance">
              Disponible: {{ formatCurrency(balance) }}
            </span>
          </div>
          
          <div class="form-group">
            <label>Méthode de retrait</label>
            <div class="payment-methods">
              <div 
                class="payment-method" 
                :class="{ active: withdrawForm.method === 'bank' }"
                @click="withdrawForm.method = 'bank'"
              >
                <span class="method-icon">🏦</span>
                <span class="method-name">Virement bancaire</span>
              </div>
              
              <div 
                class="payment-method" 
                :class="{ active: withdrawForm.method === 'paypal' }"
                @click="withdrawForm.method = 'paypal'"
              >
                <span class="method-icon">🅿️</span>
                <span class="method-name">PayPal</span>
              </div>
            </div>
          </div>
          
          <div v-if="withdrawForm.method === 'bank'" class="form-group">
            <label for="iban">IBAN</label>
            <input 
              id="iban" 
              type="text" 
              placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
              required
            />
          </div>
          
          <div v-if="withdrawForm.method === 'bank'" class="form-group">
            <label for="bic">BIC</label>
            <input 
              id="bic" 
              type="text" 
              placeholder="BNPAFRPPXXX"
              required
            />
          </div>
          
          <div v-if="withdrawForm.method === 'bank'" class="form-group">
            <label for="accountName">Titulaire du compte</label>
            <input 
              id="accountName" 
              type="text" 
              placeholder="Prénom NOM"
              required
            />
          </div>
          
          <div v-if="withdrawForm.method === 'paypal'" class="form-group">
            <label for="paypalEmail">Email PayPal</label>
            <input 
              id="paypalEmail" 
              type="email" 
              placeholder="votre.email@exemple.com"
              required
            />
          </div>
          
          <button type="submit" class="submit-button" :disabled="isSubmitting || balance < 10">
            {{ isSubmitting ? 'Traitement en cours...' : 'Retirer maintenant' }}
          </button>
          
          <p class="security-note">
            <span class="security-icon">🔒</span>
            Les retraits sont traités sous 1 à 3 jours ouvrés
          </p>
        </form>
      </div>
      
      <!-- Historique -->
      <div v-if="activeTab === 'history'" class="history-tab">
        <h2>Historique des transactions</h2>
        
        <div class="history-filters">
          <div class="filter-group">
            <label for="typeFilter">Type</label>
            <select id="typeFilter" v-model="historyFilters.type">
              <option value="all">Tous</option>
              <option value="deposit">Dépôts</option>
              <option value="withdraw">Retraits</option>
              <option value="bet">Paris</option>
              <option value="win">Gains</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="periodFilter">Période</label>
            <select id="periodFilter" v-model="historyFilters.period">
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
              <option value="365">12 derniers mois</option>
            </select>
          </div>
        </div>
        
        <div v-if="filteredTransactions.length === 0" class="empty-state">
          Aucune transaction pour la période sélectionnée.
        </div>
        
        <div v-else class="transactions-list">
          <div v-for="(transaction, index) in filteredTransactions" :key="index" class="transaction-item">
            <div class="transaction-icon" :class="transaction.type">
              <span v-if="transaction.type === 'deposit'">💰</span>
              <span v-else-if="transaction.type === 'withdraw'">💸</span>
              <span v-else-if="transaction.type === 'bet'">🎮</span>
              <span v-else-if="transaction.type === 'win'">🏆</span>
            </div>
            
            <div class="transaction-details">
              <div class="transaction-title">
                {{ transaction.description }}
              </div>
              <div class="transaction-date">
                {{ formatDate(transaction.date) }}
              </div>
            </div>
            
            <div class="transaction-amount" :class="{ 'positive': transaction.type === 'deposit' || transaction.type === 'win', 'negative': transaction.type === 'withdraw' || transaction.type === 'bet' }">
              {{ (transaction.type === 'deposit' || transaction.type === 'win' ? '+' : '-') + formatCurrency(transaction.amount) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import axios from 'axios';

export default {
  name: 'Wallet',
  data() {
    return {
      activeTab: 'deposit',
      balance: 0, // Initialiser à 0 au lieu de 250.75
      isSubmitting: false,
      depositForm: {
        amount: null,
        method: 'card'
      },
      withdrawForm: {
        amount: null,
        method: 'bank'
      },
      historyFilters: {
        type: 'all',
        period: '30'
      },
      transactions: [] // Tableau vide au lieu des transactions fictives
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser']),
    filteredTransactions() {
      const now = new Date();
      const periodStart = new Date();
      periodStart.setDate(now.getDate() - parseInt(this.historyFilters.period));
      
      return this.transactions.filter(transaction => {
        // Filtre par type
        if (this.historyFilters.type !== 'all' && transaction.type !== this.historyFilters.type) {
          return false;
        }
        
        // Filtre par période
        if (transaction.date < periodStart) {
          return false;
        }
        
        return true;
      }).sort((a, b) => b.date - a.date); // Tri par date décroissante
    }
  },
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    async fetchWalletData() {
      try {
        // Appel API réel pour récupérer le solde et les transactions
        const response = await axios.get('/api/wallet', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data) {
          this.balance = response.data.balance || 0;
          this.transactions = response.data.transactions || [];
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données du portefeuille:', error);
      }
    },
    async handleDeposit() {
      if (!this.depositForm.amount || this.depositForm.amount < 10) {
        alert('Veuillez entrer un montant valide (minimum 10€)');
        return;
      }
      
      this.isSubmitting = true;
      
      try {
        // Redirection vers la page de paiement 3D Secure
        // Dans une implémentation réelle, ceci serait un appel à une API de paiement
        const response = await axios.post('/api/payment/create-session', {
          amount: parseFloat(this.depositForm.amount),
          method: this.depositForm.method
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data && response.data.url) {
          // Rediriger vers la page de paiement Stripe
          window.location.href = response.data.url;
        } else {
          throw new Error('Erreur lors de la création de la session de paiement');
        }
      } catch (error) {
        console.error('Erreur lors du dépôt:', error);
        alert('Une erreur est survenue lors du traitement du paiement.');
        this.isSubmitting = false;
      }
    },
    async handleWithdraw() {
      if (!this.withdrawForm.amount || this.withdrawForm.amount < 10 || this.withdrawForm.amount > this.balance) {
        alert('Veuillez entrer un montant valide (minimum 10€, maximum ' + this.formatCurrency(this.balance) + ')');
        return;
      }
      
      this.isSubmitting = true;
      
      try {
        // Appel API réel pour effectuer un retrait
        const response = await axios.post('/api/wallet/withdraw', {
          amount: parseFloat(this.withdrawForm.amount),
          method: this.withdrawForm.method,
          accountDetails: this.getAccountDetails()
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data && response.data.success) {
          this.balance = response.data.balance;
          this.fetchWalletData(); // Rafraîchir les données du portefeuille
          this.withdrawForm.amount = null;
          alert('Demande de retrait effectuée avec succès !');
        }
      } catch (error) {
        console.error('Erreur lors du retrait:', error);
        alert('Une erreur est survenue lors du traitement du retrait.');
      } finally {
        this.isSubmitting = false;
      }
    },
    getMethodName(method) {
      switch (method) {
        case 'card': return 'carte bancaire';
        case 'paypal': return 'PayPal';
        case 'crypto': return 'crypto-monnaie';
        case 'bank': return 'virement bancaire';
        default: return method;
      }
    },
    getAccountDetails() {
      // Récupérer les détails du compte en fonction de la méthode de retrait
      if (this.withdrawForm.method === 'bank') {
        return {
          iban: document.getElementById('iban').value,
          bic: document.getElementById('bic').value,
          accountName: document.getElementById('accountName').value
        };
      } else if (this.withdrawForm.method === 'paypal') {
        return {
          email: document.getElementById('paypalEmail').value
        };
      }
      return {};
    }
  },
  created() {
    // Charger les données du portefeuille au chargement du composant
    this.fetchWalletData();
  },
  beforeRouteEnter(to, from, next) {
    // Cette route nécessite une authentification
    next(vm => {
      if (!vm.$store.getters.isAuthenticated) {
        vm.$router.push('/login');
      }
    });
  }
};
</script>

<style scoped>
.wallet-container {
  max-width: 800px;
  margin: 0 auto;
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.wallet-header h1 {
  margin: 0;
  color: #ffffff;
}

.wallet-balance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.balance-label {
  color: #8c8a97;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.balance-amount {
  color: #8c52ff;
  font-size: 2rem;
  font-weight: bold;
}

.wallet-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #2c2541;
}

.tab-button {
  padding: 1rem 2rem;
  background-color: transparent;
  border: none;
  color: #8c8a97;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  color: #8c52ff;
  border-bottom-color: #8c52ff;
}

.wallet-content h2 {
  margin-top: 0;
  margin-bottom: 2rem;
  color: #ffffff;
}

.deposit-form, .withdraw-form {
  background-color: #1a1333;
  border-radius: 8px;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ffffff;
  font-weight: bold;
}

.form-group input[type="number"],
.form-group input[type="text"],
.form-group input[type="email"] {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #2c2541;
  color: #ffffff;
}

.available-balance {
  display: block;
  margin-top: 0.5rem;
  color: #8c8a97;
  font-size: 0.9rem;
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.payment-method {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #2c2541;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-method.active {
  background-color: #3a3158;
  border: 2px solid #8c52ff;
}

.method-icon {
  font-size: 2rem;
}

.method-name {
  color: #ffffff;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background-color: #8c52ff;
  border: none;
  border-radius: 4px;
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

.security-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: #8c8a97;
  font-size: 0.9rem;
  text-align: center;
  justify-content: center;
}

.security-icon {
  font-size: 1.2rem;
}

.history-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  color: #ffffff;
  font-weight: bold;
}

.filter-group select {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background-color: #2c2541;
  color: #ffffff;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #1a1333;
  border-radius: 8px;
  padding: 1rem;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
}

.transaction-icon.deposit {
  background-color: rgba(0, 255, 0, 0.1);
}

.transaction-icon.withdraw {
  background-color: rgba(255, 0, 0, 0.1);
}

.transaction-icon.bet {
  background-color: rgba(255, 165, 0, 0.1);
}

.transaction-icon.win {
  background-color: rgba(0, 255, 255, 0.1);
}

.transaction-details {
  flex: 1;
}

.transaction-title {
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.transaction-date {
  color: #8c8a97;
  font-size: 0.9rem;
}

.transaction-amount {
  font-weight: bold;
}

.transaction-amount.positive {
  color: #4caf50;
}

.transaction-amount.negative {
  color: #f44336;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #8c8a97;
  background-color: #1a1333;
  border-radius: 8px;
}
</style>
