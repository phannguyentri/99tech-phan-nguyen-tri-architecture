<template>
  <div id="app">
    <header>
      <h1>Score Tracking API</h1>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
// Composition API - no need for export default
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
}

header h1 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  text-align: center;
  margin-bottom: 30px;
}
</style> 