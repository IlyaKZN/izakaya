<template>
  <div class="menu-item-screen">
    <div v-if="isLoading" class="menu-item-screen__state">
      <span class="material-symbols">progress_activity</span>
      <span>Загружаем блюдо</span>
    </div>

    <div v-else-if="!item" class="menu-item-screen__state">
      <span class="material-symbols">search_off</span>
      <span>Блюдо не найдено</span>
    </div>

    <div v-else class="menu-item-screen__content">
      <div class="menu-item-screen__left-column">
        <button class="menu-item-screen__back-link" type="button" @click="goToMain">
          <span class="material-symbols"> arrow_back </span>

          <span class="menu-item-screen__back-link-text"> Вернуться назад </span>
        </button>

        <div
          class="menu-item-screen__preview-shell product-image-shell"
          :class="{ 'product-image-shell--fallback': !productImage }"
        >
          <img
            v-if="productImage"
            class="menu-item-screen__preview"
            :src="productImage"
            :alt="item.name"
            @error="handleImageError"
          />
          <div class="menu-item-screen__preview-placeholder product-image-placeholder">Нет фото</div>
        </div>

        <div v-if="ingredients.length" class="menu-item-screen__ingredients">
          <template v-for="(ingredient, index) in ingredients" :key="ingredient">
            <span class="menu-item-screen__ingredient">
              {{ ingredient }}
            </span>

            <span v-if="index !== ingredients.length - 1" class="menu-item-screen__separator">
              •
            </span>
          </template>
        </div>
      </div>

      <div class="menu-item-screen__info">
        <span class="menu-item-screen__name">
          {{ item.name }}
        </span>

        <span v-if="weightLabel" class="menu-item-screen__weight"> {{ weightLabel }} </span>

        <p v-if="item.description" class="menu-item-screen__description">
          {{ item.description }}
        </p>

        <div v-if="item.variants.length" class="menu-item-screen__variant-picker">
          <span class="menu-item-screen__variant-title">Выберите вариант</span>

          <div class="menu-item-screen__variant-list">
            <button
              v-for="variant in item.variants"
              :key="variant.id"
              type="button"
              class="menu-item-screen__variant-button"
              :class="{
                'menu-item-screen__variant-button--active': selectedVariant?.id === variant.id,
              }"
              @click="selectedVariantId = variant.id"
            >
              <span>{{ variant.name }}</span>
              <span>{{ variant.quantity_value }} г</span>
              <span>{{ formatProductPrice(item, variant) }}</span>
            </button>
          </div>
        </div>

        <span class="menu-item-screen__price"> {{ productPrice }} </span>

        <span v-if="variantsLabel" class="menu-item-screen__variants">
          {{ variantsLabel }}
        </span>

        <div v-if="!cartItem" class="menu-item-screen__add-container">
          <button
            @click="cartStore.addToCart(item, selectedVariant)"
            class="menu-item-screen__add-to-cart-button"
            type="button"
          >
            Добавить в корзину
          </button>
        </div>

        <div v-else class="menu-item-screen__change-count-button-container">
          <button
            class="menu-item-screen__change-count-button"
            type="button"
            @click="cartStore.removeFromCart(item, selectedVariant)"
          >
            <span class="material-symbols"> remove </span>
          </button>

          <span class="menu-item-screen__count">
            {{ cartItem.count }}
          </span>

          <button
            class="menu-item-screen__change-count-button"
            type="button"
            @click="cartStore.addToCart(item, selectedVariant)"
          >
            <span class="material-symbols"> add </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import {
  formatProductPrice,
  getDefaultProductVariant,
  getProductImage,
  getProductIngredients,
  getProductVariantById,
  getProductVariantsLabel,
  getProductWeight,
} from '@/utils/products'

defineOptions({
  name: 'MenuItemScreen',
})

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const productsStore = useProductsStore()

const isLoading = ref(false)
const selectedVariantId = ref<string | null>(null)
const itemId = computed(() => String(route.params.id))

const item = computed(() => productsStore.productsById[itemId.value])
const selectedVariant = computed(() => {
  if (!item.value) return null

  return (
    getProductVariantById(item.value, selectedVariantId.value) ??
    getDefaultProductVariant(item.value)
  )
})
const cartItem = computed(() =>
  item.value ? cartStore.getCartItem(item.value, selectedVariant.value) : null,
)
const productImage = computed(() => (item.value ? getProductImage(item.value) : ''))
const ingredients = computed(() => (item.value ? getProductIngredients(item.value) : []))
const productPrice = computed(() =>
  item.value ? formatProductPrice(item.value, selectedVariant.value) : '',
)
const weightLabel = computed(() =>
  item.value ? getProductWeight(item.value, selectedVariant.value) : null,
)
const variantsLabel = computed(() => (item.value ? getProductVariantsLabel(item.value) : null))

