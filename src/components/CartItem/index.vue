<template>
  <div class="cart-item">
    <img class="cart-item__image" :src="productImage" :alt="item.menuItem.name" loading="lazy" />

    <div class="cart-item__info">
      <span class="cart-item__name">
        {{ item.menuItem.name }}
      </span>

      <div class="cart-item__count-container">
        <button
          class="cart-item__button"
          type="button"
          @click="cartStore.removeFromCart(item.menuItem)"
        >
          <span class="material-symbols"> remove </span>
        </button>

        <span class="cart-item__count">
          {{ item.count }}
        </span>

        <button class="cart-item__button" type="button" @click="cartStore.addToCart(item.menuItem)">
          <span class="material-symbols"> add </span>
        </button>
      </div>

      <span class="cart-item__price"> {{ totalPrice }} ₽ </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type TCartItem } from '@/stores/cart'
import { useCartStore } from '@/stores/cart'
import { getProductImage, getProductPrice } from '@/utils/products'

defineOptions({
  name: 'CartItem',
})

const { item } = defineProps<{
  item: TCartItem
}>()

const cartStore = useCartStore()
const productImage = computed(() => getProductImage(item.menuItem))
const totalPrice = computed(() => getProductPrice(item.menuItem) * item.count)
</script>

<style lang="scss">
.cart-item {
  width: 100%;
  min-height: 90px;
  display: flex;
  gap: 12px;
  color: white;
}

.cart-item__image {
  height: 90px;
  aspect-ratio: 2/1.5;
  border-radius: 10px;
  object-fit: cover;
}

.cart-item__info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.cart-item__name {
  font-size: 15px;
  line-height: 1.2;
  color: var(--text-primary);
}

.cart-item__count-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-item__count {
  min-width: 20px;
  text-align: center;
}

.cart-item__price {
  font-size: 18px;
  font-weight: 700;
}

.cart-item__button {
  height: 28px;
  width: 28px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;

  &:hover {
    background-color: rgba(255, 255, 255, 0.18);
  }
}
</style>
