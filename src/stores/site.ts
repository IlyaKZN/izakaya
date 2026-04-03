import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as siteApi from '@/api/site'
import type { CarouselImageRead, HealthResponse, SiteStatusResponse } from '@/types/api'

export const useSiteStore = defineStore('site', () => {
  const siteStatus = ref<SiteStatusResponse | null>(null)
  const health = ref<HealthResponse | null>(null)
  const carouselImages = ref<CarouselImageRead[]>([])

  async function fetchSiteStatus() {
    const response = await siteApi.getSiteStatus()
    siteStatus.value = response

    return response
  }

  async function fetchHealth() {
    const response = await siteApi.getHealth()
    health.value = response

    return response
  }

  async function fetchCarouselImages() {
    const response = await siteApi.getCarouselImages()
    carouselImages.value = response.filter((image) => image.is_active)

    return carouselImages.value
  }

  return {
    siteStatus,
    health,
    carouselImages,
    fetchSiteStatus,
    fetchHealth,
    fetchCarouselImages,
  }
})
