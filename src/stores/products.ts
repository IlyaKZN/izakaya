import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as productsApi from '@/api/products'
import type { ProductRead, Uuid } from '@/types/api'

export const useProductsStore = defineStore('products', () => {
  const products = ref<ProductRead[]>([])
  const searchResults = ref<ProductRead[]>([])
  const productsById = ref<Record<string, ProductRead>>({})
  const similarProductsById = ref<Record<string, ProductRead[]>>({})
  const lastCategoryId = ref<Uuid | null>(null)

  const hasProducts = computed(() => products.value.length > 0)

  function upsertProduct(product: ProductRead) {
    productsById.value[product.id] = product
  }

  function upsertProductList(productList: ProductRead[]) {
    productList.forEach(upsertProduct)
  }

  async function fetchProducts(categoryId?: Uuid | null) {
    const response = await productsApi.listProducts(categoryId)
    products.value = response
    lastCategoryId.value = categoryId ?? null
    upsertProductList(response)

    return response
  }

  async function fetchSearchResults(query: string) {
    const response = await productsApi.searchProducts(query)
    searchResults.value = response
    upsertProductList(response)

    return response
  }

  async function fetchProduct(productId: Uuid) {
    const response = await productsApi.getProduct(productId)
    upsertProduct(response)

    return response
  }

  async function fetchSimilarProducts(productId: Uuid) {
    const response = await productsApi.getSimilarProducts(productId)
    similarProductsById.value[productId] = response
    upsertProductList(response)

    return response
  }

  return {
    products,
    searchResults,
    productsById,
    similarProductsById,
    lastCategoryId,
    hasProducts,
    fetchProducts,
    fetchSearchResults,
    fetchProduct,
    fetchSimilarProducts,
  }
})
