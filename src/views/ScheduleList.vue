<template>
  <div class="schedule-list-view">
    <van-nav-bar title="スケジュール一覧">
      <template #right>
        <van-icon name="plus" size="20" @click="handleCreate" />
      </template>
    </van-nav-bar>

    <schedule-list
      :loading="scheduleStore.loading"
      @schedule-click="handleScheduleClick"
      @schedule-edit="handleScheduleEdit"
      @create="handleCreate"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useScheduleStore } from '@/stores/schedule'
import ScheduleList from '@/components/schedule/ScheduleList.vue'

// Router
const router = useRouter()

// Store
const scheduleStore = useScheduleStore()

/**
 * Handle schedule click
 */
function handleScheduleClick(schedule) {
  console.log('Schedule clicked:', schedule)
  // TODO: Navigate to schedule detail page
  // router.push(`/schedule/${schedule.id}`)
}

/**
 * Handle schedule edit
 */
function handleScheduleEdit(schedule) {
  router.push(`/schedule/${schedule.id}/edit`)
}

/**
 * Handle create schedule
 */
function handleCreate() {
  router.push('/schedule/create')
}
</script>

<style scoped>
.schedule-list-view {
  min-height: 100vh;
  background: var(--bg-page);
}
</style>
