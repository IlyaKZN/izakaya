<template>
  <div class="cart-container">
    <button type="button" class="cart__address" @click="isAddressPopupOpen = true">
      <span class="material-symbols">location_on</span>
      <span>{{ deliveryAddress }}</span>
    </button>

    <div class="cart">
      <span class="cart__title">Корзина</span>

      <div class="cart__mode-switcher">
        <button
          type="button"
          class="cart__mode-button"
          :class="{ 'cart__mode-button--active': orderMode === 'delivery' }"
          @click="orderMode = 'delivery'"
        >
          Доставка
        </button>
        <button
          type="button"
          class="cart__mode-button"
          :class="{ 'cart__mode-button--active': orderMode === 'pickup' }"
          @click="orderMode = 'pickup'"
        >
          Самовывоз
        </button>
      </div>

      <div v-if="cartItemList.length === 0" class="cart__empty-state">
        Пока пусто. Добавьте блюда из каталога.
      </div>

      <template v-for="(cartItem, index) in cartItemList" :key="cartItem.menuItem.id">
        <CartItem :item="cartItem" />

        <div v-if="index !== cartItemList.length - 1" class="cart__separator" />
      </template>

      <div class="cart__promo" v-if="cartItemList.length">
        <input v-model.trim="promoCode" class="cart__promo-input" placeholder="Промокод" />
        <button type="button" class="cart__promo-button" @click="applyPromoCode">Применить</button>
      </div>

      <label v-if="cartItemList.length" class="cart__bonus-row">
        <input v-model="useBonuses" type="checkbox" :disabled="maxBonuses === 0" />
        <span>Списать бонусы (до {{ maxBonuses }} ₽)</span>
      </label>

      <div v-if="cartItemList.length" class="cart__summary">
        <div class="cart__summary-row">
          <span>Товары</span>
          <span>{{ subtotal }} ₽</span>
        </div>

        <div class="cart__summary-row">
          <span>Доставка</span>
          <span>{{ deliveryFee }} ₽</span>
        </div>

        <div class="cart__summary-row" v-if="promoDiscount > 0">
          <span>Скидка по промокоду</span>
          <span>-{{ promoDiscount }} ₽</span>
        </div>

        <div class="cart__summary-row" v-if="bonusesUsed > 0">
          <span>Бонусы</span>
          <span>-{{ bonusesUsed }} ₽</span>
        </div>

        <div class="cart__summary-row cart__summary-row--total">
          <span>Итого</span>
          <span>{{ totalPrice }} ₽</span>
        </div>
      </div>

      <div
        v-if="orderMode === 'delivery' && subtotal > 0 && subtotal < minDeliveryOrder"
        class="cart__notice"
      >
        Минимальная сумма для доставки: {{ minDeliveryOrder }} ₽
      </div>

      <button
        v-if="cartItemList.length"
        type="button"
        class="cart__checkout"
        :disabled="isCheckoutDisabled"
      >
        Перейти к оформлению
      </button>
    </div>

    <AddressPopup v-model="isAddressPopupOpen" @confirm="handleAddressConfirm" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import CartItem from '../CartItem'
import AddressPopup from '../AddressPopup'

defineOptions({
  name: 'TheCart',
})

type TOrderMode = 'delivery' | 'pickup'

const PROMO_DISCOUNTS: Record<string, number> = {
  PHO10: 10,
  VIET5: 5,
}

const cartStore = useCartStore()
const { cartItems } = storeToRefs(cartStore)

const isAddressPopupOpen = ref(false)
const deliveryAddress = ref('Адрес доставки')
const orderMode = ref<TOrderMode>('delivery')
const promoCode = ref('')
const appliedPromoPercent = ref(0)
const useBonuses = ref(false)

const minDeliveryOrder = 800

const cartItemList = computed(() => Object.values(cartItems.value))

const subtotal = computed(() =>
  cartItemList.value.reduce((sum, item) => sum + item.menuItem.price * item.count, 0),
)

const deliveryFee = computed(() => {
  if (orderMode.value === 'pickup') return 0
  if (subtotal.value >= 1500 || subtotal.value === 0) return 0

  return 199
})

const promoDiscount = computed(() => Math.floor((subtotal.value * appliedPromoPercent.value) / 100))

const maxBonuses = computed(() => Math.min(300, Math.floor(subtotal.value * 0.15)))

const bonusesUsed = computed(() => {
  if (!useBonuses.value) return 0

  const afterPromo = subtotal.value - promoDiscount.value
  return Math.min(maxBonuses.value, Math.max(afterPromo, 0))
})

const totalPrice = computed(() =>
  Math.max(subtotal.value + deliveryFee.value - promoDiscount.value - bonusesUsed.value, 0),
)

const isCheckoutDisabled = computed(
  () =>
    cartItemList.value.length === 0 ||
    (orderMode.value === 'delivery' && subtotal.value < minDeliveryOrder),
)

const handleAddressConfirm = (address: string) => {
  deliveryAddress.value = address
}

const applyPromoCode = () => {
  const normalized = promoCode.value.toUpperCase()
  appliedPromoPercent.value = PROMO_DISCOUNTS[normalized] ?? 0
}
</script>

<style lang="scss">
.cart-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart__address {
  height: 44px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  background: var(--surface-1);
  border: 1px solid var(--surface-border);
  color: var(--text-secondary);
}

.cart {
  width: 100%;
  background: var(--surface-1);
  border: 1px solid var(--surface-border);
  padding: 16px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-card);
}

.cart__title {
  font-size: 24px;
  color: var(--text-primary);
  font-weight: 600;
}

.cart__mode-switcher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  gap: 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
}

.cart__mode-button {
  height: 36px;
  border-radius: 10px;
  color: var(--text-secondary);
}

.cart__mode-button--active {
  background: rgba(127, 46, 67, 0.35);
  color: #fff;
}

.cart__empty-state {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.4;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.cart__promo {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.cart__promo-input {
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--surface-border);
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  padding: 0 10px;
  outline: none;
}

.cart__promo-button {
  padding: 0 12px;
  border-radius: 10px;
  background: rgba(127, 46, 67, 0.35);
}

.cart__bonus-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;

  input {
    accent-color: var(--accent);
  }
}

.cart__summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  margin-top: 4px;
}

.cart__notice {
  padding: 10px;
  border-radius: 10px;
  background: rgba(127, 46, 67, 0.18);
  border: 1px solid rgba(127, 46, 67, 0.35);
  color: #f0dde3;
  font-size: 13px;
}

.cart__checkout {
  width: 100%;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(180deg, var(--accent), var(--accent-strong));
  color: #fff;
  font-weight: 600;
}

.cart__checkout:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cart__separator {
  height: 1px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