async function loadProduct() {
  if (!itemId.value || item.value) return

  isLoading.value = true

  try {
    await productsStore.fetchProduct(itemId.value)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadProduct().catch(() => undefined)
})

watch(itemId, () => {
  selectedVariantId.value = null
  void loadProduct().catch(() => undefined)
})

watch(
  item,
  (nextItem) => {
    selectedVariantId.value = nextItem ? (getDefaultProductVariant(nextItem)?.id ?? null) : null
  },
  { immediate: true },
)

function goToMain() {
  router.push({
    name: 'main',
  })
}

function handleImageError(event: Event) {
  const image = event.currentTarget

  if (!(image instanceof HTMLImageElement)) return

  image.parentElement?.classList.add('product-image-shell--fallback')
}
</script>

<style lang="scss">
.menu-item-screen {
  width: 100%;
}

.menu-item-screen__state {
  min-height: 260px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background: var(--surface-1);
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.menu-item-screen__preview-shell {
  width: min(460px, 100%);
  aspect-ratio: 2/1.45;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: var(--shadow-card);
}

.menu-item-screen__preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.menu-item-screen__preview-placeholder {
  background: rgba(255, 255, 255, 0.04);
}

.menu-item-screen__content {
  display: grid;
  grid-template-columns: minmax(0, 460px) minmax(0, 1fr);
  gap: 28px;
  padding: 0;
}

.menu-item-screen__left-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.menu-item-screen__back-link {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
}

.menu-item-screen__back-link:hover {
  background: rgba(255, 255, 255, 0.14);
}

.menu-item-screen__back-link-text {
  cursor: pointer;
}

.menu-item-screen__info {
  display: flex;
  flex-direction: column;
  padding-top: 44px;
}

.menu-item-screen__name {
  font-size: 34px;
  margin-bottom: 10px;
  font-weight: 700;
}

.menu-item-screen__weight {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.menu-item-screen__description {
  margin: 0 0 20px;
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.5;
}

.menu-item-screen__ingredients {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.menu-item-screen__ingredient {
  font-size: 16px;
  color: var(--text-secondary);
}

.menu-item-screen__variant-picker {
  margin-bottom: 20px;
}

.menu-item-screen__variant-title {
  display: block;
  margin-bottom: 10px;
  color: var(--text-secondary);
}

.menu-item-screen__variant-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.menu-item-screen__variant-button {
  min-width: 150px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  display: grid;
  gap: 4px;
  text-align: left;
}

.menu-item-screen__variant-button--active {
  border-color: var(--accent-soft-border);
  background: var(--accent-soft);
}

.menu-item-screen__price {
  margin-bottom: 20px;
  font-size: 34px;
  font-weight: 700;
}

.menu-item-screen__variants {
  margin-bottom: 20px;
  color: var(--text-secondary);
}

.menu-item-screen__add-container {
  display: flex;
}

.menu-item-screen__add-to-cart-button {
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  color: #fff;
  background: var(--accent-button-bg);
}

.menu-item-screen__separator {
  font-size: 12px;
  color: rgb(144, 144, 144);
}

.menu-item-screen__change-count-button-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-item-screen__change-count-button {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--accent-button-bg);
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    color: white;
    font-size: 24px;
  }
}

.menu-item-screen__count {
  min-width: 24px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
}

@media (max-width: 900px) {
  .menu-item-screen__content {
    grid-template-columns: 1fr;
    padding: 0;
  }

  .menu-item-screen__info {
    padding-top: 0;
  }

  .menu-item-screen__name,
  .menu-item-screen__price {
    font-size: 28px;
  }
}

@media (max-width: 640px) {
  .menu-item-screen__content {
    gap: 16px;
  }

  .menu-item-screen__preview {
    border-radius: 14px;
  }

  .menu-item-screen__preview-shell {
    width: 100%;
    border-radius: 14px;
  }

  .menu-item-screen__back-link {
    width: 100%;
    justify-content: center;
  }

  .menu-item-screen__name,
  .menu-item-screen__price {
    font-size: 24px;
  }

  .menu-item-screen__description,
  .menu-item-screen__ingredient {
    font-size: 14px;
  }

  .menu-item-screen__variant-list {
    display: grid;
    grid-template-columns: 1fr;
  }

  .menu-item-screen__variant-button {
    min-width: 0;
  }

  .menu-item-screen__add-container,
  .menu-item-screen__change-count-button-container {
    width: 100%;
  }

  .menu-item-screen__add-to-cart-button {
    width: 100%;
  }

  .menu-item-screen__change-count-button-container {
    justify-content: space-between;
  }
}
</style>
