import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { type TMenuItem } from '@/mocks'

type TCartItem = {
  menuItem: TMenuItem
  count: number
}

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref<Record<number, TCartItem>>({});

  function addToCart(item: TMenuItem) {
    if (cartItems.value[item.id]) {
      console.log(cartItems.value[item.id]);

      cartItems.value[item.id]!.count = cartItems.value[item.id]!.count + 1;
    } else {
      cartItems.value[item.id] = {
        menuItem: item,
        count: 1,
      }
    }
  }

  return {
    cartItems,
    addToCart,
  }
})
