<template>
  <div class="app-container">
    <header>
      <h1>Score Tracking App</h1>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <p>&copy; 2023 Score Tracking App</p>
    </footer>
  </div>
</template>

<script setup>
// Using the Composition API with setup script
</script>

<style>
.app-container {
  font-family: 'Arial', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

footer {
  margin-top: 40px;
  padding-top: 10px;
  border-top: 1px solid #eee;
  text-align: center;
  font-size: 0.8em;
  color: #666;
}
</style> 