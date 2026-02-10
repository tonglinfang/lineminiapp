<template>
  <div class="schedule-edit-view">
    <van-nav-bar
      title="スケジュールを編集"
      left-arrow
      @click-left="handleBack"
    >
      <template #right>
        <van-icon
          name="delete-o"
          size="20"
          @click="handleDelete"
        />
      </template>
    </van-nav-bar>

    <schedule-editor
      v-if="schedule"
      :initial-data="schedule"
      :is-edit="true"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleBack"
    />

    <van-empty
      v-else-if="!loading"
      description="スケジュールが見つかりません"
    >
      <van-button type="primary" @click="handleBack">戻る</van-button>
    </van-empty>

    <van-loading
      v-if="loading"
      class="loading-state"
      type="spinner"
      color="var(--primary-color)"
    >
      読み込み中...
    </van-loading>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useScheduleStore } from '@/stores/schedule'
import { showToast, showConfirmDialog } from 'vant'
import ScheduleEditor from '@/components/schedule/ScheduleEditor.vue'

// Router
const router = useRouter()
const route = useRoute()

// Store
const scheduleStore = useScheduleStore()

// State
const loading = ref(true)
const schedule = ref(null)

/**
 * Load schedule data
 */
function loadSchedule() {
  const scheduleId = route.params.id
  schedule.value = scheduleStore.schedules.find(s => s.id === scheduleId)

  if (schedule.value) {
    console.log('Schedule loaded:', schedule.value)
  } else {
    console.error('Schedule not found:', scheduleId)
  }

  loading.value = false
}

/**
 * Handle form submit
 */
async function handleSubmit(formData) {
  loading.value = true

  try {
    await scheduleStore.updateSchedule(schedule.value.id, formData)
    showToast('更新しました')
    router.back()
  } catch (error) {
    showToast(error.message || '更新できませんでした')
  } finally {
    loading.value = false
  }
}

/**
 * Handle delete
 */
async function handleDelete() {
  const confirmed = await showConfirmDialog({
    title: '削除の確認',
    message: `「${schedule.value.title}」を削除してもよろしいですか？`
  }).catch(() => false)

  if (confirmed) {
    const success = await scheduleStore.deleteSchedule(schedule.value.id)
    if (success) {
      showToast('削除しました')
      router.push('/')
    } else {
      showToast('削除できませんでした')
    }
  }
}

/**
 * Handle back navigation
 */
function handleBack() {
  router.back()
}

onMounted(() => {
  loadSchedule()
})
</script>

<style scoped>
.schedule-edit-view {
  min-height: 100vh;
  background: var(--bg-page);
}

.loading-state {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
