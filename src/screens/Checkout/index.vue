<template>
  <div class="checkout-screen">
    <div v-if="checkoutSuccessMessage" class="checkout-screen__state checkout-screen__state--success">
      <span class="material-symbols">check_circle</span>
      <h1>Заказ оформлен</h1>
      <p>{{ checkoutSuccessMessage }}</p>
      <div class="checkout-screen__state-actions">
        <RouterLink class="checkout-screen__primary-link" :to="{ name: 'main' }">
          Вернуться в меню
        </RouterLink>
        <RouterLink class="checkout-screen__secondary-link" :to="{ name: 'profile' }">
          Мои заказы
        </RouterLink>
      </div>
    </div>

    <div v-else-if="cartItemList.length === 0" class="checkout-screen__state">
      <span class="material-symbols">shopping_cart</span>
      <h1>Корзина пуста</h1>
      <p>Добавьте блюда из меню, чтобы перейти к оформлению заказа.</p>
      <RouterLink class="checkout-screen__primary-link" :to="{ name: 'main' }">
        Перейти в меню
      </RouterLink>
    </div>

    <template v-else>
      <div class="checkout-screen__topbar">
        <RouterLink class="checkout-screen__back-link" :to="{ name: 'main' }">
          Вернуться в меню
        </RouterLink>
      </div>

      <div class="checkout-screen__layout">
        <section class="checkout-card checkout-card--summary">
          <h2 class="checkout-card__summary-title">Ваш заказ</h2>

          <div class="checkout-card__items">
            <template v-for="(cartItem, index) in cartItemList" :key="cartItem.id">
              <CartItem :item="cartItem" />
              <div v-if="index !== cartItemList.length - 1" class="checkout-card__separator" />
            </template>
          </div>

          <div class="checkout-card__summary">
            <div class="checkout-card__summary-row">
              <span>Товары</span>
              <span>{{ subtotal }} ₽</span>
            </div>
            <div class="checkout-card__summary-row">
              <span>Доставка</span>
              <span>{{ deliveryFee }} ₽</span>
            </div>
            <div v-if="promoDiscount > 0" class="checkout-card__summary-row">
              <span>Скидка по промокоду</span>
              <span>-{{ promoDiscount }} ₽</span>
            </div>
            <div v-if="bonusesUsed > 0" class="checkout-card__summary-row">
              <span>Бонусы</span>
              <span>-{{ bonusesUsed }} ₽</span>
            </div>
            <div class="checkout-card__summary-row checkout-card__summary-row--total">
              <span>Итого</span>
              <span>{{ totalPrice }} ₽</span>
            </div>
          </div>

          <button
            type="button"
            class="checkout-card__submit"
            :disabled="isCheckoutDisabled"
            @click="submitOrder"
          >
            {{ isSubmittingOrder ? 'Оформляем заказ...' : 'Подтвердить заказ' }}
          </button>
        </section>

        <aside class="checkout-card checkout-card--details">
          <h2 class="checkout-card__details-title">Данные заказа</h2>

          <div class="checkout-card__section">
            <div class="checkout-card__switcher">
              <button
                type="button"
                class="checkout-card__switch-button"
                :class="{ 'checkout-card__switch-button--active': orderMode === 'delivery' }"
                @click="orderMode = 'delivery'"
              >
                Доставка
              </button>
              <button
                type="button"
                class="checkout-card__switch-button"
                :class="{ 'checkout-card__switch-button--active': orderMode === 'pickup' }"
                @click="orderMode = 'pickup'"
              >
                Самовывоз
              </button>
            </div>
          </div>

          <div class="checkout-card__section">
            <label class="checkout-card__field">
              <span>Телефон получателя</span>
              <input
                v-model.trim="recipientPhone"
                class="checkout-card__input"
                type="tel"
                placeholder="Телефон получателя"
              />
            </label>

            <div class="checkout-card__grid">
              <label class="checkout-card__field">
                <span>Количество персон</span>
                <input
                  v-model.number="persons"
                  class="checkout-card__input"
                  type="number"
                  min="1"
                  max="20"
                />
              </label>

              <label class="checkout-card__field">
                <span>Способ оплаты</span>
                <select v-model="paymentMethod" class="checkout-card__input">
                  <option value="cash">Наличными</option>
                  <option value="card">Картой курьеру</option>
                  <option value="online">Онлайн</option>
                </select>
              </label>
            </div>
          </div>

          <div class="checkout-card__section">
            <button
              v-if="orderMode === 'delivery'"
              type="button"
              class="checkout-card__address-button"
              @click="isAddressPopupOpen = true"
            >
              <span class="material-symbols">location_on</span>
              <span>{{ deliveryAddressLabel }}</span>
            </button>

            <p v-else class="checkout-card__pickup-note">
              Заказ будет подготовлен к самовывозу. Адрес доставки не требуется.
            </p>
          </div>

          <div class="checkout-card__section">
            <label class="checkout-card__field">
              <span>Комментарий к заказу</span>
              <textarea
                v-model.trim="orderComment"
                class="checkout-card__textarea"
                placeholder="Например, не звонить в домофон, оставить приборы на 2 персоны"
              />
            </label>
          </div>

          <div class="checkout-card__section">
            <div class="checkout-card__promo-row">
              <input
                v-model.trim="promoCode"
                class="checkout-card__input"
                placeholder="Промокод"
              />
              <button type="button" class="checkout-card__promo-button" @click="applyPromoCode">
                Применить
              </button>
            </div>

            <label class="checkout-card__checkbox-row">
              <input v-model="useBonuses" type="checkbox" :disabled="maxBonuses === 0" />
              <span>Списать бонусы до {{ maxBonuses }} ₽</span>
            </label>
          </div>

          <div
            v-if="orderMode === 'delivery' && subtotal > 0 && subtotal < minDeliveryOrder"
            class="checkout-card__notice"
          >
            Минимальная сумма для доставки: {{ minDeliveryOrder }} ₽
          </div>

          <div
            v-if="orderMode === 'delivery' && cartItemList.length > 0 && !selectedAddress"
            class="checkout-card__notice"
          >
            Выберите адрес доставки, чтобы оформить заказ.
          </div>

          <div v-if="checkoutError" class="checkout-card__notice checkout-card__notice--error">
            {{ checkoutError }}
          </div>
        </aside>
      </div>
    </template>

    <AddressPopup
      v-model="isAddressPopupOpen"
      :initial-address="selectedAddress"
      @confirm="handleAddressConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import AddressPopup from '@/components/AddressPopup'
