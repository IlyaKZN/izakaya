<template>
  <div class="categories-list">
    <button
      v-for="category in categories"
      :key="category"
      type="button"
      class="categories-list__item"
      :class="{ 'categories-list__item--active': selectedCategory === category }"
      @click="handleCategoryClick(category)"
    >
      {{ category }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { getCategoryAnchor } from '@/utils/categoryAnchors'

defineOptions({
  name: 'CategoriesList',
})

const catalogStore = useCatalogStore()
const router = useRouter()
const { categories, selectedCategory } = storeToRefs(catalogStore)

onMounted(() => {
  void catalogStore.loadCatalog().catch(() => undefined)
})

function handleCategoryClick(category: string) {
  selectedCategory.value = category

  router.push({
    name: 'main',
    hash: `#${getCategoryAnchor(category)}`,
  })
}
</script>

<style lang="scss">
.categories-list {
  width: 100%;
  display: flex;
  gap: 10px;
  flex-direction: column;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
}

.categories-list__item {
  min-height: 42px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-radius: 14px;
  text-align: left;
  color: var(--text-primary);
  background: transparent;
  border: 1px solid transparent;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.08);
    color: #fff;
  }
}

.categories-list__item--active {
  background: var(--accent-soft);
  border-color: var(--accent-soft-border);
  color: #fff;
}

@media (max-width: 900px) {
  .categories-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .categories-list {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 8px;
    padding: 0;
    scrollbar-width: none;
  }

  .categories-list::-webkit-scrollbar {
    display: none;
  }

  .categories-list__item {
    flex: 0 0 auto;
    min-height: 38px;
    padding: 0 12px;
    white-space: nowrap;
  }
}
</style>
