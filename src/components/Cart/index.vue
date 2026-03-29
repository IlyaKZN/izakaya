<template>
  <div class="cart-container">
    <button type="button" class="cart__address" @click="isAddressPopupOpen = true">
      <span class="material-symbols">location_on</span>
      <span>{{ deliveryAddress }}</span>
    </button>

    <div class="cart">
      <span class="cart__title">Корзина</span>

      <div v-if="cartItemList.length === 0" class="cart__empty-state">
        Пока пусто. Добавьте блюда из каталога.
      </div>

      <template v-for="(cartItem, index) in cartItemList" :key="cartItem.menuItem.id">
        <CartItem :item="cartItem" />

        <div
          v-if="index !== cartItemList.length - 1"
          class="cart__separator"
        />
      </template>

      <div v-if="cartItemList.length" class="cart__footer">
        <span class="cart__total-label">Итого</span>
        <span class="cart__total-value">{{ totalPrice }} ₽</span>
      </div>
    </div>

    <AddressPopup
      v-model="isAddressPopupOpen"
      @confirm="handleAddressConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCartStore } from '@/stores/cart';
import { storeToRefs } from 'pinia';
import CartItem from '../CartItem';
import AddressPopup from '../AddressPopup';

defineOptions({
  name: 'TheCart',
});

const cartStore = useCartStore();
const { cartItems } = storeToRefs(cartStore);
const isAddressPopupOpen = ref(false);
const deliveryAddress = ref('Адрес доставки');

const cartItemList = computed(() => Object.values(cartItems.value));

const totalPrice = computed(() =>
  cartItemList.value.reduce((sum, item) => sum + item.menuItem.price * item.count, 0),
);

const handleAddressConfirm = (address: string) => {
  deliveryAddress.value = address;
};
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

.cart__empty-state {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.4;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.cart__separator {
  height: 1px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
}

.cart__footer {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart__total-label {
  color: var(--text-secondary);
}

.cart__total-value {
  font-size: 22px;
  font-weight: 700;
}
</style>
