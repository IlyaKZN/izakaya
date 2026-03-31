<template>
  <header class="header">
    <div class="header__inner">
      <div class="header__bar">
        <div class="header__brand-group">
          <RouterLink class="header__brand" :to="{ name: 'main' }" aria-label="Перейти на главную">
            <span class="header__brand-badge">
              <span class="header__brand-badge-top">viet</span>
              <span class="header__brand-badge-main">kitchen</span>
              <span class="header__brand-badge-bottom">delivery</span>
            </span>

            <span class="header__brand-copy">
              <span class="header__brand-mark">VIET KITCHEN</span>
              <span class="header__brand-subtitle">вьетнамская кухня с доставкой</span>
            </span>
          </RouterLink>
        </div>

        <div class="header__center">
          <label class="header__search">
            <span class="material-symbols header__search-icon">search</span>
            <input v-model="searchQuery" type="text" placeholder="Поиск по меню" />
            <span class="header__search-action" aria-hidden="true">
              <span class="material-symbols">search</span>
            </span>
          </label>

          <div class="header__meta">
            <div class="header__meta-item">
              <span class="material-symbols">schedule</span>
              <div class="header__meta-copy">
                <span class="header__meta-label">Время работы</span>
                <span class="header__meta-value">11:30 – 22:25</span>
              </div>
            </div>

            <div class="header__meta-item">
              <span class="material-symbols">call</span>
              <div class="header__meta-copy">
                <span class="header__meta-label">Телефон</span>
                <span class="header__meta-value">+7 (843) 558-78-87</span>
              </div>
            </div>
          </div>
        </div>

        <div class="header__actions">
          <nav class="header__nav" aria-label="Основная навигация">
            <RouterLink v-if="role === 'admin'" class="header__nav-link" :to="{ name: 'admin' }">
              <span class="material-symbols">shield_person</span>
              <span>Админка</span>
            </RouterLink>
          </nav>

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
              <RouterLink class="header__profile-link" :to="{ name: 'profile' }">
                <span class="material-symbols">account_circle</span>
                <span>Профиль</span>
              </RouterLink>

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
      </div>
    </div>

    <AuthPopup v-model="isAuthPopupOpen" />
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
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
const { isAuthenticated, role } = storeToRefs(authStore)
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background:
    linear-gradient(180deg, rgba(18, 14, 17, 0.92), rgba(11, 11, 12, 0.88)),
    rgba(18, 14, 17, 0.94);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(18px);
}

.header__inner {
  max-width: 1700px;
  margin: 0 auto;
  padding: 14px 24px;
}

