<template>
  <div class="admin-order-screen">
    <div v-if="isLoading" class="admin-order-screen__state">
      <span class="material-symbols">progress_activity</span>
      <span>Загружаем заказ</span>
    </div>

    <div v-else-if="!order" class="admin-order-screen__state">
      <span class="material-symbols">search_off</span>
      <span>Заказ не найден</span>
      <button type="button" class="admin-order-screen__back" @click="goToAdmin">
        Вернуться к заказам
      </button>
    </div>

    <div v-else class="admin-order-screen__content">
      <button type="button" class="admin-order-screen__back" @click="goToAdmin">
        <span class="material-symbols">arrow_back</span>
        <span>К списку заказов</span>
      </button>

      <section class="admin-order-screen__hero">
        <div>
          <p class="admin-order-screen__eyebrow">Заказ</p>
          <h1 class="admin-order-screen__title">{{ shortOrderId(order.id) }}</h1>
          <p class="admin-order-screen__subtitle">{{ formatDate(order.created_at) }}</p>
        </div>

        <span class="admin-order-screen__status" :class="`admin-order-screen__status--${order.status}`">
          {{ statusLabel(order.status) }}
        </span>
      </section>

      <div class="admin-order-screen__grid">
        <section class="admin-order-card admin-order-card--compact">
          <h2 class="admin-order-card__title">Основная информация</h2>

          <dl class="admin-order-card__meta">
            <div>
              <dt>Телефон</dt>
              <dd>{{ order.recipient_phone }}</dd>
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
              <dt>Персон</dt>
              <dd>{{ order.persons }}</dd>
            </div>
            <div>
              <dt>Товары</dt>
              <dd>{{ formatPrice(order.price) }}</dd>
            </div>
            <div>
              <dt>Доставка</dt>
              <dd>{{ formatPrice(order.delivery_price) }}</dd>
            </div>
            <div>
              <dt>Итого</dt>
              <dd>{{ formatPrice(order.total_price) }}</dd>
            </div>
            <div>
              <dt>ID пользователя</dt>
              <dd>{{ order.user_id }}</dd>
            </div>
          </dl>

          <div v-if="order.comment" class="admin-order-card__note">
            <p class="admin-order-card__label">Комментарий</p>
            <p>{{ order.comment }}</p>
          </div>

          <div v-if="addressLabel" class="admin-order-card__note">
            <p class="admin-order-card__label">Адрес / доставка</p>
            <p>{{ addressLabel }}</p>
          </div>
          <div v-else class="admin-order-card__note">
            <p class="admin-order-card__label">Формат</p>
            <p>Самовывоз или адрес не передан в ответе API.</p>
          </div>
        </section>

        <section class="admin-order-card admin-order-card--items">
          <h2 class="admin-order-card__title">Состав заказа</h2>

          <div class="admin-order-items">
            <article v-for="item in orderItems" :key="item.id" class="admin-order-item">
              <img
                class="admin-order-item__image"
                :src="item.productImage"
                :alt="item.productName"
                loading="lazy"
              />

              <div class="admin-order-item__content">
                <div class="admin-order-item__top">
                  <div>
                    <h3>{{ item.productName }}</h3>
                    <p v-if="item.variantLabel">{{ item.variantLabel }}</p>
                  </div>

                  <span>{{ item.priceLabel }}</span>
                </div>

                <p class="admin-order-item__meta">ID товара: {{ item.product_id }}</p>

                <p v-if="item.removedIngredientsLabel" class="admin-order-item__meta">
                  Без: {{ item.removedIngredientsLabel }}
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAdminStore } from '@/stores/admin'
import { useProductsStore } from '@/stores/products'
import type { OrderItemRead, OrderRead, OrderStatusEnum } from '@/types/api'
import { getProductImage } from '@/utils/products'

defineOptions({
  name: 'AdminOrderScreen',
})

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const productsStore = useProductsStore()

const { adminOrdersById } = storeToRefs(adminStore)
const { productsById } = storeToRefs(productsStore)

const isLoading = ref(false)
const orderId = computed(() => String(route.params.id))
const order = computed<OrderRead | null>(() => adminOrdersById.value[orderId.value] ?? null)

const orderItems = computed(() =>
  order.value?.items.map((item) => enrichOrderItem(item)) ?? [],
)

const addressLabel = computed(() => {
  if (!order.value?.address_id) return ''

  return `Адрес ID: ${order.value.address_id}`
})

function enrichOrderItem(item: OrderItemRead) {
  const product = productsById.value[item.product_id]
  const variant = product?.variants.find((candidate) => candidate.id === item.variant_id)

  return {
    ...item,
    productName: product?.name ?? 'Товар из заказа',
    productImage: product ? getProductImage(product, { thumbnail: true }) : '',
    variantLabel: variant ? `${variant.name} ${variant.quantity_value} г` : '',
    priceLabel: formatPrice(item.price),
    removedIngredientsLabel: item.removed_ingredients.map((entry) => entry.ingredient_name).join(', '),
  }
}

