<template>
  <section class="hero-carousel" aria-label="Рекомендуемые блюда">
    <button
      v-if="slides.length > 1"
      type="button"
      class="hero-carousel__nav hero-carousel__nav--prev"
      aria-label="Предыдущий слайд"
      @click="scrollPrev"
    >
      <span class="material-symbols">chevron_left</span>
    </button>

    <div class="hero-carousel__main">
      <div class="hero-carousel__viewport" ref="viewportRef">
        <div class="hero-carousel__container">
          <article
            v-for="slide in slides"
            :key="slide.id"
            class="hero-carousel__slide"
            :style="{ '--hero-slide-accent': slide.accent }"
            @click="goToItem(slide.id)"
          >
            <div class="hero-carousel__media" :class="{ 'hero-carousel__media--fallback': !slide.image }">
              <img
                v-if="slide.image"
                :src="slide.image"
                :alt="slide.title"
                class="hero-carousel__image"
                loading="lazy"
              />
            </div>

            <div class="hero-carousel__overlay">
              <span class="hero-carousel__eyebrow">{{ slide.eyebrow }}</span>
              <div class="hero-carousel__content">
                <div>
                  <h2 class="hero-carousel__title">{{ slide.title }}</h2>
                  <p class="hero-carousel__description">{{ slide.description }}</p>
                </div>

                <div class="hero-carousel__badge">
                  <span>{{ slide.category }}</span>
                  <strong>{{ slide.price }}</strong>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div v-if="slides.length > 1" class="hero-carousel__dots">
        <button
          v-for="(slide, index) in slides"
          :key="slide.id"
          type="button"
          class="hero-carousel__dot"
          :class="{ 'hero-carousel__dot--active': selectedIndex === index }"
          :aria-label="`Перейти к слайду ${index + 1}`"
          @click="scrollTo(index)"
        />
      </div>
    </div>

    <div v-if="slides.length > 1" class="hero-carousel__thumbs">
      <button
        v-for="(slide, index) in slides"
        :key="`${slide.id}-thumb`"
        type="button"
        class="hero-carousel__thumb"
        :class="{ 'hero-carousel__thumb--active': selectedIndex === index }"
        @click="scrollTo(index)"
      >
        <div class="hero-carousel__thumb-media" :class="{ 'hero-carousel__thumb-media--fallback': !slide.image }">
          <img v-if="slide.image" :src="slide.image" :alt="slide.title" class="hero-carousel__thumb-image" loading="lazy" />
        </div>
      </button>
    </div>

    <button
      v-if="slides.length > 1"
      type="button"
      class="hero-carousel__nav hero-carousel__nav--next"
      aria-label="Следующий слайд"
      @click="scrollNext"
    >
      <span class="material-symbols">chevron_right</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import useEmblaCarousel from 'embla-carousel-vue'
import type { ProductRead } from '@/types/api'
import { getProductCategoryLabel, getProductImage, getProductPrice } from '@/utils/products'

defineOptions({
  name: 'HeroCarousel',
})

const props = defineProps<{
  products: ProductRead[]
}>()

const router = useRouter()
const [viewportRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' })
const selectedIndex = ref(0)
let autoplayId: ReturnType<typeof setInterval> | null = null

const palette = ['#8d3149', '#7a4b1f', '#5d3547', '#2f4f66', '#745a24']

const slides = computed(() =>
  props.products
    .filter((product) => getProductImage(product))
    .slice(0, 5)
    .map((product, index) => ({
      id: product.id,
      title: product.name,
      description: product.description || 'Добавьте блюдо в заказ и откройте для себя вкус меню.',
      category: getProductCategoryLabel(product),
      image: getProductImage(product),
      price: `${getProductPrice(product)} ₽`,
      eyebrow: 'Рекомендуем',
      accent: palette[index % palette.length]!,
    })),
)

function syncSelectedIndex() {
  selectedIndex.value = emblaApi.value?.selectedScrollSnap() ?? 0
}

function stopAutoplay() {
  if (!autoplayId) return

  clearInterval(autoplayId)
  autoplayId = null
}

function startAutoplay() {
  stopAutoplay()

  if ((slides.value.length ?? 0) <= 1) return

  autoplayId = setInterval(() => {
    emblaApi.value?.scrollNext()
  }, 4500)
}

function scrollPrev() {
  emblaApi.value?.scrollPrev()
  startAutoplay()
}

function scrollNext() {
  emblaApi.value?.scrollNext()
  startAutoplay()
}

function scrollTo(index: number) {
  emblaApi.value?.scrollTo(index)
  startAutoplay()
}

function goToItem(id: string) {
  router.push({
    name: 'menu-item',
    params: { id },
  })
}

watch(emblaApi, (api, previousApi) => {
  previousApi?.off('select', syncSelectedIndex)
  previousApi?.off('reInit', syncSelectedIndex)

  if (!api) return

  api.on('select', syncSelectedIndex)
  api.on('reInit', syncSelectedIndex)
  syncSelectedIndex()
  startAutoplay()
})

watch(
  slides,
  () => {
    selectedIndex.value = 0
    startAutoplay()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  stopAutoplay()
  emblaApi.value?.off('select', syncSelectedIndex)
  emblaApi.value?.off('reInit', syncSelectedIndex)
})
</script>

<style lang="scss">
.hero-carousel {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 96px 48px;
  gap: 12px;
  align-items: center;
}

.hero-carousel__main {
  min-width: 0;
}

.hero-carousel__viewport {
  overflow: hidden;
}

.hero-carousel__container {
  display: flex;
}

.hero-carousel__slide {
  --slide-shadow: radial-gradient(circle at top left, color-mix(in srgb, var(--hero-slide-accent) 36%, transparent), transparent 46%);
  position: relative;
  flex: 0 0 100%;
  min-width: 0;
  min-height: 340px;
  border-radius: 28px;
  overflow: hidden;
  cursor: pointer;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.01)),
    var(--slide-shadow),
    rgba(17, 17, 19, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hero-carousel__media,
.hero-carousel__image {
  width: 100%;
  height: 100%;
}

.hero-carousel__media {
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--hero-slide-accent) 24%, transparent), transparent 30%),
    linear-gradient(120deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.44));
}

