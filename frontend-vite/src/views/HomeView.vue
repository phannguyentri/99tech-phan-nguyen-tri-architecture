<template>
  <div class="home">
    <div class="card">
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'login' }]" 
          @click="activeTab = 'login'"
        >
          Login
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'register' }]" 
          @click="activeTab = 'register'"
        >
          Register
        </button>
      </div>
      
      <div v-if="activeTab === 'login'" class="tab-content">
        <h2>Login</h2>
        <div v-if="loginMessage" :class="['alert', loginMessage.type === 'error' ? 'alert-error' : 'alert-success']">
          {{ loginMessage.text }}
        </div>
        <form @submit.prevent="login">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input 
              id="login-email" 
              v-model="loginForm.email" 
              type="email" 
              required 
              placeholder="Enter your email"
            >
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input 
              id="login-password" 
              v-model="loginForm.password" 
              type="password" 
              required 
              placeholder="Enter your password"
            >
          </div>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
      </div>
      
      <div v-if="activeTab === 'register'" class="tab-content">
        <h2>Register</h2>
        <div v-if="registerMessage" :class="['alert', registerMessage.type === 'error' ? 'alert-error' : 'alert-success']">
          {{ registerMessage.text }}
        </div>
        <form @submit.prevent="register">
          <div class="form-group">
            <label for="register-username">Username</label>
            <input 
              id="register-username" 
              v-model="registerForm.username" 
              type="text" 
              required 
              placeholder="Choose a username"
            >
          </div>
          <div class="form-group">
            <label for="register-email">Email</label>
            <input 
              id="register-email" 
              v-model="registerForm.email" 
              type="email" 
              required 
              placeholder="Enter your email"
            >
          </div>
          <div class="form-group">
            <label for="register-password">Password</label>
            <input 
              id="register-password" 
              v-model="registerForm.password" 
              type="password" 
              required 
              placeholder="Choose a password"
            >
          </div>
          <button type="submit" class="btn btn-primary">Register</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const activeTab = ref('login')

const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  username: '',
  email: '',
  password: ''
})

const loginMessage = ref(null)
const registerMessage = ref(null)

onMounted(() => {
  // Check if user is already logged in
  const token = localStorage.getItem('token')
  if (token) {
    router.push('/dashboard')
  }
})

const login = async () => {
  try {
    loginMessage.value = null
    const response = await axios.post('/api/auth/login', loginForm.value)
    
    // Store token and user info
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    
    // Redirect to dashboard
    router.push('/dashboard')
  } catch (error) {
    loginMessage.value = {
      type: 'error',
      text: error.response?.data?.message || 'Login failed. Please try again.'
    }
  }
}

const register = async () => {
  try {
    registerMessage.value = null
    const response = await axios.post('/api/auth/register', registerForm.value)
    
    registerMessage.value = {
      type: 'success',
      text: 'Registration successful! You can now login.'
    }
    
    // Auto switch to login tab after successful registration
    setTimeout(() => {
      activeTab.value = 'login'
      loginForm.value.email = registerForm.value.email
      loginForm.value.password = registerForm.value.password
    }, 1500)
    
  } catch (error) {
    registerMessage.value = {
      type: 'error',
      text: error.response?.data?.message || 'Registration failed. Please try again.'
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 500px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #666;
  font-weight: bold;
}

.tab-btn.active {
  color: #3498db;
  border-bottom: 2px solid #3498db;
}

.tab-content {
  padding: 20px 0;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.btn {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
}
</style> 