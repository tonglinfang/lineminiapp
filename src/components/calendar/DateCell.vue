<template>
  <div
    class="date-cell"
    :class="cellClasses"
    @click="handleClick"
  >
    <div class="cell-content">
      <!-- Day number -->
      <span class="day-number">{{ dateObj.day }}</span>

      <!-- Schedule indicator badge -->
      <span
        v-if="scheduleCount > 0"
        class="schedule-badge"
        :style="{ backgroundColor: badgeColor }"
      >
        {{ scheduleCount > 9 ? '9+' : scheduleCount }}
      </span>

      <!-- Category dots (show up to 3 categories) -->
      <div v-if="showCategoryDots && categoryColors.length > 0" class="category-dots">
        <span
          v-for="(color, index) in categoryColors.slice(0, 3)"
          :key="index"
          class="category-dot"
          :style="{ backgroundColor: color }"
        />
      </div>
    </div>

    <!-- Lunar calendar date (future feature) -->
    <span v-if="showLunar && lunarDate" class="lunar-date">
      {{ lunarDate }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  dateObj: {
    type: Object,
    required: true
  },
  scheduleCount: {
    type: Number,
    default: 0
  },
  categoryColors: {
    type: Array,
    default: () => []
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  showCategoryDots: {
    type: Boolean,
    default: true
  },
  showLunar: {
    type: Boolean,
    default: false
  },
  lunarDate: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['click'])

/**
 * Compute CSS classes for the cell
 */
const cellClasses = computed(() => ({
  'is-today': props.dateObj.isToday,
  'is-selected': props.isSelected,
  'is-weekend': props.dateObj.isWeekend,
  'is-past': props.dateObj.isPast,
  'is-future': props.dateObj.isFuture,
  'is-other-month': props.dateObj.isCurrentMonth === false,
  'has-schedules': props.scheduleCount > 0
}))

/**
 * Badge color based on schedule count
 */
const badgeColor = computed(() => {
  if (props.scheduleCount >= 5) return 'var(--danger-color)'
  if (props.scheduleCount >= 3) return 'var(--warning-color)'
  return 'var(--primary-color)'
})

/**
 * Handle cell click
 */
function handleClick() {
  emit('click', props.dateObj)
}
</script>

<style scoped>
.date-cell {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs);
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
}

.date-cell:hover {
  background: var(--bg-hover);
}

.date-cell:active {
  background: var(--bg-active);
  transform: scale(0.95);
}

/* Cell content wrapper */
.cell-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Day number */
.day-number {
  font-size: var(--font-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

/* Schedule badge */
.schedule-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-round);
  font-size: 11px;
  font-weight: var(--font-semibold);
  line-height: 1;
}

/* Category dots */
.category-dots {
  position: absolute;
  bottom: -12px;
  display: flex;
  gap: 2px;
}

.category-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Lunar date */
.lunar-date {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* State: Today */
.date-cell.is-today .day-number {
  color: var(--primary-color);
  font-weight: var(--font-bold);
}

.date-cell.is-today::before {
  content: '';
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0.1;
  z-index: 0;
}

/* State: Selected */
.date-cell.is-selected {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.date-cell.is-selected .day-number {
  color: white;
  font-weight: var(--font-bold);
}

.date-cell.is-selected .schedule-badge {
  background: white;
  color: var(--primary-color);
}

/* State: Weekend */
.date-cell.is-weekend .day-number {
  color: var(--danger-color);
}

/* State: Past */
.date-cell.is-past .day-number {
  color: var(--text-light);
}

/* State: Other month */
.date-cell.is-other-month {
  background: var(--bg-page);
}

.date-cell.is-other-month .day-number {
  color: var(--text-light);
  opacity: 0.5;
}

/* State: Has schedules */
.date-cell.has-schedules {
  border-color: var(--primary-color);
  border-width: 1.5px;
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .day-number {
    font-size: var(--font-sm);
  }

  .schedule-badge {
    min-width: 16px;
    height: 16px;
    font-size: 10px;
  }

  .category-dot {
    width: 5px;
    height: 5px;
  }
}
</style>
