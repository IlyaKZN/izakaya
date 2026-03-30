<template>
  <section class="category-preview-list">
    <span class="category-preview-list__title">
      {{ title }}
    </span>

    <button
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

const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: true })

const goToPrev = () => emblaApi.value?.scrollPrev()
const goToNext = () => emblaApi.value?.scrollNext()
</script>

<style lang="scss">
.category-preview-list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  padding: 18px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-border);
  background: var(--surface-1);
  position: relative;
}

.category-preview-list__title {
  font-size: 26px;
  color: var(--text-primary);
  margin-bottom: 14px;
  font-weight: 600;
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
  background: rgba(18, 24, 21, 0.92);
  border: 1px solid var(--surface-border);
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

  .category-preview-list__go-to-button {
    display: none;
  }
}
</style>
