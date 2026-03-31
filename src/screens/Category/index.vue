<template>
  <div class="category-screen">
    <div v-if="isLoading" class="category-screen__state">
      <span class="material-symbols">progress_activity</span>
      <span>Загружаем категорию</span>
    </div>

    <div v-else-if="errorMessage" class="category-screen__state">
      <span class="material-symbols">wifi_off</span>
      <span>{{ errorMessage }}</span>
    </div>

    <div v-else class="category-screen__content">
      <section class="category-screen__hero">
        <button type="button" class="category-screen__back" @click="goToMain">
          <span class="material-symbols">arrow_back</span>
          <span>На главную</span>
        </button>

        <div class="category-screen__hero-copy">
          <div class="category-screen__hero-main">
            <h1 class="category-screen__title">{{ categoryName }}</h1>
            <p class="category-screen__subtitle">
              {{ filteredCategoryItems.length }} {{ productsCountLabel }}
            </p>
          </div>
        </div>
      </section>

      <div v-if="!filteredCategoryItems.length" class="category-screen__state">
        <span class="material-symbols">search_off</span>
        <span>В этой категории по текущему запросу ничего не найдено.</span>
      </div>

      <section v-else class="category-screen__grid">
        <MenuItemCard
          v-for="item in filteredCategoryItems"
          :key="item.id"
          :menu-item="item"
          class="category-screen__card"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import MenuItemCard from '@/components/MenuItemCard'
import { ALL_CATEGORY, useCatalogStore } from '@/stores/catalog'
import { getProductCategoryLabel } from '@/utils/products'

defineOptions({
  name: 'CategoryScreen',
})

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()
const { filteredMenuList, selectedCategory, isLoading, errorMessage } = storeToRefs(catalogStore)

const categoryName = computed(() => decodeURIComponent(String(route.params.category)))
const filteredCategoryItems = computed(() =>
  filteredMenuList.value.filter((item) => getProductCategoryLabel(item) === categoryName.value),
)

const productsCountLabel = computed(() => {
  const count = filteredCategoryItems.value.length

  if (count % 10 === 1 && count % 100 !== 11) return 'блюдо'
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'блюда'

  return 'блюд'
})

async function syncCategoryPage() {
  await catalogStore.loadCatalog().catch(() => undefined)
  selectedCategory.value = categoryName.value || ALL_CATEGORY
}

function goToMain() {
  selectedCategory.value = categoryName.value
  router.push({ name: 'main' })
}

onMounted(() => {
  void syncCategoryPage()
})

watch(categoryName, () => {
  void syncCategoryPage()
})

watch(selectedCategory, (nextCategory) => {
  if (nextCategory === categoryName.value) return

  if (nextCategory === ALL_CATEGORY) {
    router.push({ name: 'main' })
    return
  }

  router.push({
    name: 'category',
    params: {
      category: nextCategory,
    },
  })
})
</script>

<style lang="scss">
.category-screen {
  width: 100%;
}

.category-screen__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-screen__state {
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background: var(--surface-1);
}

.category-screen__hero {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.category-screen__hero-copy {
  min-width: 0;
  flex: 1;
}

.category-screen__hero-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.category-screen__back {
  width: fit-content;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.category-screen__title {
  margin: 0;
  font-size: 30px;
}

.category-screen__subtitle {
  margin: 0;
  color: var(--text-secondary);
  white-space: nowrap;
}

.category-screen__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(224px, 1fr));
  gap: 16px;
}

.category-screen__card {
  width: 100%;
  min-width: 0;
}

.category-screen__state {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-secondary);
  text-align: center;
  padding: 24px;
}

@media (max-width: 640px) {
  .category-screen__hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
  }

  .category-screen__hero-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .category-screen__title {
    font-size: 24px;
  }

  .category-screen__grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .category-screen__back {
    width: 100%;
    justify-content: center;
  }
}
</style>
