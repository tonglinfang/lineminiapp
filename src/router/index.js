/**
 * Vue Router Configuration
 * Defines all application routes and navigation
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// Route components (lazy-loaded for code splitting)
const Home = () => import('@/views/Home.vue')
const ScheduleList = () => import('@/views/ScheduleList.vue')
const ScheduleCreate = () => import('@/views/ScheduleCreate.vue')
const ScheduleDetail = () => import('@/views/ScheduleDetail.vue')
const ScheduleEdit = () => import('@/views/ScheduleEdit.vue')
const Settings = () => import('@/views/Settings.vue')

/**
 * Route definitions
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'カレンダー',
      requiresAuth: true,
      showTabbar: true
    }
  },
  {
    path: '/schedules',
    name: 'ScheduleList',
    component: ScheduleList,
    meta: {
      title: 'スケジュール一覧',
      requiresAuth: true,
      showTabbar: true
    }
  },
  {
    path: '/schedule/create',
    name: 'ScheduleCreate',
    component: ScheduleCreate,
    meta: {
      title: 'スケジュールを作成',
      requiresAuth: true,
      showTabbar: false
    }
  },
  {
    path: '/schedule/:id',
    name: 'ScheduleDetail',
    component: ScheduleDetail,
    meta: {
      title: 'スケジュール詳細',
      requiresAuth: true,
      showTabbar: false
    }
  },
  {
    path: '/schedule/:id/edit',
    name: 'ScheduleEdit',
    component: ScheduleEdit,
    meta: {
      title: 'スケジュールを編集',
      requiresAuth: true,
      showTabbar: false
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '設定',
      requiresAuth: true,
      showTabbar: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

/**
 * Create router instance
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Restore scroll position on back/forward
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

/**
 * Navigation guards
 */
router.beforeEach((to, from, next) => {
  // Check authentication
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()

    if (!userStore.isLoggedIn) {
      console.warn('User not logged in, but LIFF should handle this')
      // In LIFF environment, this should already be handled by main.js
      // Still allow navigation to show loading state
    }
  }

  // Update document title
  if (to.meta.title) {
    document.title = `${to.meta.title} - スケジュール管理`
  }

  next()
})

export default router
