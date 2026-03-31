<template>
  <div class="profile-screen">
    <div v-if="!isAuthenticated" class="profile-screen__state">
      <span class="material-symbols">lock</span>
      <span>Войдите в аккаунт, чтобы посмотреть профиль и историю заказов.</span>
      <RouterLink class="profile-screen__link" :to="{ name: 'main' }">Вернуться в меню</RouterLink>
    </div>

    <div v-else-if="isLoading" class="profile-screen__state">
      <span class="material-symbols">progress_activity</span>
      <span>Загружаем профиль и заказы</span>
    </div>

    <div v-else-if="errorMessage" class="profile-screen__state">
      <span class="material-symbols">wifi_off</span>
      <span>{{ errorMessage }}</span>
      <button type="button" class="profile-screen__retry" @click="loadProfilePage">Повторить</button>
    </div>

    <template v-else>
      <section class="profile-screen__hero">
        <div class="profile-screen__hero-main">
          <p class="profile-screen__eyebrow">Личный кабинет</p>
          <h1 class="profile-screen__title">{{ profileName }}</h1>
          <p class="profile-screen__subtitle">
            Здесь можно посмотреть контактные данные, последний адрес и историю заказов.
          </p>
        </div>

        <div class="profile-screen__hero-stats">
          <div class="profile-screen__stat">
            <span class="profile-screen__stat-value">{{ myOrders.length }}</span>
            <span class="profile-screen__stat-label">Заказов</span>
          </div>
          <div class="profile-screen__stat">
            <span class="profile-screen__stat-value">{{ activeOrdersCount }}</span>
            <span class="profile-screen__stat-label">Активных</span>
          </div>
        </div>
      </section>

      <div class="profile-screen__layout">
        <section class="profile-card">
          <h2 class="profile-card__title">Профиль</h2>

          <dl class="profile-card__list">
            <div class="profile-card__item">
              <dt>Имя</dt>
              <dd>{{ profileName }}</dd>
            </div>
            <div class="profile-card__item">
              <dt>Телефон</dt>
              <dd>{{ profile?.phone || 'Не указан' }}</dd>
            </div>
            <div class="profile-card__item">
              <dt>Дата регистрации</dt>
              <dd>{{ registeredAtLabel }}</dd>
            </div>
          </dl>
        </section>

        <section class="profile-card">
          <h2 class="profile-card__title">Последний адрес</h2>

          <div v-if="profile?.last_address" class="profile-card__address">
            <p>{{ addressLabel }}</p>
            <p v-if="profile.last_address.apartment">Квартира: {{ profile.last_address.apartment }}</p>
            <p v-if="profile.last_address.entrance">Подъезд: {{ profile.last_address.entrance }}</p>
            <p v-if="profile.last_address.floor">Этаж: {{ profile.last_address.floor }}</p>
            <p v-if="profile.last_address.comment">{{ profile.last_address.comment }}</p>
          </div>

          <p v-else class="profile-card__empty">Сохранённого адреса пока нет.</p>
        </section>
      </div>

      <section class="profile-orders">
        <div class="profile-orders__header">
          <div>
            <p class="profile-screen__eyebrow">История</p>
            <h2 class="profile-orders__title">Мои заказы</h2>
          </div>

          <button type="button" class="profile-screen__retry" @click="loadProfilePage">
            Обновить
          </button>
        </div>

        <div v-if="!myOrders.length" class="profile-card__empty">
          У вас пока нет заказов. Самое время оформить первый.
        </div>

        <div v-else class="profile-orders__list">
          <article v-for="order in sortedOrders" :key="order.id" class="profile-order">
            <div class="profile-order__top">
              <div>
                <h3 class="profile-order__title">Заказ {{ shortOrderId(order.id) }}</h3>
                <p class="profile-order__meta">{{ formatDate(order.created_at) }}</p>
              </div>

              <span class="profile-order__status" :class="statusClass(order.status)">
                {{ statusLabel(order.status) }}
              </span>
            </div>

            <dl class="profile-order__details">
              <div>
                <dt>Сумма</dt>
                <dd>{{ formatPrice(order.total_price) }}</dd>
              </div>
              <div>
                <dt>Оплата</dt>
                <dd>{{ paymentLabel(order.payment_method) }}</dd>
              </div>
              <div>
                <dt>Статус оплаты</dt>
                <dd>{{ order.payment_status }}</dd>
              </div>
              <div>
                <dt>Позиций</dt>
                <dd>{{ order.items.length }}</dd>
              </div>
            </dl>

            <p v-if="order.comment" class="profile-order__comment">{{ order.comment }}</p>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import { useUsersStore } from '@/stores/users'
import type { OrderStatusEnum } from '@/types/api'

defineOptions({
  name: 'ProfileScreen',
})

const authStore = useAuthStore()
const usersStore = useUsersStore()
const ordersStore = useOrdersStore()

const { isAuthenticated } = storeToRefs(authStore)
const { profile } = storeToRefs(usersStore)
const { myOrders } = storeToRefs(ordersStore)

const isLoading = ref(false)
const errorMessage = ref('')

