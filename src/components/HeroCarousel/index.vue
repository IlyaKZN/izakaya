<template>
  <section class="hero-carousel" aria-label="Промо-баннеры">
    <button
      v-if="slides.length > 1"
      type="button"
      class="hero-carousel__nav hero-carousel__nav--prev"
      aria-label="Предыдущий баннер"
      @click="scrollPrev"
    >
      <span class="material-symbols">chevron_left</span>
    </button>

    <div class="hero-carousel__viewport" ref="viewportRef">
      <div class="hero-carousel__container">
        <article
          v-for="slide in slides"
          :key="slide.id"
          class="hero-carousel__slide"
          :style="{ '--hero-bg': slide.background, '--hero-accent': slide.accent }"
        >
          <img
            v-if="slide.image"
            :src="slide.image"
            :alt="slide.title"
            class="hero-carousel__image"
            loading="lazy"
          />

          <div v-else class="hero-carousel__placeholder">
            <div class="hero-carousel__placeholder-side" />

            <div class="hero-carousel__placeholder-main">
              <div class="hero-carousel__qr" />

              <div class="hero-carousel__copy">
                <span class="hero-carousel__eyebrow">Izakaya</span>
                <h2 class="hero-carousel__title">{{ slide.title }}</h2>
                <p class="hero-carousel__description">{{ slide.description }}</p>
              </div>

              <div class="hero-carousel__decor">
                <span class="hero-carousel__coin hero-carousel__coin--lg" />
                <span class="hero-carousel__coin hero-carousel__coin--sm" />
                <span class="hero-carousel__ring" />
                <span class="hero-carousel__card">300</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <button
      v-if="slides.length > 1"
      type="button"
      class="hero-carousel__nav hero-carousel__nav--next"
      aria-label="Следующий баннер"
      @click="scrollNext"
    >
      <span class="material-symbols">chevron_right</span>
    </button>

    <div v-if="slides.length > 1" class="hero-carousel__dots">
      <button
        v-for="(slide, index) in slides"
        :key="`${slide.id}-dot`"
        type="button"
        class="hero-carousel__dot"
        :class="{ 'hero-carousel__dot--active': selectedIndex === index }"
        :aria-label="`Перейти к баннеру ${index + 1}`"
        @click="scrollTo(index)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import useEmblaCarousel from 'embla-carousel-vue'
import type { CarouselImageRead } from '@/types/api'

defineOptions({
  name: 'HeroCarousel',
})

const props = defineProps<{
  images?: CarouselImageRead[]
}>()

type HeroSlide = {
  id: string
  title: string
  description: string
  image: string
  background: string
  accent: string
}

const [viewportRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' })
const selectedIndex = ref(0)
let autoplayId: ReturnType<typeof setInterval> | null = null

const fallbackSlides: HeroSlide[] = [
  {
    id: 'placeholder-1',
    title: 'Получить карту',
    description: 'С бонусами, акциями и приятными предложениями для постоянных гостей.',
    image: '',
    background: 'linear-gradient(135deg, #d1b185 0%, #c5a06f 100%)',
    accent: '#6a4828',
  },
  {
    id: 'placeholder-2',
    title: 'Новые вкусы',
    description: 'Скоро здесь появятся яркие баннеры с акциями и сезонными предложениями.',
    image: '',
    background: 'linear-gradient(135deg, #be8f74 0%, #9f6a59 100%)',
    accent: '#5f2f25',
  },
  {
    id: 'placeholder-3',
    title: 'Доставка быстро',
    description: 'Выбирайте любимые блюда, а промо-баннеры загрузятся сюда автоматически с бэка.',
    image: '',
    background: 'linear-gradient(135deg, #9f876d 0%, #7e624d 100%)',
    accent: '#493528',
  },
]

const slides = computed<HeroSlide[]>(() => {
  const images = props.images?.length
    ? [...props.images].sort((left, right) => left.sort_order - right.sort_order)
    : []

  if (!images.length) {
    return fallbackSlides
  }

  return images.map((image, index) => ({
    id: image.id,
    title: `Баннер ${index + 1}`,
    description: 'Промо-предложение',
    image: image.image_url,
    background: fallbackSlides[index % fallbackSlides.length]!.background,
    accent: fallbackSlides[index % fallbackSlides.length]!.accent,
  }))
})

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

  if (slides.value.length <= 1) return

  autoplayId = setInterval(() => {
    emblaApi.value?.scrollNext()
  }, 5000)
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
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-inline: 8px;
}

.hero-carousel__viewport {
  overflow: hidden;
}

.hero-carousel__container {
  display: flex;
}

.hero-carousel__slide {
  position: relative;
  flex: 0 0 100%;
  min-width: 0;
  min-height: 390px;
  overflow: hidden;
  border-radius: 24px;
  background: var(--hero-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.24);
}

.hero-carousel__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-carousel__placeholder {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  min-height: 390px;
  background:
    radial-gradient(circle at 85% 28%, rgba(255, 255, 255, 0.18), transparent 16%),
    radial-gradient(circle at 78% 78%, rgba(0, 0, 0, 0.08), transparent 18%),
    var(--hero-bg);
}

.hero-carousel__placeholder-side {
  background:
    linear-gradient(180deg, rgba(58, 29, 13, 0.18), rgba(58, 29, 13, 0.1)),
    repeating-linear-gradient(
      12deg,
      rgba(93, 54, 31, 0.72) 0 6px,
      rgba(122, 73, 44, 0.9) 6px 12px
    );
}

