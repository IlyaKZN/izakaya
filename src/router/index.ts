import { createRouter, createWebHistory } from 'vue-router'

const MainScreen = () => import('@/screens/Main')
const MenuItemScreen = () => import('@/screens/MenuItem')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'main',
      path: '/',
      component: MainScreen,
    },
    {
      name: 'menu-item',
      path: '/product/:id',
      component: MenuItemScreen,
    },
  ],
})

export default router
