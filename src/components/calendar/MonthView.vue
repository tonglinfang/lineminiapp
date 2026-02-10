<template>
  <div class="month-view">
    <!-- Calendar header -->
    <calendar-header
      :title="headerDisplay"
      :is-today="isToday"
      @prev="goPrev"
      @next="goNext"
      @today="goToday"
      @toggle-view="toggleView"
    />

    <!-- Weekday header -->
    <div class="weekday-header">
      <div
        v-for="(weekday, index) in weekdays"
        :key="index"
        class="weekday-cell"
        :class="{ 'is-weekend': index === 0 || index === 6 }"
      >
        {{ weekday }}
      </div>
    </div>

    <!-- Date grid (6 weeks × 7 days = 42 cells) -->
    <div class="date-grid">
      <date-cell
        v-for="dateObj in monthGrid"
        :key="dateObj.date"
        :date-obj="dateObj"
        :schedule-count="getScheduleCount(dateObj.date)"
        :category-colors="getCategoryColors(dateObj.date)"
        :is-selected="isSelected(dateObj.date)"
        @click="handleDateClick"
      />
    </div>

    <!-- Loading overlay -->
    <van-loading
      v-if="loading"
      class="loading-overlay"
      type="spinner"
      color="var(--primary-color)"
    >
      載入中...
    </van-loading>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCalendar } from '@/composables/useCalendar'
import { useScheduleStore } from '@/stores/schedule'
import { useCategoryStore } from '@/stores/category'
import { WEEKDAYS_SHORT } from '@/utils/constants'
import CalendarHeader from './CalendarHeader.vue'
import DateCell from './DateCell.vue'

// Composables
const calendar = useCalendar()
const scheduleStore = useScheduleStore()
const categoryStore = useCategoryStore()

// Props
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['date-click', 'toggle-view'])

// Destructure calendar composable
const {
  monthGrid,
  headerDisplay,
  isToday,
  goPrev,
  goNext,
  goToday,
  selectDate,
  isSelected,
  getScheduleCount
} = calendar

// Weekdays for header
const weekdays = computed(() => WEEKDAYS_SHORT)

/**
 * Get category colors for a date
 * Returns array of colors for schedules on this date
 */
function getCategoryColors(date) {
  const schedules = scheduleStore.getSchedulesByDate(date)
  const colors = schedules
    .map(schedule => {
      const category = categoryStore.getCategoryById(schedule.category)
      return category ? category.color : '#B0B0B0'
    })
    .filter((color, index, self) => self.indexOf(color) === index) // Unique colors

  return colors
}

/**
 * Handle date cell click
 */
function handleDateClick(dateObj) {
  selectDate(dateObj.date)
  emit('date-click', dateObj)
}

/**
 * Toggle view mode
 */
function toggleView() {
  emit('toggle-view')
}
</script>

<style scoped>
.month-view {
  position: relative;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

/* Weekday header */
.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--bg-page);
  border-bottom: 1px solid var(--border-color);
}

.weekday-cell {
  padding: var(--spacing-sm);
  text-align: center;
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}

.weekday-cell.is-weekend {
  color: var(--danger-color);
}

/* Date grid */
.date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  background: var(--bg-page);
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .month-view {
    border-radius: 0;
  }

  .weekday-cell {
    padding: var(--spacing-xs);
    font-size: 12px;
  }
}
</style>
