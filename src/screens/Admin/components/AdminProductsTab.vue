<template>
  <section class="admin-card">
    <div class="admin-card__header admin-card__header--row">
      <div>
        <p class="admin-card__eyebrow">Товары</p>
        <h2 class="admin-card__title">Создание и редактирование</h2>
      </div>

      <label class="admin-field">
        <span>Режим</span>
        <BaseSelect
          v-model="productModeModel"
          :options="productModeOptions"
          @change="emit('modeChange')"
        />
      </label>
    </div>

    <div v-if="productMode === 'edit'" class="admin-toolbar">
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
                <img
                  class="admin-product-card__image"
                  :src="getProductImage(product, { thumbnail: true })"
                  :alt="product.name"
                  loading="lazy"
                />

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

    <div v-if="productError" class="admin-notice admin-notice--error">{{ productError }}</div>
    <div v-if="productSuccess" class="admin-notice admin-notice--success">{{ productSuccess }}</div>

    <form class="admin-product-form" @submit.prevent="emit('submit')">
      <div class="admin-product-form__body">
        <div class="admin-product-form__grid">
          <label class="admin-field admin-field--grow">
            <span>Название</span>
            <input v-model.trim="productForm.name" class="admin-input" required />
          </label>

          <label class="admin-field admin-field--grow">
            <span>ID категории</span>
            <input v-model.trim="productForm.category_id" class="admin-input" required />
          </label>

          <label class="admin-field admin-field--grow">
            <span>Цена</span>
            <input
              v-model.trim="productForm.price"
              class="admin-input"
              placeholder="Например, 500"
            />
          </label>

          <label class="admin-field admin-field--grow">
            <span>Файл изображения</span>
            <input
              :key="productImageInputKey"
              class="admin-input admin-input--file"
              type="file"
              accept="image/*"
              @change="emit('imageChange', $event)"
            />
          </label>
        </div>

        <p v-if="productImageHint" class="admin-field__hint">{{ productImageHint }}</p>

        <div v-if="productImagePreview" class="admin-product-image-preview">
          <img :src="productImagePreview" alt="Предпросмотр изображения товара" />
        </div>

        <label class="admin-field admin-field--grow">
          <span>Описание</span>
          <textarea v-model.trim="productForm.description" class="admin-textarea" rows="3" />
        </label>

        <label class="admin-checkbox">
          <input v-model="productForm.is_active" type="checkbox" />
          <span>Товар активен</span>
        </label>

        <label class="admin-field admin-field--grow">
          <span>Варианты</span>
          <textarea
            v-model.trim="variantsTextModel"
            class="admin-textarea admin-textarea--details"
            rows="4"
            placeholder="Формат строки: Название|Вес в граммах|Цена"
          />
        </label>

        <label class="admin-field admin-field--grow">
          <span>Удаляемые ингредиенты</span>
          <textarea
            v-model.trim="ingredientsTextModel"
            class="admin-textarea admin-textarea--details"
            rows="4"
            placeholder="Каждый ингредиент с новой строки"
          />
        </label>

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
  GroupedProduct,
  ProductFormState,
  ProductMode,
  ProductModeOption,
} from '../types'

const props = defineProps<{
  groupedProducts: GroupedProduct[]
  productMode: ProductMode
  productModeOptions: readonly ProductModeOption[]
  selectedProductId: string
  productError: string
  productSuccess: string
  productForm: ProductFormState
  variantsText: string
  ingredientsText: string
  productImageHint: string
  productImagePreview: string
  productImageInputKey: number
  isSubmittingProduct: boolean
}>()

const emit = defineEmits<{
  'update:productMode': [value: ProductMode]
  modeChange: []
  selectProduct: [productId: string]
  'update:variantsText': [value: string]
  'update:ingredientsText': [value: string]
  imageChange: [event: Event]
  reset: []
  submit: []
}>()

const productModeModel = computed({
  get: () => props.productMode,
  set: (value: ProductMode) => emit('update:productMode', value),
})

const variantsTextModel = computed({
  get: () => props.variantsText,
  set: (value: string) => emit('update:variantsText', value),
})

const ingredientsTextModel = computed({
  get: () => props.ingredientsText,
  set: (value: string) => emit('update:ingredientsText', value),
})

function formatPrice(value: string) {
  return `${Number(value).toFixed(0)} ₽`
}
</script>
