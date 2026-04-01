<template>
  <div class="admin-orders-tab">
    <section class="admin-card admin-card--wide">
      <div class="admin-card__header admin-card__header--row">
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
            <span class="admin-filter-chip__count">{{ countByFilter(option.value) }}</span>
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
              @click="requestStatusChange(order, statusOption.value)"
            >
              {{ statusOption.label }}
            </button>
          </div>

          <p v-if="order.comment" class="admin-order__comment">{{ order.comment }}</p>
        </article>
      </div>
    </section>

    <BasePopup
      :model-value="isStatusConfirmOpen"
      :show-close-button="false"
      content-class="admin-confirm-popup"
      @update:model-value="handlePopupClose"
    >
      <div class="admin-confirm-popup__content">
        <h3 class="admin-confirm-popup__title">Подтвердить изменение статуса?</h3>
        <p class="admin-confirm-popup__text">
          <template v-if="pendingOrder && pendingStatus">
            Заказ {{ shortOrderId(pendingOrder.id) }} будет переведён в статус
            «{{ statusLabel(pendingStatus) }}».
          </template>
        </p>

        <div class="admin-confirm-popup__actions">
          <button
            type="button"
            class="admin-button admin-button--ghost"
            @click="handlePopupClose(false)"
          >
            Отмена
          </button>

          <button type="button" class="admin-button" @click="confirmStatusChange">
            Подтвердить
          </button>
        </div>
      </div>
    </BasePopup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BasePopup from '@/components/BasePopup'
import type { OrderRead, OrderStatusEnum } from '@/types/api'
import type { OrderFilterOption, OrderStatusOption } from '../types'

const props = defineProps<{
  allOrders: OrderRead[]
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

const isStatusConfirmOpen = ref(false)
const pendingOrder = ref<OrderRead | null>(null)
const pendingStatus = ref<OrderStatusEnum | null>(null)

function countByFilter(filter: string) {
  if (!filter) return props.allOrders.length

  return props.allOrders.filter((order) => order.status === filter).length
}

function requestStatusChange(order: OrderRead, nextStatus: string | number) {
  const resolvedStatus = String(nextStatus) as OrderStatusEnum

  if (resolvedStatus === order.status || props.updatingOrderId === order.id) return

  pendingOrder.value = order
  pendingStatus.value = resolvedStatus
  isStatusConfirmOpen.value = true
}

function handlePopupClose(nextValue = false) {
  isStatusConfirmOpen.value = nextValue

  if (!nextValue) {
    pendingOrder.value = null
    pendingStatus.value = null
  }
}

function confirmStatusChange() {
  if (!pendingOrder.value || !pendingStatus.value) return

  emit('orderStatusChange', pendingOrder.value, pendingStatus.value)
  handlePopupClose(false)
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

<style lang="scss">
.admin-confirm-popup {
  width: min(460px, calc(100vw - 32px));
  padding: 0;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.015)),
    rgba(18, 18, 20, 0.96);
  color: #fff;
}

.admin-confirm-popup__content {
  padding: 22px;
}

.admin-confirm-popup__title {
  margin: 0 0 10px;
  font-size: 24px;
  line-height: 1.15;
}

.admin-confirm-popup__text {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.admin-confirm-popup__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

@media (max-width: 640px) {
  .admin-confirm-popup__content {
    padding: 16px;
  }

  .admin-confirm-popup__title {
    font-size: 20px;
  }

  .admin-confirm-popup__actions {
    flex-direction: column-reverse;
  }

  .admin-confirm-popup__actions .admin-button {
    width: 100%;
  }
}
</style>
