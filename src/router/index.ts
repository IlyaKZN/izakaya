import { createRouter, createWebHistory } from 'vue-router'

const MainScreen = () => import('@/screens/Main');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'main',
      path: '/',
      component: MainScreen,
    }
  ],
})

export default router
