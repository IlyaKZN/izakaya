import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as categoriesApi from '@/api/categories'
import type { CategoryRead } from '@/types/api'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<CategoryRead[]>([])
  const categoriesById = computed(() =>
    Object.fromEntries(categories.value.map((category) => [category.id, category])),
  )

  async function fetchCategories() {
    const response = await categoriesApi.listCategories()
    categories.value = response

    return response
  }

  return {
    categories,
    categoriesById,
    fetchCategories,
  }
})