.header__bar {
  min-height: 78px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.header__brand-group,
.header__center,
.header__actions {
  display: flex;
  align-items: center;
}

.header__brand-group {
  gap: 12px;
}

.header__center {
  flex: 1;
  min-width: 0;
  gap: 18px;
}

.header__actions {
  gap: 14px;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.header__brand-badge {
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(circle at 30% 30%, rgba(127, 46, 67, 0.95), rgba(84, 29, 45, 0.96) 62%, rgba(28, 17, 22, 0.98) 100%);
  color: #f5d7df;
  text-transform: lowercase;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 10px 22px rgba(0, 0, 0, 0.22);
}

.header__brand-badge-top,
.header__brand-badge-bottom {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.22em;
}

.header__brand-badge-main {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.header__brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header__brand-mark {
  font-size: 21px;
  letter-spacing: 0.08em;
  font-weight: 800;
  text-transform: uppercase;
}

.header__brand-subtitle {
  color: rgba(200, 188, 193, 0.72);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.header__search {
  flex: 1;
  min-width: 0;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.035);
  padding: 0 12px 0 14px;
}

.header__search-icon {
  color: rgba(200, 188, 193, 0.6);
}

.header__search input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  color: var(--text-primary);
  outline: none;
  font: inherit;
}

.header__search input::placeholder {
  color: rgba(200, 188, 193, 0.44);
}

.header__search-action {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--accent-button-bg);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.header__search-action .material-symbols {
  font-size: 22px;
}

.header__meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header__meta-item {
  min-height: 52px;
  padding: 0 4px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d9d6d8;
}

.header__meta-item > .material-symbols {
  font-size: 20px;
  color: rgba(239, 127, 154, 0.86);
}

.header__meta-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header__meta-label {
  color: rgba(200, 188, 193, 0.58);
  font-size: 11px;
  line-height: 1;
}

.header__meta-value {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.header__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header__nav-link,
.header__auth-button,
.header__logout-button,
.header__profile-link {
  min-height: 48px;
  padding: 0 16px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.045);
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.header__nav-link:hover,
.header__auth-button:hover,
.header__logout-button:hover,
.header__profile-link:hover {
  transform: translateY(-1px);
  border-color: rgba(127, 46, 67, 0.24);
  background: rgba(255, 255, 255, 0.07);
}

.router-link-active.header__nav-link,
.router-link-active.header__profile-link {
  color: #fff;
  border-color: var(--accent-soft-border);
  background: var(--accent-button-bg);
}

.header__auth {
  display: flex;
  align-items: center;
  min-width: 0;
}

.header__auth-button {
  color: #fff;
  background: var(--accent-button-bg);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.header__logout-button {
  background: var(--accent-button-bg);
  border-color: var(--accent-soft-border);
}

.header__profile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  padding-left: 8px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.header__profile-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 4px;
  min-width: 0;
}

.header__profile-name {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.header__profile-phone {
  color: rgba(200, 188, 193, 0.62);
  font-size: 12px;
}

.header__auth-button:disabled,
.header__logout-button:disabled {
  opacity: 0.55;
}

@media (max-width: 1460px) {
  .header__center {
    gap: 12px;
  }

  .header__meta {
    gap: 8px;
  }

  .header__meta-item {
    padding: 0 2px;
  }
}

@media (max-width: 1024px) {
  .header__bar {
    flex-wrap: wrap;
  }

  .header__center,
  .header__actions {
    width: 100%;
  }

  .header__actions {
    justify-content: space-between;
  }
}

@media (max-width: 1180px) {
  .header__meta {
    display: none;
  }
}

@media (max-width: 900px) {
  .header__inner {
    padding: 10px 16px;
  }

  .header__bar {
    min-height: auto;
    gap: 14px;
    padding: 12px;
  }

  .header__brand {
    min-width: 0;
  }

  .header__brand-subtitle {
    display: none;
  }

  .header__center,
  .header__actions {
    width: 100%;
  }

  .header__center {
    flex-direction: column;
    align-items: stretch;
  }

  .header__actions {
    justify-content: space-between;
  }

  .header__profile {
    max-width: 100%;
  }

  .header__profile-meta {
    overflow: hidden;
  }

  .header__profile-name,
  .header__profile-phone {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@media (max-width: 640px) {
  .header {
    position: sticky;
    top: 0;
    z-index: 40;
  }

  .header__inner {
    padding: 8px 12px 12px;
  }

  .header__bar {
    padding: 8px 0;
  }

  .header__brand-copy {
    min-width: 0;
  }

  .header__brand-mark {
    font-size: 17px;
  }

  .header__nav-link,
  .header__auth-button,
  .header__profile-link,
  .header__logout-button {
    min-height: 40px;
    padding: 0 10px;
    font-size: 13px;
  }

  .header__search {
    height: 46px;
  }

  .header__search-action {
    width: 34px;
    height: 34px;
    border-radius: 12px;
  }

  .header__actions {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .header__nav {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .header__nav-link {
    justify-content: center;
  }

  .header__profile {
    width: 100%;
    justify-content: space-between;
    gap: 8px;
    padding-left: 8px;
  }

  .header__auth {
    width: 100%;
  }

  .header__profile-meta {
    flex: 1;
  }

  .header__nav-link span:last-child,
  .header__profile-link span:last-child,
  .header__auth-button span:last-child {
    display: none;
  }

  .header__nav-link,
  .header__profile-link,
  .header__auth-button {
    width: 38px;
    min-width: 38px;
    justify-content: center;
    padding: 0;
  }

  .header__auth-button {
    width: 100%;
  }

  .header__logout-button {
    white-space: nowrap;
  }
}
</style>
