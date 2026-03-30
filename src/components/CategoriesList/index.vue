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
  padding: 16px;
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  border: 1px solid var(--surface-border);
  box-shadow: var(--shadow-card);
}

.categories-list__title {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.categories-list__item {
  height: 38px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 10px;
  text-align: left;
  color: var(--text-primary);
  background: transparent;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: var(--surface-2);
    color: #fff;
  }
}

.categories-list__item--active {
  background: rgba(127, 46, 67, 0.3);
  border: 1px solid rgba(127, 46, 67, 0.5);
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
</style>
