<template>
  <div class="menu-item-card">
    <div
      @click="goToItem"
      class="menu-item-card__image-container product-image-shell"
      :class="{ 'product-image-shell--fallback': !productImage }"
    >
      <span v-if="hasMultipleVariants && variantsLabel" class="menu-item-card__variants-badge">
        {{ variantsLabel }}
      </span>

      <img
        v-if="productImage"
        class="menu-item-card__image"
        :src="productImage"
        :alt="menuItem.name"
        loading="lazy"
        @error="handleImageError"
      />
      <div class="menu-item-card__image-placeholder product-image-placeholder">Нет фото</div>
    </div>

    <div class="menu-item-card__info">
      <span @click="goToItem" class="menu-item-card__name">{{ menuItem.name }}</span>

      <span v-if="weightLabel" class="menu-item-card__weight">
        {{ weightLabel }}
      </span>
      <span v-else class="menu-item-card__description">{{ menuDescription }}</span>

      <div class="menu-item-card__bottom-container">
        <span class="menu-item-card__price">{{ productPrice }}</span>

        <div class="menu-item-card__buttons-container">
          <FadeTransition>
            <button
              v-if="canChangeCount && cartItem"
              @click="cartStore.removeFromCart(menuItem)"
              class="menu-item-card__button menu-item-card__button--remove"
            >
              <span class="material-symbols">remove</span>
            </button>
          </FadeTransition>

          <FadeTransition>
            <span v-if="canChangeCount && cartItem" class="menu-item-card__count">
              {{ cartItem.count }}
            </span>
          </FadeTransition>

          <button
            @click="handlePrimaryAction"
            class="menu-item-card__button"
            :class="{ 'menu-item-card__button--select': hasMultipleVariants }"
          >
            <span v-if="hasMultipleVariants" class="menu-item-card__button-label">Выбрать</span>
            <span v-else class="material-symbols">add</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import FadeTransition from '../transitions/Fade'
import { useRouter } from 'vue-router'
import type { ProductRead } from '@/types/api'
import {
  formatProductPrice,
  getProductPrice,
  getProductVariantsLabel,
  getDefaultProductVariant,
  getProductImage,
  getProductWeight,
} from '@/utils/products'

defineOptions({
  name: 'MenuItemCard',
})

const { menuItem } = defineProps<{
  menuItem: ProductRead
}>()

const router = useRouter()
const cartStore = useCartStore()

const defaultVariant = computed(() => getDefaultProductVariant(menuItem))
const hasMultipleVariants = computed(() => menuItem.variants.length)
const canChangeCount = computed(() => !hasMultipleVariants.value)
const cartItem = computed(() => cartStore.getCartItem(menuItem, defaultVariant.value))
const productImage = computed(() => getProductImage(menuItem, { thumbnail: true }))
const variantsLabel = computed(() => getProductVariantsLabel(menuItem))
const productPrice = computed(() =>
  hasMultipleVariants.value
    ? `от ${getProductPrice(menuItem)} ₽`
    : formatProductPrice(menuItem, defaultVariant.value),
)
const weightLabel = computed(() => getProductWeight(menuItem, defaultVariant.value))
const menuDescription = computed(
  () => menuItem.description || menuItem.category?.name || 'Без описания',
)

function handlePrimaryAction() {
  if (hasMultipleVariants.value) {
    goToItem()
    return
  }

  cartStore.addToCart(menuItem)
}

function goToItem() {
  router.push({
    name: 'menu-item',
    params: {
      id: menuItem.id,
    },
  })
}

function handleImageError(event: Event) {
  const image = event.currentTarget

  if (!(image instanceof HTMLImageElement)) return

  image.parentElement?.classList.add('product-image-shell--fallback')
}
</script>

<style lang="scss">
.menu-item-card {
  width: 224px;
  height: 320px;
  padding: 10px;
  min-width: 224px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
    border-color: rgba(255, 255, 255, 0.18);

    .menu-item-card__image {
      transform: scale(1.08);
    }
  }
}

.menu-item-card__image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 2/1.5;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.menu-item-card__variants-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: rgba(15, 15, 15, 0.72);
  backdrop-filter: blur(10px);
}

.menu-item-card__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  transition: transform 0.18s ease;
}

.menu-item-card__image-placeholder {
  background: rgba(255, 255, 255, 0.04);
}

.menu-item-card__info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  padding: 4px;
}

.menu-item-card__name {
  font-size: 17px;
  line-height: 1.25;
  font-weight: 600;
  color: white;
  margin-bottom: 10px;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &:hover {
    text-decoration: underline;
  }
}

.menu-item-card__weight {
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.12);
  margin-bottom: 10px;
}

.menu-item-card__description {
  font-size: 13px;
  line-height: 1.35;
  color: var(--text-secondary);
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.menu-item-card__price {
  color: white;
  font-size: 20px;
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: 0.2px;
  min-width: 0;
  white-space: nowrap;
}

.menu-item-card__button {
  min-height: 44px;
  min-width: 44px;
  padding: 0 12px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-soft);
  box-shadow: none;
  cursor: pointer;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease,
    filter 0.1s ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.08);
  }

  &:active {
    transform: translateY(0);
  }

  span {
    color: white;
  }
}

.menu-item-card__button--remove {
  padding: 0;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: none;
}

.menu-item-card__button--select {
  width: auto;
  min-width: 96px;
  padding: 0 14px;
}

.menu-item-card__button-label {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.menu-item-card__bottom-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.menu-item-card__buttons-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.menu-item-card__count {
  min-width: 22px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

@media (max-width: 480px) {
  .menu-item-card {
    width: 100%;
    min-width: 0;
  }
}
</style>
