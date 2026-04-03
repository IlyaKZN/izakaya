<template>
  <div class="address-popup__left">
    <div class="address-popup__tabs">
      <button
        type="button"
        class="address-popup__tab"
        :class="{ 'address-popup__tab--active': activeTab === 'delivery' }"
        @click="emit('update:activeTab', 'delivery')"
      >
        Доставка
      </button>

      <button
        type="button"
        class="address-popup__tab"
        :class="{ 'address-popup__tab--active': activeTab === 'pickup' }"
        @click="emit('update:activeTab', 'pickup')"
      >
        Самовывоз
      </button>
    </div>

    <template v-if="activeTab === 'delivery'">
      <h2 class="address-popup__title">Адрес доставки</h2>

      <label class="address-popup__field">
        <span class="address-popup__label">Улица и дом</span>

        <div class="address-popup__address-row">
          <div ref="suggestContainer" class="address-popup__suggest-container">
            <input
              v-model.trim="form.street"
              class="address-popup__input"
              type="text"
              placeholder="Например, Баумана, 1"
              autocomplete="off"
              @input="emit('street-input')"
              @focus="emit('street-focus')"
              @keydown.enter.prevent="emit('search')"
            />

            <div v-if="isSuggestOpen" class="address-popup__suggest-list">
              <button
                v-for="item in suggestResults"
                :key="`${item.street}-${item.house}-${item.coords.join(',')}`"
                type="button"
                class="address-popup__suggest-item"
                @click="emit('select-suggest', item)"
              >
                <span class="address-popup__suggest-title">
                  {{ getSuggestTitle(item) }}
                </span>
                <span class="address-popup__suggest-address">
                  {{ getSuggestAddress(item) }}
                </span>
              </button>
            </div>
          </div>

          <button
            type="button"
            class="address-popup__search"
            :disabled="!canSearchAddress"
            @click="emit('search')"
          >
            {{ isGeocoding ? 'Поиск...' : 'Найти' }}
          </button>
        </div>
      </label>

      <p class="address-popup__hint">
        Начните вводить адрес, выберите подсказку или кликните по карте.
      </p>
      <p
        v-if="deliveryStatusMessage"
        id="status-msg"
        class="address-popup__hint"
        :class="{
          'address-popup__hint--error': deliveryStatusKind === 'error',
          'address-popup__hint--success': deliveryStatusKind === 'success',
        }"
      >
        {{ deliveryStatusMessage }}
      </p>
      <p v-if="addressLookupError" class="address-popup__hint address-popup__hint--error">
        {{ addressLookupError }}
      </p>

      <div class="address-popup__grid">
        <input v-model="form.block" class="address-popup__input" type="text" placeholder="Корпус" />
        <input
          v-model="form.entrance"
          class="address-popup__input"
          type="text"
          placeholder="Подъезд"
        />
        <input
          v-model="form.intercom"
          class="address-popup__input"
          type="text"
          placeholder="Домофон"
        />
        <input v-model="form.floor" class="address-popup__input" type="text" placeholder="Этаж" />
      </div>

      <label class="address-popup__field">
        <span class="address-popup__label">Квартира</span>
        <input v-model="form.apartment" class="address-popup__input" type="text" />
      </label>

      <label class="address-popup__checkbox-row">
        <input v-model="form.privateHouse" type="checkbox" class="address-popup__checkbox" />
        <span>Частный дом</span>
      </label>

      <textarea
        v-model="form.note"
        class="address-popup__textarea"
        placeholder="Примечание к адресу"
      />

      <label class="address-popup__checkbox-row">
        <input v-model="form.saveAddress" type="checkbox" class="address-popup__checkbox" />
        <span>Сохранить адрес для будущих заказов</span>
      </label>

      <button
        type="button"
        class="address-popup__submit"
        :disabled="isConfirmDisabled"
        @click="emit('confirm')"
      >
        Подтвердить адрес
      </button>
    </template>

    <template v-else>
      <h2 class="address-popup__title">Самовывоз</h2>
      <p class="address-popup__pickup-text">
        Выберите точку на карте справа, чтобы сориентироваться по зоне доставки.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SuggestItem } from '@/types/api'

defineOptions({
  name: 'AddressPopupFormPane',
})

