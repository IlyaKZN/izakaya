import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as usersApi from '@/api/users'
import { useAuthStore } from '@/stores/auth'
import type { OrderRead, UserRead } from '@/types/api'

export const useUsersStore = defineStore('users', () => {
  const authStore = useAuthStore()
  const profile = ref<UserRead | null>(null)
  const myOrders = ref<OrderRead[]>([])

  async function fetchProfile() {
    const response = await usersApi.getProfile()
    profile.value = response
    authStore.setRole(response.role ?? null)

    return response
  }

  async function fetchMyOrders() {
    const response = await usersApi.getMyUserOrders()
    myOrders.value = response

    return response
  }

  function clearProfile() {
    profile.value = null
    myOrders.value = []
  }

  return {
    profile,
    myOrders,
    fetchProfile,
    fetchMyOrders,
    clearProfile,
  }
})
