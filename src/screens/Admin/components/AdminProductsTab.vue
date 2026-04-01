<template>
  <section class="admin-card">
    <div class="admin-card__header admin-card__header--left admin-card__header--row">
      <div>
        <p class="admin-card__eyebrow">Товары</p>
        <h2 class="admin-card__title">
          {{
            productMode === 'create'
              ? 'Создание товара'
              : showProductForm
                ? 'Редактирование товара'
                : 'Список товаров'
          }}
        </h2>
      </div>

      <div class="admin-product-form__top-actions">
        <button
          v-if="!showProductForm"
          type="button"
          class="admin-button"
          @click="emit('startCreateProduct')"
        >
          Создать новый
        </button>

        <button
          v-if="showProductForm"
          type="button"
          class="admin-button admin-button--ghost"
          @click="emit('showProductList')"
        >
          К списку товаров
        </button>
      </div>
    </div>

    <div v-if="showProductList" class="admin-toolbar">
      <div class="admin-field admin-field--grow">
        <span>Товар</span>

        <div v-if="groupedProducts.length" class="admin-product-groups">
          <section v-for="group in groupedProducts" :key="group.id" class="admin-product-group">
            <div class="admin-product-group__header">
              <h3 class="admin-product-group__title">{{ group.name }}</h3>
              <span class="admin-product-group__count">{{ group.products.length }}</span>
            </div>

            <div class="admin-product-picker">
              <button
                v-for="product in group.products"
                :key="product.id"
                type="button"
                class="admin-product-card"
                :class="{ 'admin-product-card--active': selectedProductId === product.id }"
                @click="emit('selectProduct', product.id)"
              >
                <div
                  class="admin-product-card__image-shell product-image-shell"
                  :class="{ 'product-image-shell--fallback': !getProductImage(product, { thumbnail: true }) }"
                >
                  <img
                    v-if="getProductImage(product, { thumbnail: true })"
                    class="admin-product-card__image"
                    :src="getProductImage(product, { thumbnail: true })"
                    :alt="product.name"
                    loading="lazy"
                    @error="handleImageError"
                  />
                  <div class="admin-product-card__image-placeholder product-image-placeholder">
                    Нет фото
                  </div>
                </div>

                <div class="admin-product-card__body">
                  <div class="admin-product-card__top">
                    <strong>{{ product.name }}</strong>
                    <span
                      class="admin-product-card__status"
                      :class="{
                        'admin-product-card__status--active': product.is_active,
                        'admin-product-card__status--inactive': !product.is_active,
                      }"
                    >
                      {{ product.is_active ? 'Активен' : 'Скрыт' }}
                    </span>
                  </div>

                  <p class="admin-product-card__meta">{{ formatPrice(product.price ?? '0') }}</p>
                </div>
              </button>
            </div>
          </section>
        </div>

        <div v-else class="admin-empty">Список товаров пока пуст.</div>
      </div>
    </div>

    <div v-if="showProductForm && productError" class="admin-notice admin-notice--error">
      {{ productError }}
    </div>
    <div v-if="showProductForm && productSuccess" class="admin-notice admin-notice--success">
      {{ productSuccess }}
    </div>

    <form v-if="showProductForm" class="admin-product-form" @submit.prevent="emit('submit')">
      <div class="admin-product-form__body">
        <div class="admin-product-form__grid">
          <label class="admin-field admin-field--grow">
            <span>Название</span>
            <input v-model.trim="productForm.name" class="admin-input" required />
          </label>

          <label class="admin-field admin-field--grow">
            <span>Категория</span>
            <BaseSelect
              v-model="productForm.category_id"
              :options="categoryOptions"
              placeholder="Выберите категорию"
            />
          </label>

          <label class="admin-field admin-field--grow">
            <span>Цена</span>
            <input
              v-model.trim="productForm.price"
              class="admin-input"
              placeholder="Например, 500"
            />
          </label>
        </div>

        <label class="admin-field admin-field--grow">
          <span>Изображение</span>

          <div
            class="admin-product-image-picker product-image-shell"
            :class="{ 'product-image-shell--fallback': !productImagePreview }"
          >
            <input
              :key="productImageInputKey"
              class="admin-product-image-picker__input"
              type="file"
              accept="image/*"
              @change="emit('imageChange', $event)"
            />

            <img
              v-if="productImagePreview"
              class="admin-product-image-picker__image"
              :src="productImagePreview"
              alt="Изображение товара"
              @error="handleImageError"
            />

            <div class="admin-product-image-picker__placeholder product-image-placeholder">
              Нет фото
            </div>
          </div>
        </label>

        <p v-if="productImageHint" class="admin-field__hint">{{ productImageHint }}</p>

        <label class="admin-field admin-field--grow">
          <span>Описание</span>
          <textarea v-model.trim="productForm.description" class="admin-textarea" rows="3" />
        </label>

        <label class="admin-checkbox">
          <input v-model="productForm.is_active" type="checkbox" />
          <span>Товар активен</span>
        </label>

        <div class="admin-field admin-field--grow">
          <div class="admin-variants__header">
            <span>Варианты</span>

            <button
              type="button"
              class="admin-button admin-button--ghost admin-button--small"
              @click="addVariant"
            >
              Добавить вариант
            </button>
          </div>

          <div class="admin-variants">
            <div
              v-for="(variant, index) in variants"
              :key="variant.id"
              class="admin-variant-row"
            >
              <div class="admin-variant-row__grid">
                <label class="admin-field admin-field--grow">
                  <span>Название</span>
                  <input
                    :value="variant.name"
                    class="admin-input"
                    placeholder="Например, Стандарт"
                    @input="
                      updateVariantField(
                        variant.id,
                        'name',
                        ($event.target as HTMLInputElement).value,
                      )
                    "
                  />
                </label>

                <label class="admin-field admin-field--grow">
                  <span>Вес или объём</span>
                  <input
                    :value="variant.weight"
                    class="admin-input"
                    placeholder="Например, 500 г"
                    @input="
                      updateVariantField(
                        variant.id,
                        'weight',
                        ($event.target as HTMLInputElement).value,
                      )
                    "
                  />
                </label>

                <label class="admin-field admin-field--grow">
                  <span>Цена</span>
                  <input
                    :value="variant.price"
                    class="admin-input"
                    inputmode="decimal"
                    placeholder="Например, 400"
                    @input="
                      updateVariantField(
                        variant.id,
                        'price',
                        ($event.target as HTMLInputElement).value,
                      )
                    "
                  />
                </label>
              </div>

              <div class="admin-variant-row__actions">
                <span class="admin-variant-row__index">Вариант {{ index + 1 }}</span>

                <button
                  type="button"
                  class="admin-button admin-button--ghost admin-button--small"
                  @click="removeVariant(variant.id)"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>

          <p class="admin-field__hint">
            Каждый вариант задаётся отдельно: название, вес или объём и цена.
          </p>
        </div>

        <div class="admin-field admin-field--grow">
          <div class="admin-variants__header">
            <span>Удаляемые ингредиенты</span>

            <button
              type="button"
              class="admin-button admin-button--ghost admin-button--small"
              @click="addIngredient"
            >
              Добавить ингредиент
            </button>
          </div>

          <div class="admin-ingredients">
            <div
              v-for="(ingredient, index) in ingredients"
              :key="ingredient.id"
              class="admin-ingredient-row"
            >
              <label class="admin-field admin-field--grow">
                <span>Ингредиент</span>
                <input
                  :value="ingredient.ingredient_name"
                  class="admin-input"
                  placeholder="Например, Кинза"
                  @input="
                    updateIngredient(
                      ingredient.id,
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                />
              </label>

              <div class="admin-ingredient-row__actions">
                <span class="admin-variant-row__index">Ингредиент {{ index + 1 }}</span>

                <button
                  type="button"
                  class="admin-button admin-button--ghost admin-button--small"
                  @click="removeIngredient(ingredient.id)"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>

          <p class="admin-field__hint">Каждый удаляемый ингредиент задаётся отдельной строкой.</p>
        </div>

        <div class="admin-product-form__actions">
          <button type="button" class="admin-button admin-button--ghost" @click="emit('reset')">
            Очистить
          </button>

          <button type="submit" class="admin-button" :disabled="isSubmittingProduct">
            {{
              isSubmittingProduct
                ? 'Сохраняем...'
                : productMode === 'create'
                  ? 'Создать товар'
                  : 'Сохранить товар'
            }}
          </button>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseSelect from '@/components/BaseSelect'
import { getProductImage } from '@/utils/products'
import type {
  CategoryOption,
  GroupedProduct,
  ProductFormState,
  ProductIngredientDraft,
  ProductMode,
  ProductVariantDraft,
} from '../types'

const props = defineProps<{
  groupedProducts: GroupedProduct[]
  categoryOptions: readonly CategoryOption[]
  productMode: ProductMode
  selectedProductId: string
  productError: string
  productSuccess: string
  productForm: ProductFormState
  variants: ProductVariantDraft[]
  ingredients: ProductIngredientDraft[]
  productImageHint: string
  productImagePreview: string
  productImageInputKey: number
  isSubmittingProduct: boolean
}>()

const emit = defineEmits<{
  selectProduct: [productId: string]
  startCreateProduct: []
  showProductList: []
  'update:variants': [value: ProductVariantDraft[]]
  'update:ingredients': [value: ProductIngredientDraft[]]
  imageChange: [event: Event]
  reset: []
  submit: []
}>()

const showProductList = computed(() => props.productMode === 'edit' && !props.selectedProductId)
const showProductForm = computed(() => props.productMode === 'create' || !!props.selectedProductId)

function formatPrice(value: string) {
  return `${Number(value).toFixed(0)} ₽`
}

function addVariant() {
  emit('update:variants', [...props.variants, createVariantDraft()])
}

function updateVariantField(
  variantId: string,
  field: 'name' | 'weight' | 'price',
  value: string,
) {
  emit(
    'update:variants',
    props.variants.map((variant) =>
      variant.id === variantId ? { ...variant, [field]: value } : variant,
    ),
  )
}

function removeVariant(variantId: string) {
  const nextVariants = props.variants.filter((variant) => variant.id !== variantId)

  if (nextVariants.length) {
    emit('update:variants', nextVariants)
    return
  }

  emit('update:variants', [createVariantDraft()])
}

function addIngredient() {
  emit('update:ingredients', [...props.ingredients, createIngredientDraft()])
}

function updateIngredient(ingredientId: string, value: string) {
  emit(
    'update:ingredients',
    props.ingredients.map((ingredient) =>
      ingredient.id === ingredientId ? { ...ingredient, ingredient_name: value } : ingredient,
    ),
  )
}

function removeIngredient(ingredientId: string) {
  const nextIngredients = props.ingredients.filter((ingredient) => ingredient.id !== ingredientId)

  if (nextIngredients.length) {
    emit('update:ingredients', nextIngredients)
    return
  }

  emit('update:ingredients', [createIngredientDraft()])
}

function createVariantDraft(): ProductVariantDraft {
  return {
    id: `variant-draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    weight: '',
    price: '',
  }
}

function createIngredientDraft(): ProductIngredientDraft {
  return {
    id: `ingredient-draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ingredient_name: '',
  }
}

function handleImageError(event: Event) {
  const image = event.currentTarget

  if (!(image instanceof HTMLImageElement)) return

  image.parentElement?.classList.add('product-image-shell--fallback')
}
</script>
