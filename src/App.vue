<template>
  <div class="app">
    <div
      class="app_header-shell"
      :class="{ 'app_header-shell--collapsed': isAdminRoute && !isAdminHeaderVisible }"
    >
      <TheHeader class="app_header" />
    </div>

    <button
      v-if="isAdminRoute"
      type="button"
      class="app_header-toggle"
      :class="{ 'app_header-toggle--active': isAdminHeaderVisible }"
      @click="isAdminHeaderVisible = !isAdminHeaderVisible"
    >
      <span class="material-symbols">
        {{ isAdminHeaderVisible ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}
      </span>
      <span>{{ isAdminHeaderVisible ? 'Скрыть шапку' : 'Показать шапку' }}</span>
    </button>

    <div class="router-container" :class="{ 'router-container--wide': isWideLayout }">
      <aside v-if="!isWideLayout" class="app_categories-list-wrap">
        <CategoriesList class="app_categories-list" />
      </aside>

      <main class="app_main-content">
        <RouterView v-slot="{ Component, route }">
          <Transition :name="String(route.meta.transition ?? 'page-slide')" mode="out-in">
            <component :is="Component" :key="route.fullPath" class="router" />
          </Transition>
        </RouterView>
      </main>

      <aside v-if="!isWideLayout" class="app_cart-wrap">
        <TheCart class="app_cart" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import TheHeader from './components/TheHeader'
import TheCart from './components/Cart'
import CategoriesList from './components/CategoriesList'
import { useAuthStore } from './stores/auth'
import { useUsersStore } from './stores/users'

const route = useRoute()
const authStore = useAuthStore()
const usersStore = useUsersStore()
const { isAuthenticated } = storeToRefs(authStore)
const isWideLayout = computed(() => Boolean(route.meta.wideLayout))
const isAdminRoute = computed(() => Boolean(route.meta.requiresAdmin))
const isAdminHeaderVisible = ref(false)

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

watch(
  () => route.fullPath,
  () => {
    isAdminHeaderVisible.value = !isAdminRoute.value
  },
  { immediate: true },
)
</script>

<style lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app_header-shell {
  max-height: 240px;
  opacity: 1;
  overflow: hidden;
  transition:
    max-height 0.24s ease,
    opacity 0.2s ease;
}

.app_header-shell--collapsed {
  max-height: 0;
  opacity: 0;
  pointer-events: none;
}

.app_header {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 30;
}

.app_header-toggle {
  position: fixed;
  top: 12px;
  right: 16px;
  z-index: 45;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  border: 1px solid rgba(228, 186, 132, 0.12);
  background: rgba(18, 14, 17, 0.9);
  backdrop-filter: blur(12px);
}

.app_header-toggle--active {
  background: var(--accent-button-bg);
}

.router-container {
  width: 100%;
  max-width: 1840px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  grid-template-columns: 220px minmax(0, 1.35fr) 320px;
  align-items: start;
  gap: 24px;
}

.router-container--wide {
  grid-template-columns: minmax(0, 1fr);
}

.app_categories-list-wrap,
.app_cart-wrap {
  position: sticky;
  top: 104px;
}

.app_main-content {
  min-width: 0;
  position: relative;
}

.router {
  width: 100%;
}

.page-slide-enter-active,
.page-slide-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease,
    filter 0.28s ease;
  transform-origin: center top;
  will-change: opacity, transform, filter;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateY(18px) scale(0.985);
  filter: blur(6px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.99);
  filter: blur(4px);
}

@media (max-width: 1280px) {
  .router-container {
    grid-template-columns: 200px minmax(0, 1fr);
  }

  .router-container--wide {
    grid-template-columns: minmax(0, 1fr);
    padding: 16px;
    gap: 16px;
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
    gap: 16px;
  }

  .router-container--wide {
    grid-template-columns: 1fr;
  }

  .app_categories-list-wrap,
  .app_cart-wrap {
    position: static;
  }
}

@media (max-width: 640px) {
  .app_header-toggle {
    top: 10px;
    right: 12px;
    min-height: 36px;
    padding: 0 10px;
    font-size: 12px;
  }

  .app_header-toggle span:last-child {
    display: none;
  }

  .router-container {
    padding: 12px;
    padding-bottom: calc(18px + env(safe-area-inset-bottom));
    gap: 12px;
  }
}
</style>
