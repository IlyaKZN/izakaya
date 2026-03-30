import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as usersApi from '@/api/users'
import type { OrderRead, UserRead } from '@/types/api'

export const useUsersStore = defineStore('users', () => {
  const profile = ref<UserRead | null>(null)
  const myOrders = ref<OrderRead[]>([])

  async function fetchProfile() {
    const response = await usersApi.getProfile()
    profile.value = response

    return response
  }

  async function fetchMyOrders() {
    const response = await usersApi.getMyUserOrders()
    myOrders.value = response

    return response
  }

  return {
    profile,
    myOrders,
    fetchProfile,
    fetchMyOrders,
  }
})
