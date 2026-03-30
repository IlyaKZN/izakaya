<template>
  <div class="main-screen">
    <template v-if="sections.length">
      <CategoryPreviewList
        v-for="section in sections"
        :key="section.title"
        class="main-screen__category-preview-list"
        :title="section.title"
        :menu-list="section.items"
      />
    </template>

    <div v-else class="main-screen__empty">
      <span class="material-symbols">search_off</span>
      <span>По вашему запросу ничего не найдено</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import CategoryPreviewList from '@/components/CategoryPreviewList'
import { ALL_CATEGORY, menuCategories } from '@/mocks'
import { useCatalogStore } from '@/stores/catalog'

defineOptions({
  name: 'MainScreen',
})

const catalogStore = useCatalogStore()
const { filteredMenuList, selectedCategory } = storeToRefs(catalogStore)

const sections = computed(() => {
  if (selectedCategory.value !== ALL_CATEGORY) {
    return [
      {
        title: selectedCategory.value,
        items: filteredMenuList.value,
      },
    ].filter((section) => section.items.length > 0)
  }

  return menuCategories
    .map((category) => ({
      title: category,
      items: filteredMenuList.value.filter((item) => item.category === category),
    }))
    .filter((section) => section.items.length > 0)
})
</script>

<style lang="scss">
.main-screen {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-screen__category-preview-list {
  margin-bottom: 0;
}

.main-screen__empty {
  min-height: 220px;
  border-radius: var(--radius-lg);
  border: 1px dashed var(--surface-border);
  background: var(--surface-1);
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;

  span:first-child {
    font-size: 30px;
  }
}
</style>
