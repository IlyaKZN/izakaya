<template>
  <div class="cart-container">
    <div class="cart">
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
          <span>{{ subtotal }} ₽</span>
        </div>
      </div>

      <button
        v-if="cartItemList.length"
        type="button"
        class="cart__checkout"
        @click="router.push({ name: 'checkout' })"
      >
        Перейти к оформлению
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import CartItem from '../CartItem'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'

defineOptions({
  name: 'TheCart',
})

const router = useRouter()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()
const { cartItemList } = storeToRefs(cartStore)
const { subtotal } = storeToRefs(checkoutStore)

const itemsCount = computed(() =>
  cartItemList.value.reduce((sum, item) => sum + item.count, 0),
)
</script>

<style lang="scss">
.cart-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 128px);
  min-height: 0;
}

.cart {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--surface-border);
  padding: 16px;
  border-radius: var(--radius-lg);
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
  font-size: 14px;
  line-height: 1.4;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
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
  height: 46px;
  border-radius: 16px;
  background: var(--accent-button-bg);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 10px 22px rgba(103, 34, 53, 0.18);
}

.cart__separator {
  height: 1px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.cart::-webkit-scrollbar {
  width: 6px;
}

.cart::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}

.cart::-webkit-scrollbar-track {
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

  .cart__summary-row {
    gap: 12px;
    font-size: 14px;
  }

  .cart__summary-row--total {
    font-size: 18px;
  }

  .cart__checkout {
    height: 42px;
  }
}
</style>
