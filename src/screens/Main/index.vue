<template>
  <div class="main-screen">
    <div v-if="isLoading" class="main-screen__empty">
      <span class="material-symbols">progress_activity</span>
      <span>Загружаем меню</span>
    </div>

    <div v-else-if="errorMessage" class="main-screen__empty">
      <span class="material-symbols">wifi_off</span>
      <span>{{ errorMessage }}</span>
    </div>

    <template v-else-if="sections.length">
      <HeroCarousel
        v-if="heroProducts.length"
        class="main-screen__hero-carousel"
        :products="heroProducts"
      />

      <CategoryPreviewList
        v-for="section in sections"
        :key="section.title"
        :id="getCategoryAnchor(section.title)"
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
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import CategoryPreviewList from '@/components/CategoryPreviewList'
import HeroCarousel from '@/components/HeroCarousel'
import { useCatalogStore } from '@/stores/catalog'
import { getCategoryAnchor } from '@/utils/categoryAnchors'
import { getProductImage } from '@/utils/products'
import { getProductCategoryLabel } from '@/utils/products'

defineOptions({
  name: 'MainScreen',
})

const catalogStore = useCatalogStore()
const { filteredMenuList, categories, isLoading, errorMessage } = storeToRefs(catalogStore)

onMounted(() => {
  void catalogStore.loadCatalog().catch(() => undefined)
})

const sections = computed(() => {
  return categories.value
    .map((category) => ({
      title: category,
      items: filteredMenuList.value.filter((item) => getProductCategoryLabel(item) === category),
    }))
    .filter((section) => section.items.length > 0)
})

const heroProducts = computed(() => {
  const seenImages = new Set<string>()

  return filteredMenuList.value.filter((product) => {
    const image = getProductImage(product)

    if (!image || seenImages.has(image)) return false

    seenImages.add(image)
    return true
  })
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
  scroll-margin-top: calc(var(--app-header-height) + 16px);
}

.main-screen__hero-carousel {
  scroll-margin-top: calc(var(--app-header-height) + 16px);
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
