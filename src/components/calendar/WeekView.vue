<template>
  <div class="week-view">
    <!-- Calendar header -->
    <calendar-header
      :title="headerDisplay"
      :is-today="isToday"
      @prev="goPrev"
      @next="goNext"
      @today="goToday"
      @toggle-view="toggleView"
    />

    <!-- Week grid -->
    <div class="week-grid">
      <div
        v-for="dateObj in weekGrid"
        :key="dateObj.date"
        class="week-day"
        :class="getDayClasses(dateObj)"
        @click="handleDateClick(dateObj)"
      >
        <!-- Day header -->
        <div class="day-header">
          <span class="weekday">{{ dateObj.weekdayShort }}</span>
          <span class="day-number">{{ dateObj.day }}</span>
        </div>

        <!-- Schedule list for this day -->
        <div class="day-schedules">
          <div
            v-for="schedule in getSchedulesForDate(dateObj.date)"
            :key="schedule.id"
            class="schedule-item"
            :style="{ borderLeftColor: getCategoryColor(schedule.category) }"
            @click.stop="handleScheduleClick(schedule)"
          >
            <div class="schedule-time">
              {{ schedule.isAllDay ? '終日' : schedule.startTime }}
            </div>
            <div class="schedule-title">{{ schedule.title }}</div>
          </div>

          <!-- Empty state -->
          <div v-if="getSchedulesForDate(dateObj.date).length === 0" class="day-empty">
            <van-icon name="calendar-o" size="24" color="var(--text-light)" />
            <span>予定なし</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCalendar } from '@/composables/useCalendar'
import { useScheduleStore } from '@/stores/schedule'
import { useCategoryStore } from '@/stores/category'
import CalendarHeader from './CalendarHeader.vue'

// Composables
const calendar = useCalendar()
const scheduleStore = useScheduleStore()
const categoryStore = useCategoryStore()

// Emits
const emit = defineEmits(['date-click', 'schedule-click', 'toggle-view'])

// Destructure calendar composable
const {
  weekGrid,
  headerDisplay,
  isToday,
  goPrev,
  goNext,
  goToday,
  selectDate,
  isSelected,
  getSchedulesForDate
} = calendar

/**
 * Get CSS classes for a day cell
 */
function getDayClasses(dateObj) {
  return {
    'is-today': dateObj.isToday,
    'is-selected': isSelected(dateObj.date),
    'is-weekend': dateObj.isWeekend,
    'is-past': dateObj.isPast
  }
}

/**
 * Get category color
 */
function getCategoryColor(categoryId) {
  const category = categoryStore.getCategoryById(categoryId)
  return category ? category.color : '#B0B0B0'
}

/**
 * Handle date click
 */
function handleDateClick(dateObj) {
  selectDate(dateObj.date)
  emit('date-click', dateObj)
}

/**
 * Handle schedule item click
 */
function handleScheduleClick(schedule) {
  emit('schedule-click', schedule)
}

/**
 * Toggle view
 */
function toggleView() {
  emit('toggle-view')
}
</script>

<style scoped>
.week-view {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

/* Week grid */
.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border-color);
}

.week-day {
  background: var(--bg-card);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.week-day:hover {
  background: var(--bg-hover);
}

/* Day header */
.day-header {
  padding: var(--spacing-sm);
  text-align: center;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-page);
}

.weekday {
  display: block;
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.day-number {
  display: block;
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

/* Day states */
.week-day.is-today .day-header {
  background: var(--primary-color);
}

.week-day.is-today .weekday,
.week-day.is-today .day-number {
  color: white;
}

.week-day.is-selected {
  box-shadow: inset 0 0 0 2px var(--primary-color);
}

.week-day.is-weekend .day-number {
  color: var(--danger-color);
}

.week-day.is-past {
  opacity: 0.6;
}

/* Day schedules */
.day-schedules {
  flex: 1;
  padding: var(--spacing-xs);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.schedule-item {
  padding: var(--spacing-xs);
  background: var(--bg-page);
  border-left: 3px solid var(--primary-color);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.schedule-item:hover {
  background: var(--bg-hover);
  transform: translateX(2px);
}

.schedule-time {
  color: var(--text-secondary);
  margin-bottom: 2px;
  font-size: 10px;
}

.schedule-title {
  color: var(--text-primary);
  font-weight: var(--font-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Empty state */
.day-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  font-size: var(--font-xs);
  gap: var(--spacing-xs);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .week-grid {
    grid-template-columns: 1fr;
  }

  .week-day {
    min-height: 80px;
  }

  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .weekday {
    display: inline;
    margin-bottom: 0;
    margin-right: var(--spacing-sm);
  }

  .day-number {
    display: inline;
  }
}
</style>
