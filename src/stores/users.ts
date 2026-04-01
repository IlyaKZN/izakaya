import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as usersApi from '@/api/users'
import { useAuthStore } from '@/stores/auth'
import type { AuthRole, UserRead, UserUpdate } from '@/types/api'

function toAuthRole(role?: string | null): AuthRole | null {
  return role === 'user' || role === 'admin' ? role : null
}

export const useUsersStore = defineStore('users', () => {
  const authStore = useAuthStore()
  const profile = ref<UserRead | null>(null)

  async function fetchProfile() {
    const response = await usersApi.getProfile()
    profile.value = response
    authStore.setRole(toAuthRole(response.role))

    return response
  }

  async function updateProfile(payload: UserUpdate) {
    const response = await usersApi.updateProfile(payload)
    profile.value = response
    authStore.setRole(toAuthRole(response.role))

    return response
  }

  function clearProfile() {
    profile.value = null
  }

  return {
    profile,
    fetchProfile,
    updateProfile,
    clearProfile,
  }
})