const profileName = computed(() => profile.value?.name || 'Гость')
const registeredAtLabel = computed(() =>
  profile.value?.created_at ? formatDate(profile.value.created_at) : 'Неизвестно',
)
const addressLabel = computed(() => {
  if (!profile.value?.last_address) return ''

  return [
    profile.value.last_address.city,
    profile.value.last_address.street,
    profile.value.last_address.house,
  ]
    .filter(Boolean)
    .join(', ')
})

const sortedOrders = computed(() =>
  [...myOrders.value].sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  ),
)

const activeOrdersCount = computed(
  () =>
    myOrders.value.filter((order) => ['new', 'cooking', 'delivering'].includes(order.status)).length,
)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const formatPrice = (value: string) => `${Number(value).toFixed(0)} ₽`
const shortOrderId = (value: string) => `#${value.slice(0, 8)}`

const statusLabel = (status: OrderStatusEnum) =>
  ({
    new: 'Новый',
    cooking: 'Готовится',
    delivering: 'В пути',
    completed: 'Завершён',
    cancelled: 'Отменён',
  })[status]

const statusClass = (status: OrderStatusEnum) => `profile-order__status--${status}`

const paymentLabel = (paymentMethod: string) =>
  ({
    cash: 'Наличными',
    card: 'Картой курьеру',
    online: 'Онлайн',
  })[paymentMethod] ?? paymentMethod

const loadProfilePage = async () => {
  if (!isAuthenticated.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    await Promise.all([usersStore.fetchProfile(), ordersStore.fetchMyOrders()])
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Не удалось загрузить профиль и историю заказов.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadProfilePage()
})
</script>

<style lang="scss">
.profile-screen {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-screen__state {
  min-height: 260px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background: var(--surface-1);
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 24px;

  span:first-child {
    font-size: 30px;
  }
}

.profile-screen__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background:
    radial-gradient(circle at top left, rgba(127, 46, 67, 0.24), transparent 40%),
    var(--surface-1);
}

.profile-screen__eyebrow {
  margin: 0 0 8px;
  color: var(--text-secondary);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.profile-screen__title {
  margin: 0 0 8px;
  font-size: 36px;
}

.profile-screen__subtitle {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
  max-width: 620px;
}

.profile-screen__hero-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 12px;
}

.profile-screen__stat {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.profile-screen__stat-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.profile-screen__stat-label {
  color: var(--text-secondary);
  font-size: 13px;
}

.profile-screen__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.profile-card,
.profile-orders {
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background: var(--surface-1);
  padding: 20px;
}

.profile-card__title,
.profile-orders__title {
  margin: 0 0 16px;
  font-size: 24px;
}

.profile-card__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
}

.profile-card__item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.profile-card__item dt,
.profile-card__item dd {
  margin: 0;
}

.profile-card__item dt {
  color: var(--text-secondary);
}

.profile-card__address,
.profile-card__empty {
  color: var(--text-secondary);
  line-height: 1.55;
}

.profile-card__address p,
.profile-card__empty {
  margin: 0;
}

.profile-orders__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.profile-orders__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile-order {
  border-radius: 18px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.profile-order__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.profile-order__title {
  margin: 0 0 4px;
  font-size: 18px;
}

.profile-order__meta {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.profile-order__status {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  white-space: nowrap;
}

.profile-order__status--new,
.profile-order__status--cooking,
.profile-order__status--delivering {
  background: rgba(211, 154, 34, 0.18);
  color: #f8d88f;
}

.profile-order__status--completed {
  background: rgba(63, 176, 108, 0.18);
  color: #b9f1c8;
}

.profile-order__status--cancelled {
  background: rgba(176, 63, 63, 0.18);
  color: #ffb1b1;
}

.profile-order__details {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.profile-order__details dt,
.profile-order__details dd {
  margin: 0;
}

.profile-order__details dt {
  color: var(--text-secondary);
  font-size: 12px;
  margin-bottom: 4px;
}

.profile-order__comment {
  margin: 14px 0 0;
  color: var(--text-secondary);
  line-height: 1.45;
}

.profile-screen__retry,
.profile-screen__link {
  height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--accent-button-bg);
}

@media (max-width: 960px) {
  .profile-screen__hero,
  .profile-screen__layout {
    grid-template-columns: 1fr;
  }

  .profile-order__details {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .profile-order__top,
  .profile-orders__header,
  .profile-card__item {
    flex-direction: column;
  }

  .profile-order__details {
    grid-template-columns: 1fr;
  }

  .profile-screen__hero {
    padding: 18px;
  }

  .profile-screen__title {
    font-size: 28px;
  }

  .profile-card,
  .profile-orders {
    padding: 14px;
  }

  .profile-card__title,
  .profile-orders__title {
    font-size: 20px;
  }

  .profile-screen__hero-stats {
    grid-template-columns: 1fr 1fr;
  }

  .profile-screen__stat {
    padding: 14px;
  }

  .profile-screen__stat-value {
    font-size: 24px;
  }
}

@media (max-width: 420px) {
  .profile-screen {
    gap: 16px;
  }

  .profile-screen__hero-stats {
    grid-template-columns: 1fr;
  }

  .profile-screen__retry,
  .profile-screen__link {
    width: 100%;
  }
}
</style>
