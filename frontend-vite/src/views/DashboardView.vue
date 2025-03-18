<template>
  <div class="dashboard">
    <div class="user-info card">
      <h2>Welcome, {{ user?.username }}</h2>
      <p>Your current score: <strong>{{ user?.score }}</strong></p>
      <button @click="logout" class="btn btn-danger">Logout</button>
    </div>
    
    <div class="update-score card">
      <h2>Update Score</h2>
      <div v-if="updateMessage" :class="['alert', updateMessage.type === 'error' ? 'alert-error' : 'alert-success']">
        {{ updateMessage.text }}
      </div>
      <button @click="updateScore" class="btn btn-primary">Perform Action (+10 points)</button>
    </div>
    
    <div class="leaderboard-section card">
      <h2>Leaderboard</h2>
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
            <tr v-for="(player, index) in leaderboard" :key="index" :class="{ 'current-user': player.username === user?.username }">
              <td>{{ index + 1 }}</td>
              <td>{{ player.username }}</td>
              <td>{{ player.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { io } from 'socket.io-client'

// Ensure axios sends cookies with each request
axios.defaults.withCredentials = true;

const router = useRouter()
const user = ref(null)
const leaderboard = ref([])
const loading = ref(true)
const error = ref(null)
const updateMessage = ref(null)
let socket = null

onMounted(async () => {
  try {
    // Check authentication status
    const response = await axios.get('/api/auth/me');
    
    // Get user data from response
    user.value = response.data.user;
    
    // Save user data in localStorage for UI display
    localStorage.setItem('user', JSON.stringify(user.value));
    
    // Connect to socket.io
    socket = io({
      withCredentials: true // Ensure cookies are sent with socket connection
    });
    
    // Listen for leaderboard updates
    socket.on('leaderboard', (data) => {
      leaderboard.value = data;
      
      // Update user score if they're in the leaderboard
      const currentUser = data.find(player => player.username === user.value?.username);
      if (currentUser) {
        user.value.score = currentUser.score;
        localStorage.setItem('user', JSON.stringify(user.value));
      }
    });
    
    // Fetch initial leaderboard
    await fetchLeaderboard();
  } catch (error) {
    console.error('Auth error:', error);
    // Redirect to login if not authenticated
    router.push('/');
  }
})

onBeforeUnmount(() => {
  // Disconnect socket when component is destroyed
  if (socket) {
    socket.disconnect();
  }
})

// Intercept 401 responses for token refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and we haven't tried refreshing yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Call refresh token endpoint
        await axios.post('/api/auth/refresh-token');
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        router.push('/');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

const fetchLeaderboard = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await axios.get('/api/scores/leaderboard');
    leaderboard.value = response.data.leaderboard;
    
  } catch (err) {
    error.value = 'Failed to load leaderboard. Please try again.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

const updateScore = async () => {
  try {
    updateMessage.value = null;
    
    const response = await axios.post('/api/scores/update', { scoreChange: 10 });
    
    updateMessage.value = {
      type: 'success',
      text: 'Score updated successfully!'
    }
    
    // Update user data
    user.value.score = response.data.newScore;
    localStorage.setItem('user', JSON.stringify(user.value));
    
    // Update leaderboard if available in response
    if (response.data.leaderboard) {
      leaderboard.value = response.data.leaderboard;
    }
    
  } catch (err) {
    updateMessage.value = {
      type: 'error',
      text: err.response?.data?.message || 'Failed to update score. Please try again.'
    }
  }
}

const logout = async () => {
  try {
    // Call logout endpoint to clear server-side refresh token
    await axios.post('/api/auth/logout');
    
    // Clear localStorage
    localStorage.removeItem('user');
    
    // Reset Axios interceptors to avoid reusing stale handlers
    axios.interceptors.response.handlers = [];
    
    // Force reload the page to clear all states and cookies in browser
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout fails on server, still reset and redirect
    localStorage.removeItem('user');
    
    // Force reload the page rather than router push
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.user-info h2 {
  margin: 0;
}

.btn-danger {
  background-color: #e74c3c;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.update-score {
  margin-bottom: 20px;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
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

.current-user {
  background-color: #e8f4fd;
  font-weight: bold;
}

.loading, .error {
  padding: 20px;
  text-align: center;
  color: #666;
}

.error {
  color: #e74c3c;
}
</style> 