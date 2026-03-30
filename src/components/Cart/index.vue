<template>
  <div class="cart-container">
    <button type="button" class="cart__address" @click="isAddressPopupOpen = true">
      <span class="material-symbols">location_on</span>
      <span>{{ deliveryAddressLabel }}</span>
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

      <div v-else class="cart__items">
        <template v-for="(cartItem, index) in cartItemList" :key="cartItem.id">
          <CartItem :item="cartItem" />

          <div v-if="index !== cartItemList.length - 1" class="cart__separator" />
        </template>
      </div>

      <div v-if="cartItemList.length" class="cart__phone">
        <input
          v-model.trim="recipientPhone"
          class="cart__field-input"
          type="tel"
          placeholder="Телефон получателя"
        />
      </div>

      <div v-if="cartItemList.length" class="cart__grid">
        <label class="cart__field">
          <span class="cart__field-label">Количество персон</span>
          <input v-model.number="persons" class="cart__field-input" type="number" min="1" max="20" />
        </label>

        <label class="cart__field">
          <span class="cart__field-label">Способ оплаты</span>
          <select v-model="paymentMethod" class="cart__field-input cart__field-input--select">
            <option value="cash">Наличными</option>
            <option value="card">Картой курьеру</option>
            <option value="online">Онлайн</option>
          </select>
        </label>
      </div>

      <label v-if="cartItemList.length" class="cart__field">
        <span class="cart__field-label">Комментарий к заказу</span>
        <textarea
          v-model.trim="orderComment"
          class="cart__textarea"
          placeholder="Например, не звонить в домофон, оставить приборы на 2 персоны"
        />
      </label>

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

      <div
        v-if="orderMode === 'delivery' && cartItemList.length > 0 && !selectedAddress"
        class="cart__notice"
      >
        Выберите адрес доставки, чтобы оформить заказ.
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

    <AddressPopup
      v-model="isAddressPopupOpen"
      :initial-address="selectedAddress"
      @confirm="handleAddressConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import { useUsersStore } from '@/stores/users'
import CartItem from '../CartItem'
import AddressPopup from '../AddressPopup'
import type { CheckoutAddress } from '../AddressPopup'
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
const usersStore = useUsersStore()
const { cartItemList } = storeToRefs(cartStore)
const { profile } = storeToRefs(usersStore)

const isAddressPopupOpen = ref(false)
const selectedAddress = ref<CheckoutAddress | null>(null)
const orderMode = ref<TOrderMode>('delivery')
const recipientPhone = ref('')
const persons = ref(1)
const paymentMethod = ref<'cash' | 'card' | 'online'>('cash')
const orderComment = ref('')
const promoCode = ref('')
const appliedPromoPercent = ref(0)
const useBonuses = ref(false)
const isSubmittingOrder = ref(false)
const checkoutError = ref('')
const checkoutSuccessMessage = ref('')

const minDeliveryOrder = 800
const deliveryAddressLabel = computed(() => selectedAddress.value?.label || 'Адрес доставки')

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
    !normalizePhone(recipientPhone.value) ||
    persons.value < 1 ||
    (orderMode.value === 'delivery' &&
      (!selectedAddress.value || subtotal.value < minDeliveryOrder)),
)

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '')

  if (!digits) return ''
  if (digits.startsWith('8')) return `7${digits.slice(1)}`
  if (digits.startsWith('7')) return digits
  return `7${digits}`
}

const handleAddressConfirm = (address: CheckoutAddress) => {
  selectedAddress.value = address
}

const applyPromoCode = () => {
  const normalized = promoCode.value.toUpperCase()
  appliedPromoPercent.value = PROMO_DISCOUNTS[normalized] ?? 0
}

const buildOrderComment = () => {
  const commentParts = [orderComment.value.trim()]

  if (orderMode.value === 'pickup') {
    commentParts.unshift('Самовывоз')
  }

  if (selectedAddress.value?.intercom) {
    commentParts.push(`Домофон: ${selectedAddress.value.intercom}`)
  }

  if (selectedAddress.value?.privateHouse) {
    commentParts.push('Частный дом')
  }

  return commentParts.filter(Boolean).join('. ') || null
}

const submitOrder = async () => {
  if (isCheckoutDisabled.value) return

  const normalizedPhone = normalizePhone(recipientPhone.value)

  if (!normalizedPhone) {
    checkoutError.value = 'Введите корректный телефон получателя.'
    return
  }

  isSubmittingOrder.value = true
  checkoutError.value = ''
  checkoutSuccessMessage.value = ''

  try {
    const order = await ordersStore.createOrder({
      address: orderMode.value === 'delivery' ? selectedAddress.value : null,
      recipient_phone: `+${normalizedPhone}`,
      persons: persons.value,
      payment_method: paymentMethod.value,
      promocode: promoCode.value || null,
      comment: buildOrderComment(),
      items: cartStore.toOrderItems(),
    })

    cartStore.clear()
    orderComment.value = ''
    promoCode.value = ''
    appliedPromoPercent.value = 0
    useBonuses.value = false
    if (orderMode.value === 'pickup') {
      selectedAddress.value = null
    }
    checkoutSuccessMessage.value = `Заказ ${order.id} успешно создан`
  } catch (error) {
    checkoutError.value = error instanceof Error ? error.message : 'Не удалось оформить заказ'
  } finally {
    isSubmittingOrder.value = false
  }
}

watch(
  profile,
  (nextProfile) => {
    if (!nextProfile) return

    if (!recipientPhone.value) {
      recipientPhone.value = nextProfile.phone
    }

    if (!selectedAddress.value && nextProfile.last_address) {
      selectedAddress.value = {
        ...nextProfile.last_address,
        label: [nextProfile.last_address.street, nextProfile.last_address.house]
          .filter(Boolean)
          .join(', '),
        intercom: null,
        privateHouse: false,
        saveAddress: true,
      }
    }
  },
  { immediate: true },
)
</script>

<style lang="scss">
.cart-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 128px);
}

.cart__address {
  height: 44px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--surface-border);
  color: var(--text-secondary);
  min-width: 0;

  span:last-child {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.cart {
  width: 100%;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--surface-border);
  padding: 16px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}

.cart__items {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 4px;
  margin-right: -4px;
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

.cart__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.cart__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cart__field-label {
  color: var(--text-secondary);
  font-size: 13px;
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

.cart__field-input--select {
  appearance: none;
}

.cart__textarea {
  min-height: 82px;
  resize: vertical;
  border-radius: 10px;
  border: 1px solid var(--surface-border);
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  padding: 10px;
  font: inherit;
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
  flex-shrink: 0;
}

.cart__items::-webkit-scrollbar {
  width: 6px;
}

.cart__items::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}

.cart__items::-webkit-scrollbar-track {
  background: transparent;
}

@media (max-width: 1280px) {
  .cart-container {
    max-height: none;
  }
}

@media (max-width: 640px) {
  .cart {
    padding: 12px;
    gap: 12px;
  }

  .cart__title {
    font-size: 22px;
  }

  .cart__grid {
    grid-template-columns: 1fr;
  }

  .cart__promo {
    grid-template-columns: 1fr;
  }

  .cart__promo-button,
  .cart__checkout {
    height: 42px;
  }

  .cart__summary-row {
    gap: 12px;
    font-size: 14px;
  }

  .cart__summary-row--total {
    font-size: 18px;
  }
}
</style>
