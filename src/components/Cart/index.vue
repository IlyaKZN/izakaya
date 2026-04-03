<template>
  <div class="cart-container">
    <div class="cart-order-panel">
      <div class="cart-order-panel__switcher">
        <button
          type="button"
          class="cart-order-panel__switch-button"
          :class="{ 'cart-order-panel__switch-button--active': orderMode === 'delivery' }"
          @click="orderMode = 'delivery'"
        >
          Доставка
        </button>

        <button
          type="button"
          class="cart-order-panel__switch-button"
          :class="{ 'cart-order-panel__switch-button--active': orderMode === 'pickup' }"
          @click="orderMode = 'pickup'"
        >
          Самовывоз
        </button>
      </div>

      <button
        type="button"
        class="cart-order-panel__address-button"
        :class="{ 'cart-order-panel__address-button--pickup': orderMode === 'pickup' }"
        @click="handleAddressButtonClick"
      >
        <span class="material-symbols cart-order-panel__address-icon">
          {{ orderMode === 'delivery' ? 'location_on' : 'storefront' }}
        </span>
        <span class="cart-order-panel__address-label">
          {{ orderMode === 'delivery' ? deliveryAddressLabel : 'Самовывоз из ресторана' }}
        </span>
        <span class="material-symbols cart-order-panel__address-arrow">chevron_right</span>
      </button>
    </div>

    <div class="cart">
      <div class="cart__scroll">
        <div class="cart__header">
          <span class="cart__title">Корзина</span>
          <span v-if="cartItemList.length" class="cart__badge">{{ itemsCount }}</span>
        </div>

        <div v-if="cartItemList.length === 0" class="cart__empty-state">
          Пока пусто. Добавьте блюда из каталога.
        </div>

        <div v-else class="cart__items">
          <template v-for="(cartItem, index) in cartItemList" :key="cartItem.id">
            <CartItem :item="cartItem" />
            <div v-if="index !== cartItemList.length - 1" class="cart__separator" />
          </template>
        </div>

        <div v-if="cartItemList.length" class="cart__summary">
          <div class="cart__summary-row">
            <span>Товары</span>
            <span>{{ subtotal }} ₽</span>
          </div>

          <div class="cart__summary-row cart__summary-row--total">
            <span>Итого</span>
            <span>{{ totalPrice }} ₽</span>
          </div>
        </div>

        <button
          type="button"
          class="cart__checkout"
          :disabled="cartItemList.length === 0"
          @click="goToCheckout"
        >
          Перейти к оформлению
        </button>
      </div>
    </div>

    <AddressPopup
      v-model="isAddressPopupOpen"
      :initial-address="selectedAddress"
      @confirm="handleAddressConfirm"
    />

    <AuthPopup v-model="isAuthPopupOpen" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import AddressPopup from '../AddressPopup'
import type { CheckoutAddress } from '../AddressPopup'
import AuthPopup from '../AuthPopup'
import CartItem from '../CartItem'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import { useUsersStore } from '@/stores/users'

defineOptions({
  name: 'TheCart',
})

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()
const usersStore = useUsersStore()
const { cartItemList } = storeToRefs(cartStore)
const { profile } = storeToRefs(usersStore)
const { isAuthenticated } = storeToRefs(authStore)
const { subtotal, totalPrice, orderMode, selectedAddress, deliveryAddressLabel } =
  storeToRefs(checkoutStore)
const isAddressPopupOpen = ref(false)
const isAuthPopupOpen = ref(false)
const shouldRedirectToCheckoutAfterAuth = ref(false)

const itemsCount = computed(() =>
  cartItemList.value.reduce((sum, item) => sum + item.count, 0),
)

function handleAddressButtonClick() {
  if (orderMode.value !== 'delivery') return

  isAddressPopupOpen.value = true
}

function handleAddressConfirm(address: CheckoutAddress) {
  selectedAddress.value = address
}

