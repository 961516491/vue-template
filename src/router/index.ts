import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw
} from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login.vue')
  },
  {
    path: '/',
    name: 'Index',
    component: () => import('@/views/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
