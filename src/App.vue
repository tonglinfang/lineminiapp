<template>
  <div id="app" class="app-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-screen">
      <div class="spinner"></div>
      <p>正在初始化...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-screen">
      <van-icon name="warning-o" size="48" color="#EE0A24" />
      <h2>初始化失敗</h2>
      <p>{{ error }}</p>
      <van-button type="primary" @click="retryInit">重試</van-button>
    </div>

    <!-- Main App Content -->
    <div v-else class="app-content">
      <!-- Router View with transitions -->
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>

      <!-- Bottom Tabbar -->
      <van-tabbar
        v-if="showTabbar"
        v-model="activeTab"
        route
        active-color="var(--primary-color)"
        class="app-tabbar"
      >
        <van-tabbar-item to="/" icon="calendar-o">
          日曆
        </van-tabbar-item>
        <van-tabbar-item to="/schedules" icon="orders-o">
          列表
        </van-tabbar-item>
        <van-tabbar-item to="/settings" icon="setting-o">
          設置
        </van-tabbar-item>
      </van-tabbar>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLiff } from './composables/useLiff'
import { useUserStore } from './stores/user'

// Router
const route = useRoute()

// LIFF composable
const {
  isLiffReady,
  isLoggedIn,
  userProfile,
  error: liffError,
  isInClient,
  initLiff
} = useLiff()

// User store
const userStore = useUserStore()

// Local state
const isLoading = ref(true)
const error = ref(null)
const activeTab = ref(0)
const transitionName = ref('fade')

// Computed
const displayError = computed(() => {
  return error.value || liffError.value
})

const showTabbar = computed(() => {
  return route.meta.showTabbar !== false
})

/**
 * Initialize app on mount
 */
onMounted(async () => {
  try {
    // Wait a bit to show loading screen
    await new Promise(resolve => setTimeout(resolve, 1000))

    isLoading.value = false
  } catch (err) {
    error.value = err.message
    isLoading.value = false
  }
})

/**
 * Retry initialization
 */
async function retryInit() {
  error.value = null
  isLoading.value = true

  try {
    await initLiff()
    isLoading.value = false
  } catch (err) {
    error.value = err.message
    isLoading.value = false
  }
}

/**
 * Watch route changes for transitions
 */
watch(() => route.path, (to, from) => {
  // Determine transition direction
  const toDepth = to.split('/').length
  const fromDepth = from.split('/').length

  if (toDepth > fromDepth) {
    transitionName.value = 'slide-left'
  } else if (toDepth < fromDepth) {
    transitionName.value = 'slide-right'
  } else {
    transitionName.value = 'fade'
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: var(--bg-page);
}

/* Loading Screen */
.loading-screen,
.error-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  text-align: center;
}

.loading-screen p {
  margin-top: var(--spacing-md);
  color: var(--text-secondary);
}

.error-screen h2 {
  margin-top: var(--spacing-md);
  color: var(--danger-color);
}

.error-screen p {
  margin: var(--spacing-md) 0;
  color: var(--text-secondary);
}

/* Main Content */
.app-content {
  padding: var(--spacing-lg);
  max-width: 750px;
  margin: 0 auto;
}

/* User Info */
.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--line-green) 0%, var(--line-green-dark) 100%);
  color: white;
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-details {
  flex: 1;
}

.user-details h2 {
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-xs);
}

.user-id {
  font-size: var(--font-sm);
  opacity: 0.8;
  margin-bottom: var(--spacing-xs);
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-round);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
}

/* Stats Card */
.stats-card {
  margin-bottom: var(--spacing-lg);
}

.stats-card h3 {
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.stats-card ul {
  list-style: none;
}

.stats-card li {
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-secondary);
}

.stats-card li:last-child {
  border-bottom: none;
}

/* Tabbar */
.app-tabbar {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
