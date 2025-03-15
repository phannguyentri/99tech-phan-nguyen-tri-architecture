<template>
  <div class="container">
    <div class="tab-header">
      <button 
        :class="['tab-button', { active: activeTab === 'login' }]" 
        @click="activeTab = 'login'"
      >Login</button>
      <button 
        :class="['tab-button', { active: activeTab === 'register' }]" 
        @click="activeTab = 'register'"
      >Register</button>
    </div>
    
    <!-- Login Tab -->
    <div v-show="activeTab === 'login'" class="tab-content">
      <div>
        <input 
          type="email" 
          v-model="loginForm.email" 
          placeholder="Email" 
          required
        >
        <input 
          type="password" 
          v-model="loginForm.password" 
          placeholder="Password" 
          required
        >
        <div v-if="loginError" class="error-message">{{ loginError }}</div>
        <div v-if="showAutoLogin" class="auto-login-message">
          <span>Auto login in {{ autoLoginCountdown }} seconds...</span>
        </div>
        <button 
          @click="login" 
          :disabled="isLoading"
        >{{ isLoading ? 'Loading...' : 'Login' }}</button>
      </div>
    </div>
    
    <!-- Register Tab -->
    <div v-show="activeTab === 'register'" class="tab-content">
      <div>
        <input 
          type="text" 
          v-model="registerForm.username" 
          placeholder="Username" 
          required
        >
        <input 
          type="email" 
          v-model="registerForm.email" 
          placeholder="Email" 
          required
        >
        <input 
          type="password" 
          v-model="registerForm.password" 
          placeholder="Password" 
          required
        >
        <div v-if="registerError" class="error-message">{{ registerError }}</div>
        <div v-if="registerSuccess" class="success-message">{{ registerSuccess }}</div>
        <button 
          @click="register" 
          :disabled="isLoading"
        >{{ isLoading ? 'Loading...' : 'Register' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Reactive state
const activeTab = ref('login')
const isLoading = ref(false)
const showAutoLogin = ref(false)
const autoLoginCountdown = ref(3)
const autoLoginInterval = ref(null)

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  email: '',
  password: ''
})

const loginError = ref('')
const registerError = ref('')
const registerSuccess = ref('')

// Methods
const login = async () => {
  loginError.value = ''
  isLoading.value = true
  
  // Validate input
  if (!loginForm.email || !loginForm.password) {
    loginError.value = 'Please enter email and password'
    isLoading.value = false
    return
  }
  
  try {
    const response = await axios.post('/api/auth/login', {
      email: loginForm.email,
      password: loginForm.password
    })
    
    const data = response.data
    
    if (!data.success) {
      loginError.value = data.message || 'Login failed'
      isLoading.value = false
      return
    }
    
    // Store auth data
    const authToken = data.token
    const currentUser = {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      score: data.user.score
    }
    
    localStorage.setItem('authToken', authToken)
    localStorage.setItem('currentUser', JSON.stringify(currentUser))
    
    // Redirect to dashboard
    router.push({ name: 'Dashboard' })
    
  } catch (error) {
    loginError.value = (error.response && error.response.data && error.response.data.message) || 'Error: ' + error.message
  } finally {
    isLoading.value = false
  }
}

const register = async () => {
  registerError.value = ''
  registerSuccess.value = ''
  isLoading.value = true
  
  // Validate input
  if (!registerForm.username || !registerForm.email || !registerForm.password) {
    registerError.value = 'Please fill in all fields'
    isLoading.value = false
    return
  }
  
  if (registerForm.password.length < 6) {
    registerError.value = 'Password must be at least 6 characters'
    isLoading.value = false
    return
  }
  
  try {
    const response = await axios.post('/api/auth/register', {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password
    })
    
    const data = response.data
    
    if (!data.success) {
      registerError.value = data.message || 'Registration failed'
      isLoading.value = false
      return
    }
    
    // Registration successful
    registerSuccess.value = 'Registration successful! Switching to login...'
    
    // Store credentials for auto-login
    const email = registerForm.email
    const password = registerForm.password
    
    // Clear form
    registerForm.username = ''
    registerForm.email = ''
    registerForm.password = ''
    
    // Switch to login tab after a short delay
    setTimeout(() => {
      // Switch to login tab
      activeTab.value = 'login'
      
      // Pre-fill login form with registered credentials
      loginForm.email = email
      loginForm.password = password
      
      // Start auto-login countdown
      startAutoLoginCountdown()
    }, 1500)
    
  } catch (error) {
    registerError.value = (error.response && error.response.data && error.response.data.message) || 'Error: ' + error.message
  } finally {
    isLoading.value = false
  }
}

const startAutoLoginCountdown = () => {
  showAutoLogin.value = true
  autoLoginCountdown.value = 3
  
  // Clear any existing interval
  if (autoLoginInterval.value) {
    clearInterval(autoLoginInterval.value)
  }
  
  autoLoginInterval.value = setInterval(() => {
    autoLoginCountdown.value--
    
    if (autoLoginCountdown.value <= 0) {
      clearInterval(autoLoginInterval.value)
      showAutoLogin.value = false
      
      // Auto-login
      login()
    }
  }, 1000)
}

// Cleanup
onBeforeUnmount(() => {
  // Clear any intervals when component is destroyed
  if (autoLoginInterval.value) {
    clearInterval(autoLoginInterval.value)
  }
})
</script> 