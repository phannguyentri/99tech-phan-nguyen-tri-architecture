import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import DashboardView from './views/DashboardView.vue'
import './assets/main.css'
import axios from 'axios'

// Configure axios to include credentials with all requests
axios.defaults.withCredentials = true;

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app') 