import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type {
  OrderItemCreateInput,
  ProductRead,
  ProductRemovableIngredientRead,
  ProductVariantRead,
} from '@/types/api'
import { getDefaultProductVariant } from '@/utils/products'

const CART_STORAGE_KEY = 'izakaya-cart'

export type TCartItem = {
  id: string
  menuItem: ProductRead
  selectedVariant: ProductVariantRead | null
  removedIngredients: ProductRemovableIngredientRead[]
  count: number
}

function getCartItemId(productId: string, variantId?: string | null, removedIngredientIds: string[] = []) {
  return `${productId}:${variantId ?? 'base'}:${removedIngredientIds.join(',') || 'full'}`
}

function normalizeRemovedIngredients(
  removedIngredients: ProductRemovableIngredientRead[] = [],
): ProductRemovableIngredientRead[] {
  return [...removedIngredients].sort((left, right) => left.id.localeCompare(right.id))
}

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref<Record<string, TCartItem>>({})

  const cartItemList = computed(() => Object.values(cartItems.value))

  function isCartItem(value: unknown): value is TCartItem {
    if (!value || typeof value !== 'object') return false

    const item = value as Partial<TCartItem>

    return (
      typeof item.id === 'string' &&
      typeof item.count === 'number' &&
      item.count > 0 &&
      !!item.menuItem &&
      typeof item.menuItem === 'object' &&
      Array.isArray(item.removedIngredients)
    )
  }

  function hydrateCart() {
    if (typeof window === 'undefined') return

    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY)

    if (!savedCart) return

    try {
      const parsedCart = JSON.parse(savedCart) as unknown

      if (!parsedCart || typeof parsedCart !== 'object') return

      cartItems.value = Object.fromEntries(
        Object.entries(parsedCart).filter((entry): entry is [string, TCartItem] => isCartItem(entry[1])),
      )
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY)
    }
  }

  function persistCart() {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems.value))
  }

  function getCartKey(
    item: ProductRead,
    variant?: ProductVariantRead | null,
    removedIngredients: ProductRemovableIngredientRead[] = [],
  ) {
    const resolvedVariant = variant ?? getDefaultProductVariant(item)
    const normalizedRemovedIngredients = normalizeRemovedIngredients(removedIngredients)

    return getCartItemId(
      item.id,
      resolvedVariant?.id ?? null,
      normalizedRemovedIngredients.map((ingredient) => ingredient.id),
    )
  }

  function getCartItem(
    item: ProductRead,
    variant?: ProductVariantRead | null,
    removedIngredients: ProductRemovableIngredientRead[] = [],
  ) {
    return cartItems.value[getCartKey(item, variant, removedIngredients)] ?? null
  }

  function addToCart(
    item: ProductRead,
    variant?: ProductVariantRead | null,
    removedIngredients: ProductRemovableIngredientRead[] = [],
  ) {
    const resolvedVariant = variant ?? getDefaultProductVariant(item)
    const normalizedRemovedIngredients = normalizeRemovedIngredients(removedIngredients)
    const cartKey = getCartKey(item, resolvedVariant, normalizedRemovedIngredients)

    if (cartItems.value[cartKey]) {
      cartItems.value[cartKey]!.count = cartItems.value[cartKey]!.count + 1
    } else {
      cartItems.value[cartKey] = {
        id: cartKey,
        menuItem: item,
        selectedVariant: resolvedVariant,
        removedIngredients: normalizedRemovedIngredients,
        count: 1,
      }
    }
  }

  function removeFromCart(
    item: ProductRead,
    variant?: ProductVariantRead | null,
    removedIngredients: ProductRemovableIngredientRead[] = [],
  ) {
    const cartKey = getCartKey(item, variant, removedIngredients)
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
      removed_ingredient_ids: item.removedIngredients.map((ingredient) => ingredient.id),
    }))
  }

  hydrateCart()

  watch(cartItems, persistCart, { deep: true })

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
