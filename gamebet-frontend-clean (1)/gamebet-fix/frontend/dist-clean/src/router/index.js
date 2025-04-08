import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import store from '../store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: () => import('../views/Wallet.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/streamer',
    name: 'Streamer',
    component: () => import('../views/Streamer.vue'),
    meta: { requiresAuth: true, requiresStreamer: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/how-it-works',
    name: 'HowItWorks',
    component: () => import('../views/HowItWorks.vue')
  },
  {
    path: '/become-streamer',
    name: 'BecomeStreamer',
    component: () => import('../views/BecomeStreamer.vue')
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../views/Terms.vue')
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../views/Privacy.vue')
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('../views/FAQ.vue')
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

// Navigation Guard pour vérifier l'authentification
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresStreamer = to.matched.some(record => record.meta.requiresStreamer);
  const isAuthenticated = store.getters.isAuthenticated;
  const isStreamer = store.getters.isStreamer;

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (requiresStreamer && !isStreamer) {
    next('/');
  } else {
    next();
  }
});

export default router;
