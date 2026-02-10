<template>
  <div class="home-view">
    <!-- Month calendar view -->
    <month-view
      :loading="scheduleStore.loading"
      @date-click="handleDateClick"
      @toggle-view="handleToggleView"
    />

    <!-- Today's schedules section -->
    <div v-if="todaySchedules.length > 0" class="today-section">
      <h3 class="section-title">今天的日程</h3>
      <div class="schedule-list">
        <div
          v-for="schedule in todaySchedules"
          :key="schedule.id"
          class="schedule-card"
          :style="{ borderLeftColor: getCategoryColor(schedule.category) }"
          @click="handleScheduleClick(schedule)"
        >
          <div class="schedule-time">
            {{ schedule.isAllDay ? '全天' : schedule.startTime }}
          </div>
          <div class="schedule-content">
            <div class="schedule-title">{{ schedule.title }}</div>
            <div v-if="schedule.description" class="schedule-description">
              {{ schedule.description }}
            </div>
          </div>
          <van-tag :color="getCategoryColor(schedule.category)" plain>
            {{ getCategoryName(schedule.category) }}
          </van-tag>
        </div>
      </div>
    </div>

    <!-- Empty state for today -->
    <empty-state
      v-else
      icon="calendar-o"
      title="今天沒有日程"
      description="點擊日曆上的日期來創建新日程"
      action-text="創建日程"
      @action="handleCreateSchedule"
    />

    <!-- Floating action button -->
    <van-floating-bubble
      icon="plus"
      :style="{ bottom: '80px' }"
      @click="handleCreateSchedule"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import { useCategoryStore } from '@/stores/category'
import MonthView from '@/components/calendar/MonthView.vue'
import EmptyState from '@/components/common/EmptyState.vue'

// Stores
const scheduleStore = useScheduleStore()
const categoryStore = useCategoryStore()

// Computed
const todaySchedules = computed(() => scheduleStore.todaySchedules)

/**
 * Get category color
 */
function getCategoryColor(categoryId) {
  const category = categoryStore.getCategoryById(categoryId)
  return category ? category.color : '#B0B0B0'
}

/**
 * Get category name
 */
function getCategoryName(categoryId) {
  const category = categoryStore.getCategoryById(categoryId)
  return category ? category.name : '其他'
}

/**
 * Handle date click
 */
function handleDateClick(dateObj) {
  console.log('Date clicked:', dateObj)
  // TODO: Navigate to schedule list for this date or show popup
}

/**
 * Handle schedule click
 */
function handleScheduleClick(schedule) {
  console.log('Schedule clicked:', schedule)
  // TODO: Navigate to schedule detail page
}

/**
 * Handle toggle view
 */
function handleToggleView() {
  console.log('Toggle view')
  // TODO: Switch between month/week views
}

/**
 * Handle create schedule
 */
function handleCreateSchedule() {
  console.log('Create schedule')
  // TODO: Navigate to create schedule page
}

onMounted(() => {
  // Data is already loaded in main.js
  console.log('Home view mounted')
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: var(--spacing-xl);
}

/* Today's schedules section */
.today-section {
  padding: var(--spacing-lg) var(--spacing-md);
}

.section-title {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.schedule-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-left: 4px solid var(--primary-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.schedule-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.schedule-time {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  min-width: 50px;
}

.schedule-content {
  flex: 1;
}

.schedule-title {
  font-size: var(--font-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: 4px;
}

.schedule-description {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
