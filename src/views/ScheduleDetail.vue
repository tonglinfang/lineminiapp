<template>
  <div class="schedule-detail-view">
    <van-nav-bar
      title="スケジュール詳細"
      left-arrow
      @click-left="handleBack"
    >
      <template #right>
        <div class="nav-actions">
          <van-icon name="edit" size="20" @click="handleEdit" />
          <van-icon name="delete-o" size="20" @click="handleDelete" />
        </div>
      </template>
    </van-nav-bar>

    <div v-if="schedule" class="detail-content">
      <div class="detail-header">
        <div class="category-badge" :style="{ backgroundColor: categoryColor }">
          <van-icon :name="categoryIcon" size="16" color="white" />
        </div>
        <div class="detail-title">
          <h2>{{ schedule.title }}</h2>
          <p class="detail-category">{{ categoryName }}</p>
        </div>
        <div class="color-dot" :style="{ backgroundColor: scheduleColor }"></div>
      </div>

      <div class="detail-card">
        <div class="detail-row">
          <van-icon name="clock-o" />
          <div class="detail-text">
            <div>{{ dateRangeDisplay }}</div>
            <div v-if="!schedule.isAllDay" class="detail-subtext">
              {{ timeRangeDisplay }}
            </div>
            <div v-else class="detail-subtext">終日</div>
          </div>
        </div>

        <div v-if="schedule.description" class="detail-row">
          <van-icon name="notes-o" />
          <div class="detail-text">{{ schedule.description }}</div>
        </div>

        <div v-if="schedule.tags && schedule.tags.length > 0" class="detail-row">
          <van-icon name="label-o" />
          <div class="detail-text">
            <van-tag
              v-for="(tag, index) in schedule.tags"
              :key="index"
              type="primary"
              plain
            >
              {{ tag }}
            </van-tag>
          </div>
        </div>

        <div class="detail-row">
          <van-icon name="bell-o" />
          <div class="detail-text">
            <span v-if="schedule.reminder?.enabled">
              {{ reminderDisplay }}
            </span>
            <span v-else>リマインダーなし</span>
          </div>
        </div>

        <div class="detail-row">
          <van-icon name="checked" />
          <div class="detail-text">
            <van-switch
              v-model="isCompleted"
              size="20"
              @change="handleToggleComplete"
            />
            <span class="detail-subtext">
              {{ isCompleted ? '完了' : '未完了' }}
            </span>
          </div>
        </div>
      </div>
    </div>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useScheduleStore } from '@/stores/schedule'
import { useCategoryStore } from '@/stores/category'
import { formatDate, formatTime } from '@/utils/date'
import { REMINDER_OPTIONS } from '@/utils/constants'
import { showConfirmDialog, showToast } from 'vant'

// Router
const router = useRouter()
const route = useRoute()

// Stores
const scheduleStore = useScheduleStore()
const categoryStore = useCategoryStore()

// State
const loading = ref(true)
const schedule = ref(null)
const isCompleted = ref(false)

const categoryColor = computed(() => {
  if (!schedule.value) return '#B0B0B0'
  const category = categoryStore.getCategoryById(schedule.value.category)
  return category ? category.color : '#B0B0B0'
})

const categoryIcon = computed(() => {
  if (!schedule.value) return 'ellipsis'
  const category = categoryStore.getCategoryById(schedule.value.category)
  return category ? category.icon : 'ellipsis'
})

const categoryName = computed(() => {
  if (!schedule.value) return 'その他'
  const category = categoryStore.getCategoryById(schedule.value.category)
  return category ? category.name : 'その他'
})

const scheduleColor = computed(() => {
  if (!schedule.value) return categoryColor.value
  return schedule.value.color || categoryColor.value
})

const dateRangeDisplay = computed(() => {
  if (!schedule.value) return ''
  const start = formatDate(schedule.value.startDate)
  const end = schedule.value.endDate ? formatDate(schedule.value.endDate) : start
  return start === end ? start : `${start} - ${end}`
})

const timeRangeDisplay = computed(() => {
  if (!schedule.value) return ''
  const start = schedule.value.startTime ? formatTime(schedule.value.startTime) : ''
  const end = schedule.value.endTime ? formatTime(schedule.value.endTime) : ''
  if (!start && !end) return ''
  if (!end) return start
  return `${start} - ${end}`
})

const reminderDisplay = computed(() => {
  if (!schedule.value?.reminder) return 'リマインダーなし'
  if (!schedule.value.reminder.enabled) return 'リマインダーなし'

  const option = REMINDER_OPTIONS.find(
    (item) => item.value === schedule.value.reminder.time && item.unit === schedule.value.reminder.unit
  )
  return option ? option.label : `${schedule.value.reminder.time}${schedule.value.reminder.unit}前`
})

function loadSchedule() {
  const scheduleId = route.params.id
  schedule.value = scheduleStore.schedules.find(s => s.id === scheduleId) || null
  isCompleted.value = schedule.value ? !!schedule.value.isCompleted : false
  loading.value = false
}

async function handleDelete() {
  if (!schedule.value) return
  const confirmed = await showConfirmDialog({
    title: '削除の確認',
    message: `「${schedule.value.title}」を削除してもよろしいですか？`
  }).catch(() => false)

  if (confirmed) {
    const success = await scheduleStore.deleteSchedule(schedule.value.id)
    if (success) {
      showToast('削除しました')
      router.push('/schedules')
    } else {
      showToast('削除できませんでした')
    }
  }
}

function handleEdit() {
  if (!schedule.value) return
  router.push(`/schedule/${schedule.value.id}/edit`)
}

function handleBack() {
  router.back()
}

async function handleToggleComplete() {
  if (!schedule.value) return
  await scheduleStore.toggleComplete(schedule.value.id)
  isCompleted.value = !!scheduleStore.schedules.find(s => s.id === schedule.value.id)?.isCompleted
}

onMounted(() => {
  loadSchedule()
})
</script>

<style scoped>
.schedule-detail-view {
  min-height: 100vh;
  background: var(--bg-page);
}

.nav-actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.detail-content {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.detail-header {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.category-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-left: auto;
  border: 2px solid var(--bg-card);
  box-shadow: var(--shadow-sm);
}

.detail-title h2 {
  margin: 0;
  font-size: var(--font-xl);
  color: var(--text-primary);
}

.detail-category {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.detail-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.detail-row {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
  color: var(--text-primary);
}

.detail-text {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.detail-subtext {
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.loading-state {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