.hero-carousel__placeholder-main {
  position: relative;
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) 280px;
  gap: 34px;
  align-items: center;
  padding: 28px 34px;
}

.hero-carousel__placeholder-main::before,
.hero-carousel__placeholder-main::after {
  content: '';
  position: absolute;
  inset: auto auto 20px 24px;
  width: 180px;
  height: 80px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  filter: blur(10px);
  opacity: 0.38;
}

.hero-carousel__placeholder-main::after {
  inset: 24px 220px auto auto;
  width: 220px;
  height: 10px;
  border-radius: 999px;
  background: rgba(52, 28, 15, 0.42);
  filter: none;
  opacity: 0.88;
}

.hero-carousel__qr {
  aspect-ratio: 1;
  border-radius: 16px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.92) 10px, transparent 10px) 0 0 / 20px 20px,
    linear-gradient(rgba(255, 255, 255, 0.92) 10px, transparent 10px) 0 0 / 20px 20px,
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 239, 231, 0.9));
  box-shadow: inset 0 0 0 8px rgba(255, 255, 255, 0.1);
}

.hero-carousel__copy {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #111;
}

.hero-carousel__eyebrow {
  display: inline-flex;
  width: fit-content;
  min-height: 32px;
  padding: 0 14px;
  align-items: center;
  border-radius: 999px;
  color: #fff8f1;
  background: rgba(52, 28, 15, 0.72);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 700;
}

.hero-carousel__title {
  margin: 0;
  font-size: clamp(42px, 4.2vw, 72px);
  line-height: 0.92;
  text-transform: uppercase;
  letter-spacing: -0.05em;
  color: rgba(255, 250, 244, 0.96);
  text-shadow: 0 2px 0 rgba(58, 31, 18, 0.08);
}

.hero-carousel__description {
  max-width: 480px;
  margin: 0;
  font-size: clamp(18px, 1.5vw, 28px);
  line-height: 1.1;
  color: rgba(20, 13, 10, 0.92);
}

.hero-carousel__decor {
  position: relative;
  height: 100%;
  min-height: 260px;
}

.hero-carousel__coin,
.hero-carousel__card,
.hero-carousel__ring {
  position: absolute;
  display: block;
}

.hero-carousel__coin {
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.48), transparent 34%),
    linear-gradient(135deg, rgba(91, 75, 59, 0.95), rgba(149, 130, 105, 0.88));
  border: 2px solid rgba(46, 32, 23, 0.62);
}

.hero-carousel__coin--lg {
  top: 8px;
  left: 28px;
  width: 88px;
  height: 88px;
}

.hero-carousel__coin--sm {
  top: 54px;
  left: 86px;
  width: 54px;
  height: 54px;
}

.hero-carousel__ring {
  top: 22px;
  right: 18px;
  width: 126px;
  height: 126px;
  border-radius: 50%;
  border: 9px solid rgba(95, 75, 56, 0.24);
}

.hero-carousel__card {
  right: 34px;
  top: 92px;
  width: 120px;
  height: 170px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 248, 241, 0.9), rgba(213, 189, 153, 0.9)),
    #ead3af;
  color: var(--hero-accent);
  font-size: 48px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 35px rgba(57, 37, 22, 0.18);
  transform: rotate(12deg);
}

.hero-carousel__nav {
  position: absolute;
  top: 50%;
  z-index: 2;
  width: 46px;
  height: 46px;
  margin-top: -23px;
  border-radius: 14px;
  background: rgba(34, 34, 36, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.hero-carousel__nav--prev {
  left: 18px;
}

.hero-carousel__nav--next {
  right: 18px;
}

.hero-carousel__nav .material-symbols {
  font-size: 30px;
}

.hero-carousel__dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.hero-carousel__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(143, 29, 63, 0.34);
}

.hero-carousel__dot--active {
  width: 22px;
  background: var(--accent-button-bg);
}

@media (max-width: 1180px) {
  .hero-carousel__slide,
  .hero-carousel__placeholder {
    min-height: 340px;
  }

  .hero-carousel__placeholder-main {
    grid-template-columns: 100px minmax(0, 1fr) 220px;
    gap: 20px;
    padding: 24px;
  }

  .hero-carousel__description {
    max-width: 380px;
  }
}

@media (max-width: 900px) {
  .hero-carousel__nav {
    display: none;
  }

  .hero-carousel__slide,
  .hero-carousel__placeholder {
    min-height: 300px;
  }

  .hero-carousel__placeholder {
    grid-template-columns: 1fr;
  }

  .hero-carousel__placeholder-side {
    display: none;
  }

  .hero-carousel__placeholder-main {
    grid-template-columns: 88px minmax(0, 1fr);
    padding: 20px;
  }

  .hero-carousel__decor {
    display: none;
  }
}

@media (max-width: 640px) {
  .hero-carousel__slide,
  .hero-carousel__placeholder {
    min-height: 240px;
    border-radius: 20px;
  }

  .hero-carousel__placeholder-main {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .hero-carousel__qr {
    width: 84px;
  }

  .hero-carousel__title {
    font-size: 32px;
  }

  .hero-carousel__description {
    font-size: 15px;
    line-height: 1.3;
  }
}
</style>
