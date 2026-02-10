<template>
  <div class="schedule-create-view">
    <van-nav-bar
      title="創建日程"
      left-arrow
      @click-left="handleBack"
    />

    <schedule-editor
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleBack"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useScheduleStore } from '@/stores/schedule'
import { showToast } from 'vant'
import ScheduleEditor from '@/components/schedule/ScheduleEditor.vue'

// Router
const router = useRouter()

// Store
const scheduleStore = useScheduleStore()

// State
const loading = ref(false)

/**
 * Handle form submit
 */
async function handleSubmit(formData) {
  loading.value = true

  try {
    await scheduleStore.createSchedule(formData)
    showToast('創建成功')

    // Navigate back
    router.back()
  } catch (error) {
    showToast(error.message || '創建失敗')
  } finally {
    loading.value = false
  }
}

/**
 * Handle back navigation
 */
function handleBack() {
  router.back()
}
</script>

<style scoped>
.schedule-create-view {
  min-height: 100vh;
  background: var(--bg-page);
}
</style>
