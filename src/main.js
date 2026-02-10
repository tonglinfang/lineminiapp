import { createApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
import router from './router'
import { useLiff } from './composables/useLiff'
import { useUserStore } from './stores/user'
import { useScheduleStore } from './stores/schedule'
import { useCategoryStore } from './stores/category'
import { useNotification } from './composables/useNotification'

// Import global styles
import './assets/styles/global.css'
// Vant styles are auto-imported via unplugin-vue-components

/**
 * Initialize the application
 * 1. Initialize LIFF SDK
 * 2. Fetch user profile
 * 3. Load user data
 * 4. Mount Vue app
 */
async function initializeApp() {
  // Create Vue app instance
  const app = createApp(App)

  // Register Pinia store
  app.use(pinia)

  // Register Vue Router
  app.use(router)

  // Expose router for notification click navigation
  window.__APP_CONTEXT__ = {
    router
  }

  // Mount app immediately (LIFF will initialize in background)
  app.mount('#app')

  // Initialize LIFF
  const { initLiff, userProfile, isLoggedIn } = useLiff()

  try {
    await initLiff()

    // If user is logged in, set user profile in store and load data
    if (isLoggedIn.value && userProfile.value) {
      const userStore = useUserStore()
      userStore.setUser(userProfile.value)
      userStore.saveLastUser()

      // Load user data (schedules and categories)
      const scheduleStore = useScheduleStore()
      const categoryStore = useCategoryStore()
      const notification = useNotification()

      await Promise.all([
        scheduleStore.loadSchedules(),
        categoryStore.loadCategories()
      ])

      // Reschedule all upcoming notifications
      if (notification.isGranted()) {
        notification.rescheduleAll(scheduleStore.schedules)
      }

      console.log('✅ App initialized successfully')
      console.log(`📊 Loaded ${scheduleStore.schedules.length} schedules`)
    }
  } catch (error) {
    console.error('❌ App initialization failed:', error)
    // App will still work in mock mode or show error UI
  }

  // Request notification permission if not already granted
  const notification = useNotification()
  if (notification.isSupported && notification.permission === 'default') {
    setTimeout(async () => {
      const result = await notification.requestPermission()
      if (result === 'granted') {
        console.log('✅ Notification permission granted')
        // Reschedule notifications after permission granted
        const scheduleStore = useScheduleStore()
        if (scheduleStore.schedules.length > 0) {
          notification.rescheduleAll(scheduleStore.schedules)
        }
      }
    }, 3000) // Wait 3 seconds before requesting permission
  }
}

// Start the app
initializeApp()
