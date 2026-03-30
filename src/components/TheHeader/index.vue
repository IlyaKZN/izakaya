<template>
  <header class="header">
    <div class="header__inner">
      <div class="header__brand">
        <span class="header__brand-mark">Viet Kitchen</span>
        <span class="header__brand-subtitle">доставка вьетнамской кухни</span>
      </div>

      <label class="header__search">
        <span class="material-symbols">search</span>
        <input v-model="searchQuery" type="text" placeholder="Поиск по меню" />
      </label>

      <div class="header__meta">
        <div class="header__meta-item">
          <span class="material-symbols">schedule</span>
          <span>11:30 - 22:25</span>
        </div>
        <div class="header__meta-item">
          <span class="material-symbols">call</span>
          <span>+7 (843) 558-78-87</span>
        </div>
      </div>

      <div class="header__auth">
        <button
          v-if="!isAuthenticated"
          type="button"
          class="header__auth-button"
          @click="isAuthPopupOpen = true"
        >
          <span class="material-symbols">person</span>
          <span>Войти</span>
        </button>

        <div v-else class="header__profile">
          <div class="header__profile-meta">
            <span class="header__profile-name">{{ profileName }}</span>
            <span class="header__profile-phone">{{ profilePhone }}</span>
          </div>

          <button
            type="button"
            class="header__logout-button"
            :disabled="isLoggingOut"
            @click="handleLogout"
          >
            {{ isLoggingOut ? 'Выходим...' : 'Выйти' }}
          </button>
        </div>
      </div>
    </div>

    <AuthPopup v-model="isAuthPopupOpen" />
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCatalogStore } from '@/stores/catalog'
import AuthPopup from '@/components/AuthPopup'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'

defineOptions({
  name: 'TheHeader',
})

const catalogStore = useCatalogStore()
const { searchQuery } = storeToRefs(catalogStore)
const authStore = useAuthStore()
const usersStore = useUsersStore()
const { isAuthenticated } = storeToRefs(authStore)
const { profile } = storeToRefs(usersStore)

const isAuthPopupOpen = ref(false)
const isLoggingOut = ref(false)

const profileName = computed(() => profile.value?.name || 'Пользователь')
const profilePhone = computed(() => profile.value?.phone || 'Номер не указан')

const handleLogout = async () => {
  isLoggingOut.value = true

  try {
    await authStore.logout()
    usersStore.clearProfile()
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<style lang="scss">
.header {
  width: 100%;
  border-bottom: 1px solid var(--surface-border);
  background: rgba(24, 18, 21, 0.96);
  backdrop-filter: blur(4px);
}

.header__inner {
  max-width: 1700px;
  margin: 0 auto;
  min-height: 80px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.header__brand {
  display: flex;
  flex-direction: column;
  min-width: 220px;
}

.header__brand-mark {
  font-size: 23px;
  letter-spacing: 0.3px;
  font-weight: 700;
  text-transform: uppercase;
}

.header__brand-subtitle {
  color: var(--text-secondary);
  font-size: 13px;
}

.header__search {
  height: 46px;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  background: var(--surface-1);
  padding: 0 12px;

  span {
    color: var(--text-secondary);
  }

  input {
    flex: 1;
    background: transparent;
    border: 0;
    color: var(--text-primary);
    outline: none;
    font: inherit;
  }
}

.header__meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header__meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 13px;

  span:first-child {
    font-size: 18px;
  }
}

.header__auth {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.header__auth-button,
.header__logout-button {
  height: 42px;
  border-radius: 12px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.header__auth-button {
  background: linear-gradient(180deg, rgba(138, 97, 112, 0.9), rgba(114, 76, 89, 0.9));
}

.header__profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px;
  padding-left: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.header__profile-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.header__profile-name {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.header__profile-phone {
  color: var(--text-secondary);
  font-size: 12px;
}

.header__logout-button {
  background: rgba(255, 255, 255, 0.08);
}

.header__auth-button:disabled,
.header__logout-button:disabled {
  opacity: 0.55;
}

@media (max-width: 1100px) {
  .header__meta {
    display: none;
  }
}

@media (max-width: 900px) {
  .header__inner {
    padding: 0 16px;
    min-height: 72px;
    flex-wrap: wrap;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .header__brand {
    min-width: 150px;
  }

  .header__brand-subtitle {
    display: none;
  }

  .header__search {
    order: 3;
    width: 100%;
    flex-basis: 100%;
  }

  .header__auth {
    margin-left: 0;
  }
}
</style>
