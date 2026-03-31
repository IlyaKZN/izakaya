<template>
  <div class="admin-toolbar-top">
    <div class="admin-tabs">
      <button
        type="button"
        class="admin-tabs__button"
        :class="{ 'admin-tabs__button--active': activeTab === 'orders' }"
        @click="emit('update:activeTab', 'orders')"
      >
        <span>Заказы</span>
        <span class="admin-tabs__count">{{ ordersCount }}</span>
      </button>

      <button
        type="button"
        class="admin-tabs__button"
        :class="{ 'admin-tabs__button--active': activeTab === 'products' }"
        @click="emit('update:activeTab', 'products')"
      >
        <span>Товары</span>
      </button>

      <button
        type="button"
        class="admin-tabs__button"
        :class="{ 'admin-tabs__button--active': activeTab === 'site' }"
        @click="emit('update:activeTab', 'site')"
      >
        <span>Приём заказов</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminTab } from '../types'

defineProps<{
  activeTab: AdminTab
  ordersCount: number
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: AdminTab]
}>()
</script>
