<template>
  <div class="home">
    <div class="auth-container">
      <div class="tabs">
        <div 
          :class="['tab', activeTab === 'login' ? 'active' : '']" 
          @click="activeTab = 'login'"
        >
          Login
        </div>
        <div 
          :class="['tab', activeTab === 'register' ? 'active' : '']" 
          @click="activeTab = 'register'"
        >
          Register
        </div>
      </div>
      
      <div v-if="activeTab === 'login'" class="tab-content">
        <h2>Login</h2>
        <div v-if="loginMessage" :class="['alert', loginMessage.type === 'error' ? 'alert-error' : 'alert-success']">
          {{ loginMessage.text }}
        </div>
        <div v-if="autoLoginCountdown > 0" class="alert alert-info">
          Auto login in {{ autoLoginCountdown }} seconds...
        </div>
        <form @submit.prevent="login" class="auth-form">
          <div class="form-group">
            <label for="login-email">Email:</label>
            <input type="email" id="login-email" v-model="loginForm.email" required />
          </div>
          <div class="form-group">
            <label for="login-password">Password:</label>
            <input type="password" id="login-password" v-model="loginForm.password" required />
          </div>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
      </div>
      
      <div v-if="activeTab === 'register'" class="tab-content">
        <h2>Register</h2>
        <div v-if="registerMessage" :class="['alert', registerMessage.type === 'error' ? 'alert-error' : 'alert-success']">
          {{ registerMessage.text }}
        </div>
        <form @submit.prevent="register" class="auth-form">
          <div class="form-group">
            <label for="register-username">Username:</label>
            <input type="text" id="register-username" v-model="registerForm.username" required />
          </div>
          <div class="form-group">
            <label for="register-email">Email:</label>
            <input type="email" id="register-email" v-model="registerForm.email" required />
          </div>
          <div class="form-group">
            <label for="register-password">Password:</label>
            <input type="password" id="register-password" v-model="registerForm.password" required />
          </div>
          <button type="submit" class="btn btn-primary">Register</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Ensure axios sends cookies with each request
axios.defaults.withCredentials = true;

const router = useRouter()
const activeTab = ref('login')
const loginMessage = ref(null)
const registerMessage = ref(null)
const autoLoginCountdown = ref(0)
let autoLoginTimer = null
let countdownInterval = null

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  email: '',
  password: ''
})

onMounted(async () => {
  // Check if user is already logged in
  await checkAuthStatus();
})

onBeforeUnmount(() => {
  // Clean up timers
  if (autoLoginTimer) clearTimeout(autoLoginTimer)
  if (countdownInterval) clearInterval(countdownInterval)
})

const checkAuthStatus = async () => {
  try {
    // Try to get current user - this will use cookies for auth
    const response = await axios.get('/api/auth/me');
    
    // If successful, save user info and redirect to dashboard
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/dashboard');
    }
  } catch (error) {
    // Not authenticated, stay on login page
    console.log('Not authenticated, please log in');
  }
}

const login = async () => {
  try {
    loginMessage.value = null
    
    // Log login attempt
    console.log('Attempting login with email:', loginForm.email)
    
    const response = await axios.post('/api/auth/login', {
      email: loginForm.email,
      password: loginForm.password
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    // Log successful login response
    console.log('Login response:', response.data)
    
    // Save user info in localStorage for UI
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    // Redirect to dashboard
    router.push('/dashboard')
  } catch (err) {
    // Log error details
    console.error('Login error:', err.response?.data || err)
    console.error('Status code:', err.response?.status)
    console.error('Headers:', err.response?.headers)
    
    loginMessage.value = {
      type: 'error',
      text: err.response?.data?.message || 'Login failed. Please try again.'
    }
  }
}

const startAutoLoginCountdown = () => {
  // Set initial countdown value
  autoLoginCountdown.value = 3
  
  // Clear any existing timers
  if (autoLoginTimer) clearTimeout(autoLoginTimer)
  if (countdownInterval) clearInterval(countdownInterval)
  
  // Start countdown interval
  countdownInterval = setInterval(() => {
    if (autoLoginCountdown.value > 0) {
      autoLoginCountdown.value--
    } else {
      clearInterval(countdownInterval)
    }
  }, 1000)
  
  // Set timer for auto login
  autoLoginTimer = setTimeout(() => {
    login()
  }, 3000)
}

const register = async () => {
  try {
    registerMessage.value = null
    
    // Basic validation
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      registerMessage.value = {
        type: 'error',
        text: 'Please fill in all fields'
      }
      return
    }
    
    // Password length validation
    if (registerForm.password.length < 6) {
      registerMessage.value = {
        type: 'error',
        text: 'Password must be at least 6 characters'
      }
      return
    }
    
    // Log registration request
    console.log('Sending registration request with:', {
      username: registerForm.username,
      email: registerForm.email,
      password: '***'
    })
    
    const response = await axios.post('/api/auth/register', {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password
    })
    
    // Log response for debugging
    console.log('Register response:', response.data)
    
    if (!response.data.success) {
      registerMessage.value = {
        type: 'error',
        text: response.data.message || 'Registration failed. Please try again.'
      }
      return
    }
    
    registerMessage.value = {
      type: 'success',
      text: 'Registration successful! You will be logged in automatically.'
    }
    
    // Save credentials for auto-login
    const tempEmail = registerForm.email
    const tempPassword = registerForm.password
    
    // Clear form
    registerForm.username = ''
    registerForm.email = ''
    registerForm.password = ''
    
    // Switch to login tab and pre-fill login form
    setTimeout(() => {
      activeTab.value = 'login'
      loginForm.email = tempEmail
      loginForm.password = tempPassword
      
      // Start auto login countdown
      startAutoLoginCountdown()
    }, 1500)
    
  } catch (err) {
    console.error('Registration error:', err.response || err)
    
    registerMessage.value = {
      type: 'error',
      text: err.response?.data?.message || 'Registration failed. Please try again.'
    }
  }
}
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 150px);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tab:hover {
  background-color: #f9f9f9;
}

.tab.active {
  background-color: #f5f5f5;
  font-weight: bold;
  border-bottom: 2px solid #4299e1;
}

.tab-content {
  padding: 20px;
}

.auth-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.btn {
  width: 100%;
  padding: 12px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #3182ce;
}

.alert {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.alert-success {
  background-color: #c6f6d5;
  color: #2f855a;
}

.alert-error {
  background-color: #fed7d7;
  color: #c53030;
}

.alert-info {
  background-color: #e2e8f0;
  color: #2d3748;
}
</style> 