<template>
  <div class="categories-list">
    <span class="categories-list__title">Категории</span>

    <button
      v-for="category in categories"
      :key="category"
      type="button"
      class="categories-list__item"
      :class="{ 'categories-list__item--active': selectedCategory === category }"
      @click="selectedCategory = category"
    >
      {{ category }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCatalogStore } from '@/stores/catalog'

defineOptions({
  name: 'CategoriesList',
})

const catalogStore = useCatalogStore()
const { categories, selectedCategory } = storeToRefs(catalogStore)

onMounted(() => {
  void catalogStore.loadCatalog().catch(() => undefined)
})
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

.categories-list__title {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  font-weight: 600;
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

  .categories-list__title {
    grid-column: 1 / -1;
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

  .categories-list__title {
    flex: 0 0 auto;
    width: 100%;
    margin-bottom: 2px;
  }

  .categories-list__item {
    flex: 0 0 auto;
    min-height: 38px;
    padding: 0 12px;
    white-space: nowrap;
  }
}
</style>