async function loadOrder() {
  if (order.value) {
    if (Object.keys(productsById.value).length === 0) {
      await productsStore.fetchProducts()
    }

    return
  }

  isLoading.value = true

  try {
    await adminStore.fetchOrders()

    if (Object.keys(productsById.value).length === 0) {
      await productsStore.fetchProducts()
    }
  } finally {
    isLoading.value = false
  }
}

function goToAdmin() {
  router.push({ name: 'admin' })
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatPrice(value: string) {
  return `${Number(value).toFixed(0)} ₽`
}

function shortOrderId(value: string) {
  return `#${value.slice(0, 8)}`
}

function statusLabel(status: OrderStatusEnum) {
  return (
    {
      new: 'Новый',
      cooking: 'Готовится',
      delivering: 'В пути',
      completed: 'Завершён',
      cancelled: 'Отменён',
    }[status] ?? status
  )
}

function paymentLabel(paymentMethod: string) {
  return (
    {
      cash: 'Наличными',
      card: 'Картой курьеру',
      online: 'Онлайн',
    }[paymentMethod] ?? paymentMethod
  )
}

onMounted(() => {
  void loadOrder().catch(() => undefined)
})
</script>

<style lang="scss">
.admin-order-screen {
  display: flex;
  flex-direction: column;
  gap: 28px;
  font-family: var(--font-sans);
  letter-spacing: -0.01em;
  font-feature-settings:
    'cv02' 1,
    'cv03' 1,
    'cv04' 1;
}

.admin-order-screen__state,
.admin-order-screen__hero,
.admin-order-card {
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.045);
}

.admin-order-screen__state {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-secondary);
  text-align: center;
  padding: 24px;
}

.admin-order-screen__back {
  width: fit-content;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.admin-order-screen__hero {
  padding: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.admin-order-screen__eyebrow {
  margin: 0 0 8px;
  color: #d2c5cb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.admin-order-screen__title {
  margin: 0 0 8px;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
}

.admin-order-screen__subtitle {
  margin: 0;
  color: #d9cfd3;
  letter-spacing: 0.01em;
}

.admin-order-screen__status {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

.admin-order-screen__status--new,
.admin-order-screen__status--cooking,
.admin-order-screen__status--delivering {
  background: rgba(211, 154, 34, 0.18);
  color: #f8d88f;
}

.admin-order-screen__status--completed {
  background: rgba(63, 176, 108, 0.18);
  color: #b9f1c8;
}

.admin-order-screen__status--cancelled {
  background: rgba(176, 63, 63, 0.18);
  color: #ffb1b1;
}

.admin-order-screen__grid {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  gap: 24px;
}

.admin-order-card {
  padding: 28px;
}

.admin-order-card--compact {
  padding: 14px;
}

.admin-order-card--items {
  padding: 28px;
}

.admin-order-card__title {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.admin-order-card__meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 18px;
  margin: 0 0 24px;
}

.admin-order-card--compact .admin-order-card__title {
  margin-bottom: 10px;
  font-size: 15px;
}

.admin-order-card--compact .admin-order-card__meta {
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.admin-order-card__meta dt,
.admin-order-card__meta dd {
  margin: 0;
}

.admin-order-card__meta dt,
.admin-order-card__label,
.admin-order-item__meta {
  color: #cdbfc5;
}

.admin-order-card__meta dt {
  font-size: 12px;
  margin-bottom: 4px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-order-card--compact .admin-order-card__meta dt {
  font-size: 11px;
  margin-bottom: 2px;
}

.admin-order-card--compact .admin-order-card__meta dd {
  font-size: 13px;
  line-height: 1.25;
  word-break: break-word;
}

.admin-order-card__note {
  padding: 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
}

.admin-order-card--compact .admin-order-card__note {
  padding: 10px 12px;
  border-radius: 12px;
}

.admin-order-card__note + .admin-order-card__note {
  margin-top: 14px;
}

.admin-order-card--compact .admin-order-card__note + .admin-order-card__note {
  margin-top: 10px;
}

.admin-order-card__note p {
  margin: 0;
}

.admin-order-card__note p + p {
  margin-top: 6px;
}

.admin-order-items {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.admin-order-item {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.admin-order-item__image {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.1);
}

.admin-order-item__content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.admin-order-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.admin-order-item__top h3,
.admin-order-item__top p {
  margin: 0;
}

.admin-order-item__top h3 {
  margin-bottom: 2px;
  font-size: 18px;
  line-height: 1.2;
  color: #fff;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.admin-order-item__meta {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

@media (max-width: 760px) {
  .admin-order-screen__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .admin-order-screen__hero,
  .admin-order-item,
  .admin-order-item__top {
    flex-direction: column;
  }

  .admin-order-screen {
    gap: 20px;
  }

  .admin-order-item {
    grid-template-columns: 1fr;
  }

  .admin-order-item__image {
    width: 100%;
    height: 140px;
  }

  .admin-order-screen__title {
    font-size: 28px;
  }

  .admin-order-card__meta {
    grid-template-columns: 1fr;
  }

  .admin-order-screen__back {
    width: 100%;
    justify-content: center;
  }

  .admin-order-screen__hero,
  .admin-order-card {
    padding: 20px;
  }
}
</style>
