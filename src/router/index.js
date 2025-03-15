import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken')
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // This route requires auth, check if logged in
    if (!isAuthenticated) {
      next({ name: 'Home' })
    } else {
      next()
    }
  } else {
    // If we're authenticated and trying to access login page, redirect to dashboard
    if (isAuthenticated && to.name === 'Home') {
      next({ name: 'Dashboard' })
    } else {
      next()
    }
  }
})

export default router 