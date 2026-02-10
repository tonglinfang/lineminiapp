<template>
  <div class="schedule-list-view">
    <van-nav-bar title="スケジュール一覧">
      <template #right>
        <van-icon name="plus" size="20" @click="handleCreate" />
      </template>
    </van-nav-bar>

    <div v-if="scheduleStore.filterDate" class="active-filters">
      <van-tag type="primary" plain>
        {{ formatDate(scheduleStore.filterDate) }} のスケジュール
      </van-tag>
      <van-button size="small" plain @click="clearDateFilter">
        クリア
      </van-button>
    </div>

    <schedule-list
      :loading="scheduleStore.loading"
      @schedule-click="handleScheduleClick"
      @schedule-edit="handleScheduleEdit"
      @create="handleCreate"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useScheduleStore } from '@/stores/schedule'
import ScheduleList from '@/components/schedule/ScheduleList.vue'
import { formatDate } from '@/utils/date'

// Router
const router = useRouter()
const route = useRoute()

// Store
const scheduleStore = useScheduleStore()

/**
 * Handle schedule click
 */
function handleScheduleClick(schedule) {
  console.log('Schedule clicked:', schedule)
  if (schedule?.id) {
    router.push(`/schedule/${schedule.id}`)
  }
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

function clearDateFilter() {
  scheduleStore.setFilterDate(null)
  const query = { ...route.query }
  delete query.date
  router.replace({ query })
}

onMounted(() => {
  const { date, category, q } = route.query

  scheduleStore.setFilterDate(date ? String(date) : null)

  scheduleStore.setFilterCategory(category ? String(category) : null)

  scheduleStore.setSearchQuery(q ? String(q) : '')
})
</script>

<style scoped>
.schedule-list-view {
  min-height: 100vh;
  background: var(--bg-page);
}

.active-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}
</style>
