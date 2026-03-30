import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { OrderItemCreateInput, ProductRead, ProductVariantRead } from '@/types/api'
import { getDefaultProductVariant } from '@/utils/products'

export type TCartItem = {
  id: string
  menuItem: ProductRead
  selectedVariant: ProductVariantRead | null
  count: number
}

function getCartItemId(productId: string, variantId?: string | null) {
  return `${productId}:${variantId ?? 'base'}`
}

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref<Record<string, TCartItem>>({})

  const cartItemList = computed(() => Object.values(cartItems.value))

  function getCartKey(item: ProductRead, variant?: ProductVariantRead | null) {
    const resolvedVariant = variant ?? getDefaultProductVariant(item)

    return getCartItemId(item.id, resolvedVariant?.id ?? null)
  }

  function getCartItem(item: ProductRead, variant?: ProductVariantRead | null) {
    return cartItems.value[getCartKey(item, variant)] ?? null
  }

  function addToCart(item: ProductRead, variant?: ProductVariantRead | null) {
    const resolvedVariant = variant ?? getDefaultProductVariant(item)
    const cartKey = getCartKey(item, resolvedVariant)

    if (cartItems.value[cartKey]) {
      cartItems.value[cartKey]!.count = cartItems.value[cartKey]!.count + 1
    } else {
      cartItems.value[cartKey] = {
        id: cartKey,
        menuItem: item,
        selectedVariant: resolvedVariant,
        count: 1,
      }
    }
  }

  function removeFromCart(item: ProductRead, variant?: ProductVariantRead | null) {
    const cartKey = getCartKey(item, variant)
    const cartItem = cartItems.value[cartKey]

    if (!cartItem) return

    cartItem.count -= 1

    if (cartItem.count === 0) {
      delete cartItems.value[cartKey]
    }
  }

  function clear() {
    cartItems.value = {}
  }

  function toOrderItems(): OrderItemCreateInput[] {
    return cartItemList.value.map((item) => ({
      product_id: item.menuItem.id,
      variant_id: item.selectedVariant?.id ?? null,
      quantity: item.count,
      removed_ingredient_ids: [],
    }))
  }

  return {
    cartItems,
    cartItemList,
    getCartItem,
    addToCart,
    removeFromCart,
    toOrderItems,
    clear,
  }
})
