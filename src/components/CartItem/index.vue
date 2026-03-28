<template>
  <div class="cart-item">
    <img
    class="cart-item__image"
    :src="item.menuItem.preview"/>

    <div class="cart-item__info">
      <span class="cart-item__name">
        {{ item.menuItem.name }}
      </span>

      <div class="cart-item__count-container">
        <button class="cart-item__button" @click="cartStore.removeFromCart(item.menuItem)">
          <span class="material-symbols">
            remove
          </span>
        </button>

        <span>
          {{ item.count }}
        </span>

        <button class="cart-item__button" @click="cartStore.addToCart(item.menuItem)">
          <span class="material-symbols">
            add
          </span>
        </button>
      </div>

      <span class="cart-item__price">
        {{ item.menuItem.price * item.count }} ₽
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { type TCartItem } from '@/stores/cart';
  import { useCartStore } from '@/stores/cart';

  defineOptions({
    name: 'CartItem',
  });

  const { item } = defineProps<{
    item: TCartItem,
  }>();

  const cartStore = useCartStore();
</script>

<style lang="scss">
  .cart-item {
    width: 100%;
    height: 88px;
    display: flex;
    gap: 12px;
    color: white;
  }

  .cart-item__image {
    height: 100%;
    aspect-ratio: 2/1.4;
    border-radius: 8px;
  }

  .cart-item__info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .cart-item__name {
    font-size: 18px;
  }

  .cart-item__count-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cart-item__price {
    font-size: 18px;
  }

  .cart-item__button {
    height: 28px;
    width: 28px;
    font-size: 16px;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: rgba(white, 0.08);
    }
  }
</style>