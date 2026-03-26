<template>
  <div class="cart">
    <div v-for="cartItem in cartItems" :key="cartItem.menuItem.id">
      {{ cartItem.menuItem }}
      {{ cartItem.count }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useCartStore } from '@/stores/cart';
  import { storeToRefs } from 'pinia';

  defineOptions({
    name: 'TheCart'
  })

  const cartStore = useCartStore();

  const { cartItems } = storeToRefs(cartStore);
</script>

<style lang="scss">
  .cart {
    width: 400px;
    height: 300px;
    background-color: greenyellow;
  }
</style>
