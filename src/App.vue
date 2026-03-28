<template>
  <div class="app">
    <TheHeader class="app_header" />

    <div class="router-container">
      <CategoriesList class="app_categories-list" />

      <RouterView class="router" />

      <TheCart class="app_cart" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TheHeader from './components/TheHeader'
import TheCart from './components/Cart'
import CategoriesList from './components/CategoriesList'
</script>

<style lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: black;
}

.app_header {
  position: fixed;
  top: 0;
  left: 0;
}

.router-container {
  width: 100vw;
  overflow: hidden;
  padding: 20px 390px 20px 300px;
  flex-grow: 1;
  display: flex;
}

.app_categories-list {
  position: fixed;
  top: 100px;
  left: 20px;
}

.app_cart {
  position: fixed;
  top: 100px;
  right: 20px;
}

.router {
}
</style>
