<template>
  <div class="leaderboard-view">
    <div class="card">
      <h2>Global Leaderboard</h2>
      <div class="leaderboard">
        <div v-if="loading" class="loading">Loading leaderboard...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <table v-else class="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(player, index) in leaderboard" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ player.username }}</td>
              <td>{{ player.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="actions">
        <button @click="fetchLeaderboard" class="btn btn-secondary">Refresh</button>
        <router-link to="/" class="btn btn-primary" v-if="!isLoggedIn">Login / Register</router-link>
        <router-link to="/dashboard" class="btn btn-primary" v-else>Go to Dashboard</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import axios from 'axios'
import { io } from 'socket.io-client'

const leaderboard = ref([])
const loading = ref(true)
const error = ref(null)
let socket = null

const isLoggedIn = computed(() => {
  return localStorage.getItem('token') !== null
})

onMounted(() => {
  // Connect to socket.io
  socket = io()
  
  // Listen for leaderboard updates
  socket.on('leaderboard', (data) => {
    leaderboard.value = data
  })
  
  // Fetch initial leaderboard
  fetchLeaderboard()
})

onBeforeUnmount(() => {
  // Disconnect socket when component is destroyed
  if (socket) {
    socket.disconnect()
  }
})

const fetchLeaderboard = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await axios.get('/api/scores/leaderboard')
    leaderboard.value = response.data.leaderboard
    
  } catch (err) {
    error.value = 'Failed to load leaderboard. Please try again.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.leaderboard-view {
  max-width: 800px;
  margin: 0 auto;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.leaderboard-table th,
.leaderboard-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.leaderboard-table th {
  font-weight: bold;
  background-color: #f8f9fa;
}

.loading, .error {
  padding: 20px;
  text-align: center;
  color: #666;
  margin-bottom: 20px;
}

.error {
  color: #e74c3c;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn-secondary {
  background-color: #95a5a6;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}
</style> 