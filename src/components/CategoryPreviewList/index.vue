<template>
  <section class="category-preview-list">
    <div class="category-preview-list__header">
      <button type="button" class="category-preview-list__title" @click="goToCategory">
        <span>{{ title }}</span>
        <span class="material-symbols category-preview-list__title-arrow">arrow_forward_ios</span>
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
  padding: 0;
  border-radius: 0;
  background: transparent;
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 26px;
  color: var(--text-primary);
  font-weight: 600;
  text-align: left;
  transition:
    color 0.1s ease,
    transform 0.1s ease;
}

.category-preview-list__title:hover {
  color: #fff;
}

.category-preview-list__title:hover .category-preview-list__title-arrow {
  transform: translateX(2px);
}

.category-preview-list__title-arrow {
  font-size: 22px;
  color: var(--text-secondary);
  transition:
    transform 0.1s ease,
    color 0.1s ease;
}

.category-preview-list__title:hover .category-preview-list__title-arrow {
  color: #fff;
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
  padding-top: 4px;
}

.category-preview-list__go-to-button {
  position: absolute;
  top: 50%;
  margin-top: 22px;
  height: 48px;
  width: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-button-bg);
  transition:
    transform 0.1s ease,
    background-color 0.1s ease;
}

.category-preview-list__go-to-button:hover {
  filter: brightness(1.08);
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
    padding: 0;
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
