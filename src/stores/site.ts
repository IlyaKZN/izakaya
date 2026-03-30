import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as siteApi from '@/api/site'
import type { HealthResponse, SiteStatusResponse } from '@/types/api'

export const useSiteStore = defineStore('site', () => {
  const siteStatus = ref<SiteStatusResponse | null>(null)
  const health = ref<HealthResponse | null>(null)

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

  return {
    siteStatus,
    health,
    fetchSiteStatus,
    fetchHealth,
  }
})
