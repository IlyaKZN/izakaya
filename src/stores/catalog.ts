import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ALL_CATEGORY, menuCategories, menuList } from '@/mocks'

export const useCatalogStore = defineStore('catalog', () => {
  const selectedCategory = ref<string>(ALL_CATEGORY)
  const searchQuery = ref('')

  const categories = computed(() => [ALL_CATEGORY, ...menuCategories])

  const filteredMenuList = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return menuList.filter((item) => {
      const byCategory =
        selectedCategory.value === ALL_CATEGORY || item.category === selectedCategory.value

      if (!byCategory) return false

      if (!query) return true

      return (
        item.name.toLowerCase().includes(query) ||
        item.ingredients.some((ingredient) => ingredient.toLowerCase().includes(query))
      )
    })
  })

  return {
    selectedCategory,
    searchQuery,
    categories,
    filteredMenuList,
  }
})