import type { CheckoutAddress } from '@/components/AddressPopup'
import CartItem from '@/components/CartItem'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import { useUsersStore } from '@/stores/users'

defineOptions({
  name: 'CheckoutScreen',
})

const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()
const usersStore = useUsersStore()

const { cartItemList } = storeToRefs(cartStore)
const { profile } = storeToRefs(usersStore)
const {
  selectedAddress,
  orderMode,
  recipientPhone,
  persons,
  paymentMethod,
  orderComment,
  promoCode,
  useBonuses,
  isSubmittingOrder,
  checkoutError,
  checkoutSuccessMessage,
  minDeliveryOrder,
  subtotal,
  deliveryFee,
  promoDiscount,
  maxBonuses,
  bonusesUsed,
  totalPrice,
  deliveryAddressLabel,
  isCheckoutDisabled,
} = storeToRefs(checkoutStore)

const isAddressPopupOpen = ref(false)
const { applyPromoCode, submitOrder } = checkoutStore

function handleAddressConfirm(address: CheckoutAddress) {
  selectedAddress.value = address
}

watch(
  profile,
  (nextProfile) => {
    checkoutStore.prefillFromProfile(nextProfile)
  },
  { immediate: true },
)

watch(cartItemList, (nextItems) => {
  if (nextItems.length > 0 && checkoutSuccessMessage.value) {
    checkoutStore.clearFeedback()
  }
})
</script>

