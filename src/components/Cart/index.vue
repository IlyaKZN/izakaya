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

      <template v-for="(cartItem, index) in cartItemList" :key="cartItem.id">
        <CartItem :item="cartItem" />

        <div v-if="index !== cartItemList.length - 1" class="cart__separator" />
      </template>

      <div v-if="cartItemList.length" class="cart__phone">
        <input
          v-model.trim="recipientPhone"
          class="cart__field-input"
          type="tel"
          placeholder="Телефон получателя"
        />
      </div>

      <div v-if="cartItemList.length" class="cart__promo">
        <input v-model.trim="promoCode" class="cart__field-input" placeholder="Промокод" />
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

        <div v-if="promoDiscount > 0" class="cart__summary-row">
          <span>Скидка по промокоду</span>
          <span>-{{ promoDiscount }} ₽</span>
        </div>

        <div v-if="bonusesUsed > 0" class="cart__summary-row">
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

      <div v-if="checkoutError" class="cart__notice cart__notice--error">
        {{ checkoutError }}
      </div>

      <div v-if="checkoutSuccessMessage" class="cart__notice cart__notice--success">
        {{ checkoutSuccessMessage }}
      </div>

      <button
        v-if="cartItemList.length"
        type="button"
        class="cart__checkout"
        :disabled="isCheckoutDisabled"
        @click="submitOrder"
      >
        {{ isSubmittingOrder ? 'Оформляем заказ...' : 'Перейти к оформлению' }}
      </button>
    </div>

    <AddressPopup v-model="isAddressPopupOpen" @confirm="handleAddressConfirm" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import CartItem from '../CartItem'
import AddressPopup from '../AddressPopup'
import { getProductPrice } from '@/utils/products'

defineOptions({
  name: 'TheCart',
})

type TOrderMode = 'delivery' | 'pickup'

const PROMO_DISCOUNTS: Record<string, number> = {
  PHO10: 10,
  VIET5: 5,
}

const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const { cartItemList } = storeToRefs(cartStore)

const isAddressPopupOpen = ref(false)
const deliveryAddress = ref('Адрес доставки')
const orderMode = ref<TOrderMode>('delivery')
const recipientPhone = ref('')
const promoCode = ref('')
const appliedPromoPercent = ref(0)
const useBonuses = ref(false)
const isSubmittingOrder = ref(false)
const checkoutError = ref('')
const checkoutSuccessMessage = ref('')

const minDeliveryOrder = 800

const subtotal = computed(() =>
  cartItemList.value.reduce(
    (sum, item) => sum + getProductPrice(item.menuItem, item.selectedVariant) * item.count,
    0,
  ),
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
    isSubmittingOrder.value ||
    cartItemList.value.length === 0 ||
    !recipientPhone.value ||
    (orderMode.value === 'delivery' && subtotal.value < minDeliveryOrder),
)

const handleAddressConfirm = (address: string) => {
  deliveryAddress.value = address
}

const applyPromoCode = () => {
  const normalized = promoCode.value.toUpperCase()
  appliedPromoPercent.value = PROMO_DISCOUNTS[normalized] ?? 0
}

const submitOrder = async () => {
  if (isCheckoutDisabled.value) return

  isSubmittingOrder.value = true
  checkoutError.value = ''
  checkoutSuccessMessage.value = ''

  try {
    const order = await ordersStore.createOrder({
      recipient_phone: recipientPhone.value,
      persons: 1,
      payment_method: 'cash',
      promocode: promoCode.value || null,
      comment: orderMode.value === 'pickup' ? 'Самовывоз' : null,
      items: cartStore.toOrderItems(),
    })

    cartStore.clear()
    promoCode.value = ''
    appliedPromoPercent.value = 0
    useBonuses.value = false
    checkoutSuccessMessage.value = `Заказ ${order.id} успешно создан`
  } catch (error) {
    checkoutError.value = error instanceof Error ? error.message : 'Не удалось оформить заказ'
  } finally {
    isSubmittingOrder.value = false
  }
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

.cart__field-input {
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--surface-border);
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  padding: 0 10px;
  outline: none;
  width: 100%;
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

.cart__notice--error {
  background: rgba(176, 63, 63, 0.18);
  border-color: rgba(176, 63, 63, 0.35);
}

.cart__notice--success {
  background: rgba(63, 176, 108, 0.18);
  border-color: rgba(63, 176, 108, 0.35);
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
