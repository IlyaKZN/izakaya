<template>
  <div class="category-preview-list">
    <span class="category-preview-list__title">
      {{ title }}
    </span>

    <button
    @click="goToPrev"
    class="embla__prev category-preview-list__go-to-button category-preview-list__go-to-button--left">
      <span class="material-symbols category-preview-list__go-to-button-icon">
        keyboard_arrow_left
      </span>
    </button>

    <div class="embla">
      <div class="embla__viewport" ref="emblaRef">
        <div class="embla__container">
          <div
          v-for="item in menuList" :key="item.id"
          class="embla__slide">
            <MenuItemCard :menu-item="item" />
          </div>
        </div>
      </div>
    </div>

    <button
    @click="goToNext"
    class="embla__prev category-preview-list__go-to-button category-preview-list__go-to-button--right">
      <span class="material-symbols category-preview-list__go-to-button-icon">
        keyboard_arrow_left
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { type TMenuItem } from '@/mocks'
import MenuItemCard from '../MenuItemCard'
import useEmblaCarousel from 'embla-carousel-vue'

defineOptions({
  name: 'CategoryPreviewList',
})

const { menuList, title } = defineProps<{
  title: string
  menuList: TMenuItem[]
}>()

const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: true })

const goToPrev = () => emblaApi.value?.scrollPrev();
const goToNext = () => emblaApi.value?.scrollNext();
</script>

<style lang="scss">
.category-preview-list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 100%;
  width: 100%;
  padding: 0 14px;
  position: relative;
}

.category-preview-list__title {
  font-size: 30px;
  color: white;
  margin-bottom: 12px;
}

.test {
  height: max-content;
}

.embla {
  --slide-size: 224px;
  --slide-spacing: 10px;
}

.embla__slide {
  color: white;
  flex: 0 0 224px;
  padding-left: var(--slide-spacing);
  user-select: none;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none;    /* Firefox */
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
  height: 40px;
  width: 40px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(102, 6, 6);
  border: none;
}

.category-preview-list__go-to-button-icon {
  font-size: 30px;
  color: white;
}

.category-preview-list__go-to-button--left {
  top: 50%;
  left: 0;
  z-index: 2;
}

.category-preview-list__go-to-button--right {
  top: 50%;
  right: 0;
  z-index: 2;
  transform: rotate(180deg);
}
</style>
