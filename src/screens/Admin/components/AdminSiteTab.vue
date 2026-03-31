<template>
  <section class="admin-card admin-card--site">
    <div class="admin-card__header">
      <div>
        <p class="admin-card__eyebrow">Сайт</p>
        <h2 class="admin-card__title">Приём заказов</h2>
      </div>
    </div>

    <div class="admin-site">
      <div class="admin-site__status-row">
        <span class="admin-site__status-label">Состояние сайта</span>
        <span class="admin-site__status-badge" :class="siteStatusBadgeClass">
          {{ siteStatusLabel }}
        </span>
      </div>

      <div class="admin-site__status-row">
        <span class="admin-site__status-label">Health</span>
        <span class="admin-site__status-badge" :class="healthBadgeClass">
          {{ healthLabel }}
        </span>
      </div>

      <div class="admin-site__actions">
        <button
          type="button"
          class="admin-button"
          :disabled="isTogglingSite"
          @click="emit('toggle', true)"
        >
          {{ isTogglingSite ? 'Сохраняем...' : 'Открыть сайт' }}
        </button>

        <button
          type="button"
          class="admin-button admin-button--ghost"
          :disabled="isTogglingSite"
          @click="emit('toggle', false)"
        >
          Приостановить приём заказов
        </button>
      </div>

      <p v-if="siteActionMessage" class="admin-site__message">{{ siteActionMessage }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  siteStatusLabel: string
  siteStatusBadgeClass: string
  healthLabel: string
  healthBadgeClass: string
  siteActionMessage: string
  isTogglingSite: boolean
}>()

const emit = defineEmits<{
  toggle: [enabled: boolean]
}>()
</script>
