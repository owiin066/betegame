<template>
  <div class="wallet-container">
    <h1>Votre Portefeuille</h1>
    <div class="balance-card">
      <div class="balance-amount">
        <span class="balance-label">Solde disponible</span>
        <span class="balance-value">{{ formatCurrency(balance) }}</span>
      </div>
      
      <div class="wallet-actions">
        <button @click="activeTab = 'deposit'" :class="{ active: activeTab === 'deposit' }">Déposer</button>
        <button @click="activeTab = 'withdraw'" :class="{ active: activeTab === 'withdraw' }">Retirer</button>
        <button @click="activeTab = 'history'" :class="{ active: activeTab === 'history' }">Historique</button>
      </div>
    </div>
    
    <!-- Dépôt -->
    <div v-if="activeTab === 'deposit'" class="tab-content">
      <h2>Déposer des fonds</h2>
      <form @submit.prevent="handleDeposit" class="deposit-form">
        <div class="form-group">
          <label for="amount">Montant (€)</label>
          <input 
            id="amount" 
            v-model="depositForm.amount" 
            type="number" 
            min="10" 
            step="1" 
            placeholder="Entrez le montant à déposer"
            required
          />
          <span class="form-hint">Minimum 10€</span>
        </div>
        
        <div class="form-group">
          <label>Méthode de paiement</label>
          <div class="payment-methods">
            <div 
              class="payment-method" 
              :class="{ active: depositForm.method === 'card' }"
              @click="depositForm.method = 'card'"
            >
              <span class="payment-icon">💳</span>
              <span class="payment-name">Carte bancaire</span>
            </div>
            
            <div 
              class="payment-method" 
              :class="{ active: depositForm.method === 'paypal' }"
              @click="depositForm.method = 'paypal'"
            >
              <span class="payment-icon">🅿️</span>
              <span class="payment-name">PayPal</span>
            </div>
            
            <div 
              class="payment-method" 
              :class="{ active: depositForm.method === 'crypto' }"
              @click="depositForm.method = 'crypto'"
            >
              <span class="payment-icon">₿</span>
              <span class="payment-name">Crypto</span>
            </div>
          </div>
        </div>
        
        <div v-if="depositForm.method === 'card'" class="card-details">
          <div class="form-group">
            <label for="cardNumber">Numéro de carte</label>
            <input id="cardNumber" type="text" placeholder="1234 5678 9012 3456" required />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="expiryDate">Date d'expiration</label>
              <input id="expiryDate" type="text" placeholder="MM/AA" required />
            </div>
            
            <div class="form-group">
              <label for="cvv">CVV</label>
              <input id="cvv" type="text" placeholder="123" required />
            </div>
          </div>
          
          <div class="form-group">
            <label for="cardName">Nom sur la carte</label>
            <input id="cardName" type="text" placeholder="JEAN DUPONT" required />
          </div>
        </div>
        
        <button type="submit" class="submit-button" :disabled="isSubmitting">
          {{ isSubmitting ? 'Traitement en cours...' : 'Déposer maintenant' }}
        </button>
        
        <div class="security-note">
          <span class="security-icon">🔒</span>
          <span>Paiement sécurisé avec cryptage SSL</span>
        </div>
      </form>
    </div>
    
    <!-- Retrait -->
    <div v-if="activeTab === 'withdraw'" class="tab-content">
      <h2>Retirer des fonds</h2>
      <form @submit.prevent="handleWithdraw" class="withdraw-form">
        <div class="form-group">
          <label for="withdrawAmount">Montant (€)</label>
          <input 
            id="withdrawAmount" 
            v-model="withdrawForm.amount" 
            type="number" 
            min="10" 
            max="balance" 
            step="1" 
            placeholder="Entrez le montant à retirer"
            required
          />
          <span class="form-hint">Minimum 10€, maximum {{ formatCurrency(balance) }}</span>
        </div>
        
        <div class="form-group">
          <label>Méthode de retrait</label>
          <div class="payment-methods">
            <div 
              class="payment-method" 
              :class="{ active: withdrawForm.method === 'bank' }"
              @click="withdrawForm.method = 'bank'"
            >
              <span class="payment-icon">🏦</span>
              <span class="payment-name">Virement bancaire</span>
            </div>
            
            <div 
              class="payment-method" 
              :class="{ active: withdrawForm.method === 'paypal' }"
              @click="withdrawForm.method = 'paypal'"
            >
              <span class="payment-icon">🅿️</span>
              <span class="payment-name">PayPal</span>
            </div>
          </div>
        </div>
        
        <div v-if="withdrawForm.method === 'bank'" class="bank-details">
          <div class="form-group">
            <label for="iban">IBAN</label>
            <input id="iban" type="text" placeholder="FR76 1234 5678 9012 3456 7890 123" required />
          </div>
          
          <div class="form-group">
            <label for="bic">BIC</label>
            <input id="bic" type="text" placeholder="ABCDEFGHIJK" required />
          </div>
          
          <div class="form-group">
            <label for="accountName">Titulaire du compte</label>
            <input id="accountName" type="text" placeholder="JEAN DUPONT" required />
          </div>
        </div>
        
        <div v-if="withdrawForm.method === 'paypal'" class="paypal-details">
          <div class="form-group">
            <label for="paypalEmail">Email PayPal</label>
            <input id="paypalEmail" type="email" placeholder="votre-email@example.com" required />
          </div>
        </div>
        
        <button type="submit" class="submit-button" :disabled="isSubmitting || withdrawForm.amount > balance">
          {{ isSubmitting ? 'Traitement en cours...' : 'Retirer maintenant' }}
        </button>
        
        <div class="security-note">
          <span class="security-icon">🔒</span>
          <span>Retrait sécurisé avec vérification d'identité</span>
        </div>
      </form>
    </div>
    
    <!-- Historique -->
    <div v-if="activeTab === 'history'" class="tab-content">
      <h2>Historique des transactions</h2>
      <div class="transaction-filters">
        <div class="filter-group">
          <label>Type</label>
          <select v-model="historyFilters.type">
            <option value="all">Tous</option>
            <option value="deposit">Dépôts</option>
            <option value="withdraw">Retraits</option>
            <option value="bet">Paris</option>
            <option value="win">Gains</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Période</label>
          <select v-model="historyFilters.period">
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
            <option value="365">12 derniers mois</option>
          </select>
        </div>
      </div>
      
      <div class="transaction-list">
        <div v-for="(transaction, index) in filteredTransactions" :key="index" class="transaction-item">
          <div class="transaction-icon" :class="transaction.type">
            <span v-if="transaction.type === 'deposit'">💰</span>
            <span v-else-if="transaction.type === 'withdraw'">💸</span>
            <span v-else-if="transaction.type === 'bet'">🎮</span>
            <span v-else-if="transaction.type === 'win'">🏆</span>
          </div>
          
          <div class="transaction-details">
            <div class="transaction-title">{{ transaction.description }}</div>
            <div class="transaction-date">{{ formatDate(transaction.date) }}</div>
          </div>
          
          <div class="transaction-amount" :class="{ 'positive': transaction.amount > 0, 'negative': transaction.amount < 0 }">
            {{ transaction.amount > 0 ? '+' : '' }}{{ formatCurrency(transaction.amount) }}
          </div>
        </div>
        
        <div v-if="filteredTransactions.length === 0" class="empty-state">
          Aucune transaction pour la période sélectionnée.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Wallet',
  data() {
    return {
      activeTab: 'deposit',
      balance: 250.75,
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
      transactions: [
        {
          type: 'deposit',
          description: 'Dépôt par carte bancaire',
          date: new Date(2025, 3, 5),
          amount: 100
        },
        {
          type: 'bet',
          description: 'Pari sur RisingSun',
          date: new Date(2025, 3, 5),
          amount: -50
        },
        {
          type: 'win',
          description: 'Gain sur RisingSun',
          date: new Date(2025, 3, 5),
          amount: 87.50
        },
        {
          type: 'bet',
          description: 'Pari sur ShadowAcc',
          date: new Date(2025, 3, 4),
          amount: -25
        },
        {
          type: 'deposit',
          description: 'Dépôt par PayPal',
          date: new Date(2025, 3, 3),
          amount: 200
        },
        {
          type: 'bet',
          description: 'Pari sur JinMaster',
          date: new Date(2025, 3, 3),
          amount: -100
        },
        {
          type: 'win',
          description: 'Gain sur JinMaster',
          date: new Date(2025, 3, 3),
          amount: 145
        },
        {
          type: 'withdraw',
          description: 'Retrait par virement bancaire',
          date: new Date(2025, 3, 1),
          amount: -100
        }
      ]
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
      return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    handleDeposit() {
      if (!this.depositForm.amount || this.depositForm.amount < 10) {
        alert('Veuillez entrer un montant valide (minimum 10€)');
        return;
      }
      
      this.isSubmitting = true;
      
      // Simulation d'un appel API
      setTimeout(() => {
        this.balance += parseFloat(this.depositForm.amount);
        this.transactions.unshift({
          type: 'deposit',
          description: `Dépôt par ${this.getMethodName(this.depositForm.method)}`,
          date: new Date(),
          amount: parseFloat(this.depositForm.amount)
        });
        
        this.depositForm.amount = null;
        this.isSubmitting = false;
        alert('Dépôt effectué avec succès !');
      }, 1500);
    },
    handleWithdraw() {
      if (!this.withdrawForm.amount || this.withdrawForm.amount < 10 || this.withdrawForm.amount > this.balance) {
        alert('Veuillez entrer un montant valide (minimum 10€, maximum ' + this.formatCurrency(this.balance) + ')');
        return;
      }
      
      this.isSubmitting = true;
      
      // Simulation d'un appel API
      setTimeout(() => {
        this.balance -= parseFloat(this.withdrawForm.amount);
        this.transactions.unshift({
          type: 'withdraw',
          description: `Retrait par ${this.getMethodName(this.withdrawForm.method)}`,
          date: new Date(),
          amount: -parseFloat(this.withdrawForm.amount)
        });
        
        this.withdrawForm.amount = null;
        this.isSubmitting = false;
        alert('Demande de retrait effectuée avec succès !');
      }, 1500);
    },
    getMethodName(method) {
      switch (method) {
        case 'card': return 'carte bancaire';
        case 'paypal': return 'PayPal';
        case 'crypto': return 'crypto-monnaie';
        case 'bank': return 'virement bancaire';
        default: return method;
      }
    }
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

h1 {
  margin-bottom: 1.5rem;
  color: #ffffff;
  text-align: center;
}

h2 {
  margin-bottom: 1.5rem;
  color: #8c52ff;
}

.balance-card {
  background-color: #1a1333;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.balance-amount {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.balance-label {
  font-size: 1.2rem;
  color: #8c8a97;
  margin-bottom: 0.5rem;
}

.balance-value {
  font-size: 3rem;
  font-weight: bold;
  color: #8c52ff;
}

.wallet-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.wallet-actions button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background-color: #2c2541;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.wallet-actions button.active {
  background-color: #8c52ff;
}

.tab-content {
  background-color: #1a1333;
  border-radius: 8px;
  padding: 2rem;
}

.deposit-form, .withdraw-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

label {
  font-weight: bold;
  color: #ffffff;
}

input[type="text"],
input[type="number"],
input[type="email"],
select {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #2c2541;
  color: #ffffff;
}

.form-hint {
  font-size: 0.8rem;
  color: #8c8a97;
}

.payment-methods {
  display: flex;
  gap: 1rem;
}

.payment-method {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: #2c2541;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-method.active {
  background-color: #3a3158;
  border: 2px solid #8c52ff;
}

.payment-icon {
  font-size: 1.5rem;
}

.payment-name {
  font-size: 0.9rem;
}

.card-details, .bank-details, .paypal-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: #2c2541;
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

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #8c8a97;
}

.transaction-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: #2c2541;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
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
  background-color: rgba(0, 191, 255, 0.1);
}

.transaction-details {
  flex: 1;
}

.transaction-title {
  font-weight: bold;
}

.transaction-date {
  font-size: 0.8rem;
  color: #8c8a97;
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
}
</style>