defineProps<{
  activeTab: 'delivery' | 'pickup'
  form: {
    street: string
    block: string
    entrance: string
    intercom: string
    floor: string
    apartment: string
    privateHouse: boolean
    note: string
    saveAddress: boolean
  }
  suggestResults: SuggestItem[]
  isSuggestOpen: boolean
  canSearchAddress: boolean
  isGeocoding: boolean
  deliveryStatusMessage: string
  deliveryStatusKind: 'neutral' | 'success' | 'error'
  addressLookupError: string
  isConfirmDisabled: boolean
  getSuggestTitle: (item: SuggestItem) => string
  getSuggestAddress: (item: SuggestItem) => string
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', value: 'delivery' | 'pickup'): void
  (e: 'street-input'): void
  (e: 'street-focus'): void
  (e: 'search'): void
  (e: 'select-suggest', item: SuggestItem): void
  (e: 'confirm'): void
}>()

const suggestContainer = ref<HTMLElement | null>(null)

defineExpose({
  suggestContainer,
})
</script>

<style lang="scss">
.address-popup__left {
  padding: 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: #0e0d10;
  overflow-y: auto;
}

.address-popup__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  margin-bottom: 16px;
}

.address-popup__tab {
  height: 46px;
  border-radius: 10px;
  color: #bcb2b6;
  font-weight: 500;
}

.address-popup__tab--active {
  background: var(--accent-button-bg);
  color: #fff;
}

.address-popup__title {
  margin: 0 0 12px;
  font-size: 32px;
  line-height: 1.1;
}

.address-popup__input,
.address-popup__textarea {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #121115;
  color: #f1eced;
  border-radius: 12px;
}

.address-popup__address-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.address-popup__suggest-container {
  position: relative;
}

.address-popup__suggest-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #19171c;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35);
  z-index: 3;
}

.address-popup__suggest-item {
  padding: 12px 14px;
  text-align: left;
  color: #f1eced;
  transition: background-color 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.address-popup__suggest-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.address-popup__suggest-title {
  font-weight: 700;
  color: #f5f1f2;
}

.address-popup__suggest-address {
  font-size: 13px;
  color: #b9adb2;
}

.address-popup__search {
  min-width: 112px;
  height: 50px;
  padding: 0 16px;
  border-radius: 12px;
  background: var(--accent-button-bg);
  border: 1px solid var(--accent-soft-border);
  color: #fff;
}

.address-popup__search:disabled,
.address-popup__submit:disabled {
  opacity: 0.55;
}

.address-popup__hint {
  margin: 0 0 12px;
  color: #b9adb2;
  font-size: 13px;
  line-height: 1.4;
}

.address-popup__hint--error {
  color: #d9a6b5;
}

.address-popup__hint--success {
  color: #e5b4c2;
}

.address-popup__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.address-popup__input {
  height: 50px;
  padding: 0 12px;
}

.address-popup__field {
  display: block;
  margin-bottom: 10px;
}

.address-popup__label {
  display: block;
  margin-bottom: 6px;
  color: #b9adb2;
  font-size: 13px;
}

.address-popup__checkbox-row {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #d8d0d3;
  margin: 2px 0;
}

.address-popup__checkbox {
  width: 22px;
  height: 22px;
  margin: 0;
  accent-color: var(--accent);
}

.address-popup__textarea {
  min-height: 82px;
  resize: vertical;
  padding: 10px 12px;
  margin: 10px 0;
  font: inherit;
}

.address-popup__submit {
  margin-top: 12px;
  width: 100%;
  height: 52px;
  border-radius: 12px;
  color: #f5f1f2;
  background: var(--accent-button-bg);
  font-size: 22px;
  font-weight: 600;
}

.address-popup__pickup-text {
  margin: 0;
  color: #b9adb2;
  font-size: 16px;
  line-height: 1.4;
}

@media (max-width: 1060px) {
  .address-popup__left {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
}

@media (max-width: 640px) {
  .address-popup__left {
    padding: 14px;
  }

  .address-popup__title {
    font-size: 24px;
  }

  .address-popup__grid,
  .address-popup__address-row {
    grid-template-columns: 1fr;
  }
}
</style>
