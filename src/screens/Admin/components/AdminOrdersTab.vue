<template>
  <div class="admin-orders-tab">
    <section class="admin-card admin-card--stats">
      <div class="admin-stat">
        <span class="admin-stat__value">{{ sortedOrders.length }}</span>
        <span class="admin-stat__label">Всего в выдаче</span>
      </div>
      <div class="admin-stat">
        <span class="admin-stat__value">{{ countByStatus('new') }}</span>
        <span class="admin-stat__label">Новые</span>
      </div>
      <div class="admin-stat">
        <span class="admin-stat__value">{{ countByStatus('cooking') }}</span>
        <span class="admin-stat__label">Готовятся</span>
      </div>
      <div class="admin-stat">
        <span class="admin-stat__value">{{ countByStatus('delivering') }}</span>
        <span class="admin-stat__label">В пути</span>
      </div>
    </section>

    <section class="admin-card admin-card--wide">
      <div class="admin-card__header admin-card__header--row">
        <div>
          <p class="admin-card__eyebrow">Заказы</p>
          <h2 class="admin-card__title">Лента заказов</h2>
        </div>

        <div class="admin-order-filters">
          <button
            v-for="option in orderFilterOptions"
            :key="option.value"
            type="button"
            class="admin-filter-chip"
            :class="{ 'admin-filter-chip--active': ordersFilter === option.value }"
            @click="emit('filterChange', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div v-if="ordersError" class="admin-notice admin-notice--error">{{ ordersError }}</div>

      <div v-if="!sortedOrders.length" class="admin-empty">
        Заказов по выбранному фильтру пока нет.
      </div>

      <div v-else class="admin-orders">
        <article v-for="order in sortedOrders" :key="order.id" class="admin-order">
          <div class="admin-order__top">
            <div>
              <button type="button" class="admin-order__link" @click="emit('openOrder', order.id)">
                Заказ {{ shortOrderId(order.id) }}
              </button>
              <p>{{ formatDate(order.created_at) }}</p>
            </div>

            <span class="admin-status" :class="`admin-status--${order.status}`">
              {{ statusLabel(order.status) }}
            </span>
          </div>

          <dl class="admin-order__meta">
            <div>
              <dt>Телефон</dt>
              <dd>{{ order.recipient_phone }}</dd>
            </div>
            <div>
              <dt>Сумма</dt>
              <dd>{{ formatPrice(order.total_price) }}</dd>
            </div>
            <div>
              <dt>Оплата</dt>
              <dd>{{ paymentLabel(order.payment_method) }}</dd>
            </div>
            <div>
              <dt>Позиций</dt>
              <dd>{{ order.items.length }}</dd>
            </div>
          </dl>

          <div class="admin-order__status-actions">
            <button
              v-for="statusOption in orderStatusOptions"
              :key="statusOption.value"
              type="button"
              class="admin-status-chip"
              :class="{
                'admin-status-chip--active': order.status === statusOption.value,
                'admin-status-chip--pending': updatingOrderId === order.id,
              }"
              :disabled="updatingOrderId === order.id"
              @click="emit('orderStatusChange', order, statusOption.value)"
            >
              {{ statusOption.label }}
            </button>
          </div>

          <p v-if="order.comment" class="admin-order__comment">{{ order.comment }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { OrderRead, OrderStatusEnum } from '@/types/api'
import type { OrderFilterOption, OrderStatusOption } from '../types'

const props = defineProps<{
  sortedOrders: OrderRead[]
  ordersError: string
  ordersFilter: string
  orderFilterOptions: readonly OrderFilterOption[]
  orderStatusOptions: readonly OrderStatusOption[]
  updatingOrderId: string | null
}>()

const emit = defineEmits<{
  filterChange: [nextFilter: string]
  orderStatusChange: [order: OrderRead, nextStatus: string | number]
  openOrder: [orderId: string]
}>()

function countByStatus(status: OrderStatusEnum) {
  return props.sortedOrders.filter((order) => order.status === status).length
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
</script>
