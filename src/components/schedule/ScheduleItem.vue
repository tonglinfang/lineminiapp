<template>
  <van-swipe-cell :disabled="!allowSwipe">
    <div
      class="schedule-item"
      :class="{ 'is-completed': schedule.isCompleted, 'is-past': isPast }"
      :style="{ borderLeftColor: categoryColor }"
      @click="$emit('click', schedule)"
    >
      <!-- Time -->
      <div class="schedule-time">
        <van-icon name="clock-o" size="14" />
        <span>{{ timeDisplay }}</span>
      </div>

      <!-- Content -->
      <div class="schedule-content">
        <h4 class="schedule-title">
          {{ schedule.title }}
        </h4>
        <p v-if="schedule.description" class="schedule-description">
          {{ schedule.description }}
        </p>

        <!-- Meta info -->
        <div class="schedule-meta">
          <van-tag
            :color="categoryColor"
            plain
            size="small"
          >
            {{ categoryName }}
          </van-tag>

          <van-tag
            v-for="tag in schedule.tags"
            :key="tag"
            plain
            size="small"
          >
            {{ tag }}
          </van-tag>

          <van-icon
            v-if="schedule.reminder?.enabled"
            name="bell-o"
            size="14"
            color="var(--warning-color)"
          />
        </div>
      </div>

      <!-- Status icon -->
      <div class="schedule-status">
        <van-checkbox
          v-if="showCheckbox"
          :model-value="schedule.isCompleted"
          @click.stop="$emit('toggle-complete', schedule)"
        />
        <van-icon
          v-else
          name="arrow"
          size="16"
          color="var(--text-light)"
        />
      </div>
    </div>

    <!-- Swipe actions -->
    <template #right>
      <van-button
        square
        text="編集"
        type="primary"
        class="swipe-button"
        @click="$emit('edit', schedule)"
      />
      <van-button
        square
        text="削除"
        type="danger"
        class="swipe-button"
        @click="$emit('delete', schedule)"
      />
    </template>
  </van-swipe-cell>
</template>

<script setup>
import { computed } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { isPast as checkIsPast } from '@/utils/date'

// Props
const props = defineProps({
  schedule: {
    type: Object,
    required: true
  },
  showCheckbox: {
    type: Boolean,
    default: true
  },
  allowSwipe: {
    type: Boolean,
    default: true
  }
})

// Emits
defineEmits(['click', 'edit', 'delete', 'toggle-complete'])

// Store
const categoryStore = useCategoryStore()

// Computed
const categoryColor = computed(() => {
  const category = categoryStore.getCategoryById(props.schedule.category)
  return category?.color || '#B0B0B0'
})

const categoryName = computed(() => {
  const category = categoryStore.getCategoryById(props.schedule.category)
  return category?.name || 'その他'
})

const timeDisplay = computed(() => {
  if (props.schedule.isAllDay) {
    return '終日'
  }
  return `${props.schedule.startTime} - ${props.schedule.endTime}`
})

const isPast = computed(() => {
  return checkIsPast(props.schedule.startDate)
})
</script>

<style scoped>
.schedule-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-left: 4px solid var(--primary-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.schedule-item:hover {
  background: var(--bg-hover);
  transform: translateX(2px);
}

.schedule-item.is-completed {
  opacity: 0.6;
}

.schedule-item.is-completed .schedule-title {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.schedule-item.is-past {
  opacity: 0.7;
}

/* Time */
.schedule-time {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 80px;
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

/* Content */
.schedule-content {
  flex: 1;
  min-width: 0;
}

.schedule-title {
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schedule-description {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.schedule-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  align-items: center;
}

/* Status */
.schedule-status {
  display: flex;
  align-items: center;
}

/* Swipe buttons */
.swipe-button {
  height: 100%;
}
</style>
