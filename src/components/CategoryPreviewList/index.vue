<template>
  <section class="category-preview-list">
    <div class="category-preview-list__header">
      <button type="button" class="category-preview-list__title" @click="goToCategory">
        {{ title }}
      </button>

      <button type="button" class="category-preview-list__link" @click="goToCategory">
        Смотреть все
      </button>
    </div>

    <button
      v-if="hasOverflow"
      @click="goToPrev"
      class="category-preview-list__go-to-button category-preview-list__go-to-button--left"
      type="button"
      aria-label="Прокрутить влево"
    >
      <span class="material-symbols category-preview-list__go-to-button-icon">
        keyboard_arrow_left
      </span>
    </button>

    <div class="embla">
      <div class="embla__viewport" ref="emblaRef">
        <div class="embla__container">
          <div v-for="item in menuList" :key="item.id" class="embla__slide">
            <MenuItemCard :menu-item="item" />
          </div>
        </div>
      </div>
    </div>

    <button
      v-if="hasOverflow"
      @click="goToNext"
      class="category-preview-list__go-to-button category-preview-list__go-to-button--right"
      type="button"
      aria-label="Прокрутить вправо"
    >
      <span class="material-symbols category-preview-list__go-to-button-icon">
        keyboard_arrow_left
      </span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MenuItemCard from '../MenuItemCard'
import useEmblaCarousel from 'embla-carousel-vue'
import type { ProductRead } from '@/types/api'

defineOptions({
  name: 'CategoryPreviewList',
})

const { menuList, title } = defineProps<{
  title: string
  menuList: ProductRead[]
}>()

const router = useRouter()
const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: true })
const hasOverflow = ref(false)

const goToPrev = () => emblaApi.value?.scrollPrev()
const goToNext = () => emblaApi.value?.scrollNext()

function goToCategory() {
  router.push({
    name: 'category',
    params: {
      category: title,
    },
  })
}

function syncOverflowState() {
  hasOverflow.value = Boolean(emblaApi.value?.canScrollPrev() || emblaApi.value?.canScrollNext())
}

watch(emblaApi, (api, previousApi) => {
  previousApi?.off('reInit', syncOverflowState)
  previousApi?.off('select', syncOverflowState)

  if (!api) {
    hasOverflow.value = false
    return
  }

  api.on('reInit', syncOverflowState)
  api.on('select', syncOverflowState)
  syncOverflowState()
})

onBeforeUnmount(() => {
  emblaApi.value?.off('reInit', syncOverflowState)
  emblaApi.value?.off('select', syncOverflowState)
})
</script>

<style lang="scss">
.category-preview-list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  padding: 18px 16px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
  position: relative;
}

.category-preview-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.category-preview-list__title {
  font-size: 26px;
  color: var(--text-primary);
  font-weight: 600;
  text-align: left;
}

.category-preview-list__link {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  white-space: nowrap;
}

.embla {
  --slide-spacing: 10px;
}

.embla__slide {
  flex: 0 0 224px;
  padding-left: var(--slide-spacing);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}

.embla__viewport {
  overflow: hidden;
}

.embla__container {
  display: flex;
  touch-action: pan-y pinch-zoom;
  margin-left: calc(var(--slide-spacing) * -1);
}

.category-preview-list__go-to-button {
  position: absolute;
  top: 50%;
  margin-top: 22px;
  height: 42px;
  width: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(18, 24, 21, 0.84);
  transition:
    transform 0.15s ease,
    background-color 0.15s ease;
}

.category-preview-list__go-to-button:hover {
  background: rgba(24, 32, 28, 0.95);
  transform: translateY(-1px);
}

.category-preview-list__go-to-button-icon {
  font-size: 30px;
  color: white;
}

.category-preview-list__go-to-button--left {
  left: 8px;
  z-index: 2;
}

.category-preview-list__go-to-button--right {
  right: 8px;
  z-index: 2;
  transform: rotate(180deg);
}

.category-preview-list__go-to-button--right:hover {
  transform: rotate(180deg) translateY(1px);
}

@media (max-width: 900px) {
  .category-preview-list {
    padding: 14px 12px;
  }

  .category-preview-list__title {
    font-size: 22px;
  }

  .category-preview-list__header {
    margin-bottom: 12px;
  }

  .category-preview-list__go-to-button {
    display: none;
  }
}

@media (max-width: 640px) {
  .category-preview-list__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
