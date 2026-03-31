import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useCategoriesStore } from '@/stores/categories'
import { useProductsStore } from '@/stores/products'
import type { ProductRead } from '@/types/api'
import { getProductCategoryLabel } from '@/utils/products'

export const ALL_CATEGORY = 'Все'

function matchesQuery(product: ProductRead, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) return true

  const searchableValues = [
    product.name,
    product.description ?? '',
    getProductCategoryLabel(product),
    ...product.removable_ingredients.map((ingredient) => ingredient.ingredient_name),
    ...product.variants.map((variant) => variant.name),
  ]

  return searchableValues.some((value) => value.toLowerCase().includes(normalizedQuery))
}

export const useCatalogStore = defineStore('catalog', () => {
  const categoriesStore = useCategoriesStore()
  const productsStore = useProductsStore()

  const selectedCategory = ref<string>(ALL_CATEGORY)
  const searchQuery = ref('')
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const errorMessage = ref('')

  const categories = computed(() => {
    return categoriesStore.categories
      .filter((category) => category.is_active !== false)
      .map((category) => category.name)
  })

  const filteredMenuList = computed(() => {
    return productsStore.products.filter((product) => {
      return matchesQuery(product, searchQuery.value)
    })
  })

  async function loadCatalog(force = false) {
    if (isLoading.value || (isLoaded.value && !force)) return productsStore.products

    isLoading.value = true
    errorMessage.value = ''

    try {
      const [response] = await Promise.all([
        productsStore.fetchProducts(),
        categoriesStore.fetchCategories(),
      ])
      isLoaded.value = true

      return response
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Не удалось загрузить меню'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    selectedCategory,
    searchQuery,
    categories,
    filteredMenuList,
    isLoading,
    isLoaded,
    errorMessage,
    loadCatalog,
  }
})