.hero-carousel__media--fallback {
  background:
    linear-gradient(120deg, color-mix(in srgb, var(--hero-slide-accent) 78%, #111), #141417),
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.12), transparent 26%);
}

.hero-carousel__image {
  object-fit: cover;
  object-position: center;
  filter: saturate(1.02) contrast(1.02);
}

.hero-carousel__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  background:
    linear-gradient(90deg, rgba(12, 12, 14, 0.78), rgba(12, 12, 14, 0.2) 55%, rgba(12, 12, 14, 0.55)),
    linear-gradient(0deg, rgba(12, 12, 14, 0.3), transparent 45%);
}

.hero-carousel__eyebrow {
  width: fit-content;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: color-mix(in srgb, var(--hero-slide-accent) 88%, #fff 12%);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-carousel__content {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.hero-carousel__title {
  max-width: 540px;
  margin: 0 0 10px;
  font-size: clamp(34px, 4vw, 58px);
  line-height: 0.95;
  letter-spacing: -0.04em;
}

.hero-carousel__description {
  max-width: 460px;
  margin: 0;
  color: rgba(245, 239, 241, 0.82);
  font-size: 16px;
  line-height: 1.45;
}

.hero-carousel__badge {
  min-width: 180px;
  padding: 16px 18px;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(15, 15, 16, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
}

.hero-carousel__badge span {
  color: rgba(245, 239, 241, 0.7);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-carousel__badge strong {
  font-size: 24px;
  line-height: 1;
}

.hero-carousel__nav {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hero-carousel__nav .material-symbols {
  font-size: 30px;
}

.hero-carousel__thumbs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hero-carousel__thumb {
  width: 96px;
  height: 104px;
  padding: 0;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid transparent;
  background: transparent;
  opacity: 0.55;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease,
    border-color 0.15s ease;
}

.hero-carousel__thumb--active {
  opacity: 1;
  transform: translateX(-2px);
  border-color: rgba(255, 255, 255, 0.18);
}

.hero-carousel__thumb-media,
.hero-carousel__thumb-image {
  width: 100%;
  height: 100%;
}

.hero-carousel__thumb-media {
  background:
    linear-gradient(140deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
    rgba(18, 18, 20, 0.96);
}

.hero-carousel__thumb-media--fallback {
  background:
    linear-gradient(145deg, rgba(141, 49, 73, 0.45), rgba(18, 18, 20, 0.96)),
    rgba(18, 18, 20, 0.96);
}

.hero-carousel__thumb-image {
  object-fit: cover;
}

.hero-carousel__dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.hero-carousel__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.26);
}

.hero-carousel__dot--active {
  width: 26px;
  background: var(--accent-button-bg);
}

@media (max-width: 1180px) {
  .hero-carousel {
    grid-template-columns: 44px minmax(0, 1fr) 44px;
  }

  .hero-carousel__thumbs {
    display: none;
  }
}

@media (max-width: 900px) {
  .hero-carousel__slide {
    min-height: 300px;
  }

  .hero-carousel__overlay {
    padding: 18px;
  }

  .hero-carousel__content {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-carousel__badge {
    min-width: 0;
  }
}

@media (max-width: 640px) {
  .hero-carousel {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .hero-carousel__nav {
    display: none;
  }

  .hero-carousel__slide {
    min-height: 260px;
    border-radius: 22px;
  }

  .hero-carousel__title {
    font-size: 30px;
  }

  .hero-carousel__description {
    font-size: 14px;
  }

  .hero-carousel__badge {
    padding: 14px 16px;
  }
}
</style>
