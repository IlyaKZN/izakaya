<template>
  <div class="app">
    <TheHeader class="app_header" />

    <div class="router-container">
      <aside class="app_categories-list-wrap">
        <CategoriesList class="app_categories-list" />
      </aside>

      <main class="app_main-content">
        <RouterView class="router" />
      </main>

      <aside class="app_cart-wrap">
        <TheCart class="app_cart" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import TheHeader from './components/TheHeader'
import TheCart from './components/Cart'
import CategoriesList from './components/CategoriesList'
import { useAuthStore } from './stores/auth'
import { useUsersStore } from './stores/users'

const authStore = useAuthStore()
const usersStore = useUsersStore()
const { isAuthenticated } = storeToRefs(authStore)

const syncProfile = async () => {
  if (!isAuthenticated.value) {
    usersStore.clearProfile()
    return
  }

  try {
    await usersStore.fetchProfile()
  } catch {
    authStore.clearSession()
    usersStore.clearProfile()
  }
}

onMounted(() => {
  void syncProfile()
})

watch(isAuthenticated, () => {
  void syncProfile()
})
</script>

<style lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app_header {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 30;
}

.router-container {
  width: 100%;
  max-width: 1700px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr) 340px;
  align-items: start;
  gap: 24px;
}

.app_categories-list-wrap,
.app_cart-wrap {
  position: sticky;
  top: 104px;
}

.app_main-content {
  min-width: 0;
}

@media (max-width: 1280px) {
  .router-container {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .app_cart-wrap {
    grid-column: 1 / -1;
    position: static;
  }
}

@media (max-width: 900px) {
  .router-container {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .app_categories-list-wrap,
  .app_cart-wrap {
    position: static;
  }
}
</style>