function goToCheckout() {
  if (!isAuthenticated.value) {
    shouldRedirectToCheckoutAfterAuth.value = true
    isAuthPopupOpen.value = true
    return
  }

  void router.push({ name: 'checkout' })
}

watch(
  profile,
  (nextProfile) => {
    checkoutStore.prefillFromProfile(nextProfile)
  },
  { immediate: true },
)

watch(isAuthenticated, (nextValue) => {
  if (!nextValue || !shouldRedirectToCheckoutAfterAuth.value) return

  shouldRedirectToCheckoutAfterAuth.value = false
  isAuthPopupOpen.value = false
  void router.push({ name: 'checkout' })
})

watch(isAuthPopupOpen, (isOpen) => {
  if (isOpen || isAuthenticated.value) return

  shouldRedirectToCheckoutAfterAuth.value = false
})
</script>

<style lang="scss">
.cart-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: calc(100vh - 144px);
  padding-bottom: 16px;
  min-height: 0;
}

.cart-order-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cart-order-panel__switcher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  border-radius: 14px;
  border: 1px solid var(--surface-border);
  background: rgba(255, 255, 255, 0.04);
}

.cart-order-panel__switch-button {
  min-height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 600;
  transition:
    background-color 0.12s ease,
    color 0.12s ease;
}

.cart-order-panel__switch-button--active {
  color: #fff;
  background: var(--accent-button-bg);
  box-shadow: 0 8px 18px rgba(103, 34, 53, 0.18);
}

.cart-order-panel__address-button {
  min-height: 52px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid var(--surface-border);
  background: rgba(255, 255, 255, 0.04);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  text-align: left;
  transition:
    border-color 0.12s ease,
    background-color 0.12s ease;
}

.cart-order-panel__address-button:hover {
  border-color: rgba(143, 29, 63, 0.42);
  background: rgba(143, 29, 63, 0.12);
}

.cart-order-panel__address-button--pickup {
  cursor: default;
}

.cart-order-panel__address-button--pickup:hover {
  border-color: var(--surface-border);
  background: rgba(255, 255, 255, 0.04);
}

.cart-order-panel__address-icon,
.cart-order-panel__address-arrow {
  color: var(--accent);
}

.cart-order-panel__address-label {
  min-width: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart {
  flex: 1 1 auto;
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-lg);
  min-height: 0;
  overflow: hidden;
}

.cart__scroll {
  max-height: 100%;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.cart__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cart__title {
  font-size: 24px;
  color: var(--text-primary);
  font-weight: 600;
}

.cart__badge {
  min-width: 28px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--accent-soft);
}

.cart__empty-state {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.4;
  padding: 18px 12px 10px;
  text-align: center;
  background: transparent;
  border: 0;
}

.cart__items {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cart__summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.cart__summary-row {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
}

.cart__summary-row--total {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}

.cart__checkout {
  width: 100%;
  min-height: 52px;
  padding: 0 16px;
  border-radius: 16px;
  background: var(--accent-button-bg);
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  box-shadow: 0 10px 22px rgba(103, 34, 53, 0.18);
}

.cart__checkout:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.cart__separator {
  height: 1px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.cart__scroll::-webkit-scrollbar {
  width: 6px;
}

.cart__scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}

.cart__scroll::-webkit-scrollbar-track {
  background: transparent;
}

@media (max-width: 1280px) {
  .cart-container {
    height: auto;
    padding-bottom: 0;
  }
}

@media (max-width: 640px) {
  .cart-order-panel__switch-button {
    min-height: 42px;
    font-size: 14px;
  }

  .cart-order-panel__address-button {
    min-height: 48px;
  }

  .cart {
    padding: 0;
  }

  .cart__scroll {
    padding: 12px;
    gap: 12px;
  }

  .cart__title {
    font-size: 22px;
  }

  .cart__summary-row {
    gap: 12px;
    font-size: 14px;
  }

  .cart__summary-row--total {
    font-size: 18px;
  }

  .cart__checkout {
    min-height: 48px;
    font-size: 16px;
  }
}
</style>
