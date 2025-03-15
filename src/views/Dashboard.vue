<template>
  <div>
    <!-- User Info Bar -->
    <div class="user-info">
      <div>
        <span class="welcome">Welcome, {{ currentUser.username }}!</span>
        <span>Your score: {{ currentUser.score }}</span>
      </div>
      <button @click="logout" class="logout-btn">Logout</button>
    </div>
    
    <!-- Score Update Card -->
    <div class="card">
      <h2>Update Score</h2>
      <div>
        <input 
          type="number" 
          v-model.number="scoreChange" 
          placeholder="Score to add" 
          min="1"
        >
        <div v-if="updateError" class="error-message">{{ updateError }}</div>
        <div v-if="updateSuccess" class="success-message">{{ updateSuccess }}</div>
        <button 
          @click="updateScore" 
          :disabled="isLoading"
        >{{ isLoading ? 'Updating...' : 'Update Score' }}</button>
      </div>
    </div>
    
    <!-- Leaderboard Card -->
    <div class="card">
      <h2>Leaderboard</h2>
      <button 
        @click="getLeaderboard" 
        :disabled="isLoading"
      >{{ isLoading ? 'Loading...' : 'Refresh Leaderboard' }}</button>
      <ul class="leaderboard">
        <li v-if="leaderboard.length === 0">No scores yet</li>
        <li v-for="(user, index) in leaderboard" :key="user._id">
          <span class="rank">{{ index + 1 }}.</span>
          <span 
            class="username" 
            :style="{ 
              color: user.username === currentUser.username ? '#3498db' : '', 
              fontWeight: user.username === currentUser.username ? 'bold' : '' 
            }"
          >{{ user.username }}</span>
          <span class="score">{{ user.score }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { io } from 'socket.io-client'

const router = useRouter()

// Reactive state
const currentUser = reactive({
  id: '',
  username: '',
  email: '',
  score: 0
})
const authToken = ref('')
const isLoading = ref(false)
const scoreChange = ref(10)
const updateError = ref('')
const updateSuccess = ref('')
const leaderboard = ref([])
const socket = ref(null)

// Methods
const logout = () => {
  // Clear auth data
  localStorage.removeItem('authToken')
  localStorage.removeItem('currentUser')
  
  // Redirect to home
  router.push({ name: 'Home' })
}

const updateScore = async () => {
  updateError.value = ''
  updateSuccess.value = ''
  isLoading.value = true
  
  // Validate input
  if (!scoreChange.value || scoreChange.value <= 0) {
    updateError.value = 'Please enter a positive number'
    isLoading.value = false
    return
  }
  
  try {
    const response = await axios.post('/api/scores/update', 
      { scoreChange: scoreChange.value },
      { 
        headers: { 
          'Authorization': `Bearer ${authToken.value}` 
        } 
      }
    )
    
    const data = response.data
    
    if (!data.success) {
      updateError.value = data.message || 'Failed to update score'
      isLoading.value = false
      return
    }
    
    // Update user score
    currentUser.score = data.newScore
    localStorage.setItem('currentUser', JSON.stringify(currentUser))
    
    // Show success message
    updateSuccess.value = `Score updated! New score: ${data.newScore}`
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      updateSuccess.value = ''
    }, 3000)
    
  } catch (error) {
    updateError.value = (error.response && error.response.data && error.response.data.message) || 'Error: ' + error.message
  } finally {
    isLoading.value = false
  }
}

const getLeaderboard = async () => {
  isLoading.value = true
  
  try {
    const response = await axios.get('/api/scores/leaderboard')
    const data = response.data
    
    if (data.success) {
      leaderboard.value = data.leaderboard
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
  } finally {
    isLoading.value = false
  }
}

const connectSocket = () => {
  socket.value = io()
  
  // Listen for leaderboard updates
  socket.value.on('leaderboard', (data) => {
    leaderboard.value = data
  })
}

// Lifecycle hooks
onMounted(() => {
  // Get user data from localStorage
  authToken.value = localStorage.getItem('authToken')
  const userData = JSON.parse(localStorage.getItem('currentUser') || '{}')
  
  // Update currentUser reactive object
  Object.assign(currentUser, userData)
  
  // Connect to Socket.IO
  connectSocket()
  
  // Fetch initial leaderboard
  getLeaderboard()
})

onBeforeUnmount(() => {
  // Disconnect socket when component is destroyed
  if (socket.value) {
    socket.value.disconnect()
  }
})
</script> 