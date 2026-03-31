<template>
  <div class="cart-item">
    <div
      class="cart-item__image-shell product-image-shell"
      :class="{ 'product-image-shell--fallback': !productImage }"
    >
      <img
        v-if="productImage"
        class="cart-item__image"
        :src="productImage"
        :alt="item.menuItem.name"
        loading="lazy"
        @error="handleImageError"
      />
      <div class="cart-item__image-placeholder product-image-placeholder">Нет фото</div>
    </div>

    <div class="cart-item__info">
      <span class="cart-item__name">
        {{ item.menuItem.name }}
      </span>

      <span v-if="variantLabel" class="cart-item__variant">
        {{ variantLabel }}
      </span>

      <span v-if="removedIngredientsLabel" class="cart-item__removed-ingredients">
        Без: {{ removedIngredientsLabel }}
      </span>

      <div class="cart-item__count-container">
        <button
          class="cart-item__button"
          type="button"
          @click="cartStore.removeFromCart(item.menuItem, item.selectedVariant, item.removedIngredients)"
        >
          <span class="material-symbols"> remove </span>
        </button>

        <span class="cart-item__count">
          {{ item.count }}
        </span>

        <button
          class="cart-item__button"
          type="button"
          @click="cartStore.addToCart(item.menuItem, item.selectedVariant, item.removedIngredients)"
        >
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
import { formatVariant, getProductImage, getProductPrice } from '@/utils/products'

defineOptions({
  name: 'CartItem',
})

const { item } = defineProps<{
  item: TCartItem
}>()

const cartStore = useCartStore()
const productImage = computed(() => getProductImage(item.menuItem, { thumbnail: true }))
const totalPrice = computed(() => getProductPrice(item.menuItem, item.selectedVariant) * item.count)
const variantLabel = computed(() =>
  item.selectedVariant ? formatVariant(item.selectedVariant) : null,
)
const removedIngredientsLabel = computed(() =>
  item.removedIngredients.map((ingredient) => ingredient.ingredient_name).join(', '),
)

function handleImageError(event: Event) {
  const image = event.currentTarget

  if (!(image instanceof HTMLImageElement)) return

  image.parentElement?.classList.add('product-image-shell--fallback')
}
</script>

<style lang="scss">
.cart-item {
  width: 100%;
  min-height: 90px;
  display: flex;
  gap: 12px;
  color: white;
}

.cart-item__image-shell {
  height: 90px;
  aspect-ratio: 2/1.5;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
}

.cart-item__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.cart-item__image-placeholder {
  background: rgba(255, 255, 255, 0.04);
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

.cart-item__variant {
  color: var(--text-secondary);
  font-size: 13px;
}

.cart-item__removed-ingredients {
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  line-height: 1.35;
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
  color: #fff;
  background: var(--accent-button-bg);
  border-radius: 10px;

  &:hover {
    filter: brightness(1.08);
  }
}

@media (max-width: 480px) {
  .cart-item {
    gap: 10px;
  }

  .cart-item__image-shell {
    width: 84px;
    height: 84px;
  }

  .cart-item__name {
    font-size: 14px;
  }

  .cart-item__variant {
    font-size: 12px;
  }

  .cart-item__price {
    font-size: 16px;
  }

  .cart-item__count-container {
    gap: 6px;
  }

  .cart-item__button {
    width: 26px;
    height: 26px;
  }
}
</style>
