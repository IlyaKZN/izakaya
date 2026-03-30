import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const MainScreen = () => import('@/screens/Main')
const MenuItemScreen = () => import('@/screens/MenuItem')
const ProfileScreen = () => import('@/screens/Profile')
const AdminScreen = () => import('@/screens/Admin')
const AdminOrderScreen = () => import('@/screens/AdminOrder')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.path !== from.path) {
      return {
        top: 0,
        behavior: 'smooth',
      }
    }

    return {
      top: 0,
    }
  },
  routes: [
    {
      name: 'main',
      path: '/',
      component: MainScreen,
      meta: {
        transition: 'page-slide',
      },
    },
    {
      name: 'menu-item',
      path: '/product/:id',
      component: MenuItemScreen,
      meta: {
        transition: 'page-slide',
      },
    },
    {
      name: 'profile',
      path: '/profile',
      component: ProfileScreen,
      meta: {
        requiresAuth: true,
        transition: 'page-slide',
      },
    },
    {
      name: 'admin',
      path: '/admin',
      component: AdminScreen,
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
        wideLayout: true,
        transition: 'page-slide',
      },
    },
    {
      name: 'admin-order',
      path: '/admin/orders/:id',
      component: AdminOrderScreen,
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
        wideLayout: true,
        transition: 'page-slide',
      },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated || authStore.role !== 'admin') {
      return {
        name: 'main',
      }
    }

    return true
  }

  if (!to.meta.requiresAuth) {
    return true
  }

  if (authStore.isAuthenticated) {
    return true
  }

  return {
    name: 'main',
  }
})

export default router
