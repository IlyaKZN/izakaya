<template>
  <div class="cart">
    <span class="cart__title">
      Корзина
    </span>

    <template :key="cartItem.menuItem.id" v-for="(cartItem, id, index) in cartItems">
      <CartItem :item="cartItem"/>

      <div
      v-if="index !== Object.values(cartItems).length - 1"
      class="cart__separator"/>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { useCartStore } from '@/stores/cart';
  import { storeToRefs } from 'pinia';
  import CartItem from '../CartItem';

  defineOptions({
    name: 'TheCart'
  })

  const cartStore = useCartStore();

  const { cartItems } = storeToRefs(cartStore);
</script>

<style lang="scss">
  .cart {
    width: 360px;
    min-height: 300px;
    background-color: rgba(white, 0.08);
    border: 1px solid rgba(40, 40, 40);
    padding: 16px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .cart__title {
    font-size: 24px;
    color: white;
    display: inline-block;
    margin-bottom: 20px;
  }

  .cart__separator {
    height: 1px;
    width: 100%;
    background-color: rgba(white, 0.08);
  }
</style>
