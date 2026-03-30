import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ProductRead } from '@/types/api'

export type TCartItem = {
  menuItem: ProductRead
  count: number
}

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref<Record<string, TCartItem>>({})

  function addToCart(item: ProductRead) {
    if (cartItems.value[item.id]) {
      cartItems.value[item.id]!.count = cartItems.value[item.id]!.count + 1
    } else {
      cartItems.value[item.id] = {
        menuItem: item,
        count: 1,
      }
    }
  }

  function removeFromCart(item: ProductRead) {
    const cartItem = cartItems.value[item.id]

    if (!cartItem) return

    cartItem.count -= 1

    if (cartItem.count === 0) {
      delete cartItems.value[item.id]
    }
  }

  function clear() {
    cartItems.value = {}
  }

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clear,
  }
})