<style lang="scss">
.checkout-screen {
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.checkout-card,
.checkout-screen__state {
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background: var(--surface-1);
}

.checkout-screen__topbar {
  display: flex;
  justify-content: flex-start;
}

.checkout-screen__back-link,
.checkout-screen__primary-link,
.checkout-screen__secondary-link {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.checkout-screen__back-link,
.checkout-screen__secondary-link {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.checkout-screen__primary-link {
  background: var(--accent-button-bg);
}

.checkout-screen__layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 24px;
  align-items: start;
}

.checkout-card {
  padding: 20px;
}

.checkout-card__section + .checkout-card__section {
  margin-top: 18px;
}

.checkout-card__switcher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 4px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
}

.checkout-card__switch-button {
  height: 44px;
  border-radius: 12px;
  color: var(--text-secondary);
}

.checkout-card__switch-button--active {
  color: #fff;
  background: var(--accent-soft);
}

.checkout-card__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkout-card__field span {
  color: var(--text-secondary);
  font-size: 13px;
}

.checkout-card__input,
.checkout-card__textarea {
  width: 100%;
  border-radius: 14px;
  border: 1px solid var(--surface-border);
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
}

.checkout-card__input {
  height: 44px;
  padding: 0 12px;
}

.checkout-card__textarea {
  min-height: 96px;
  padding: 12px;
  resize: vertical;
  font: inherit;
}

.checkout-card__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.checkout-card__address-button,
.checkout-card__promo-button,
.checkout-card__submit {
  color: #fff;
  background: var(--accent-button-bg);
}

.checkout-card__address-button {
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;
}

.checkout-card__pickup-note {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.checkout-card__promo-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-bottom: 12px;
}

.checkout-card__promo-button {
  min-width: 120px;
  border-radius: 14px;
  padding: 0 16px;
}

.checkout-card__checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
}

.checkout-card__checkbox-row input {
  accent-color: var(--accent);
}

.checkout-card__notice {
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--accent-soft);
  border: 1px solid var(--accent-soft-border);
  color: #f0dde3;
  font-size: 13px;
}

.checkout-card__notice--error {
  background: rgba(176, 63, 63, 0.18);
  border-color: rgba(176, 63, 63, 0.35);
}

.checkout-card--details {
  position: sticky;
  top: calc(var(--app-header-height) + 24px);
}

.checkout-card__summary-title {
  margin: 0 0 16px;
  font-size: 24px;
}

.checkout-card__details-title {
  margin: 0 0 16px;
  font-size: 24px;
}

.checkout-card__items {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.checkout-card__separator {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.checkout-card__summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.checkout-card__summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-secondary);
}

.checkout-card__summary-row--total {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}

.checkout-card__submit {
  width: 100%;
  height: 48px;
  margin-top: 18px;
  border-radius: 16px;
  font-weight: 600;
}

.checkout-card__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkout-screen__state {
  min-height: 320px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}

.checkout-screen__state span:first-child {
  font-size: 36px;
}

.checkout-screen__state h1,
.checkout-screen__state p {
  margin: 0;
}

.checkout-screen__state p {
  color: var(--text-secondary);
}

.checkout-screen__state-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 1080px) {
  .checkout-screen__layout {
    grid-template-columns: 1fr;
  }

  .checkout-card--details {
    position: static;
  }
}

@media (max-width: 640px) {
  .checkout-card {
    padding: 14px;
  }

  .checkout-card__grid,
  .checkout-card__promo-row,
  .checkout-screen__state-actions {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .checkout-screen__back-link,
  .checkout-screen__primary-link,
  .checkout-screen__secondary-link {
    width: 100%;
  }
}
</style>
