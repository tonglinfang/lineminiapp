<template>
  <div class="schedule-list">
    <!-- Filter bar -->
    <div v-if="showFilter" class="filter-bar">
      <van-dropdown-menu>
        <van-dropdown-item
          v-model="filterCategory"
          :options="categoryOptions"
          @change="handleCategoryChange"
        />
      </van-dropdown-menu>

      <van-search
        v-model="searchQuery"
        placeholder="スケジュールを検索"
        @search="handleSearch"
        @clear="handleSearch"
      />
    </div>

    <!-- Schedule groups (by date) -->
    <div v-if="groupedSchedules.length > 0" class="schedule-groups">
      <div
        v-for="group in groupedSchedules"
        :key="group.date"
        class="schedule-group"
      >
        <div class="group-header">
          <h3 class="group-date">{{ group.dateDisplay }}</h3>
          <span class="group-count">{{ group.schedules.length }} 件</span>
        </div>

        <div class="group-items">
          <schedule-item
            v-for="schedule in group.schedules"
            :key="schedule.id"
            :schedule="schedule"
            :show-checkbox="showCheckbox"
            :allow-swipe="allowSwipe"
            @click="$emit('schedule-click', schedule)"
            @edit="$emit('schedule-edit', schedule)"
            @delete="handleDelete(schedule)"
            @toggle-complete="handleToggleComplete(schedule)"
          />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <empty-state
      v-else
      icon="orders-o"
      title="予定なし"
      description="まだスケジュールが作成されていません"
      action-text="スケジュールを作成"
      @action="$emit('create')"
    />

    <!-- Loading -->
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
import { ref, computed, watch } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import { useCategoryStore } from '@/stores/category'
import { formatDate, getRelativeDate } from '@/utils/date'
import { showConfirmDialog, showToast } from 'vant'
import ScheduleItem from './ScheduleItem.vue'
import EmptyState from '@/components/common/EmptyState.vue'

// Props
const props = defineProps({
  schedules: {
    type: Array,
    default: null // If null, use filtered schedules from store
  },
  showFilter: {
    type: Boolean,
    default: true
  },
  showCheckbox: {
    type: Boolean,
    default: true
  },
  allowSwipe: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'schedule-click',
  'schedule-edit',
  'schedule-delete',
  'create'
])

// Stores
const scheduleStore = useScheduleStore()
const categoryStore = useCategoryStore()

// Local state
const filterCategory = ref(null)
const searchQuery = ref('')

// Computed
const categoryOptions = computed(() => {
  return [
    { text: '全てのカテゴリー', value: null },
    ...categoryStore.allCategories.map(cat => ({
      text: cat.name,
      value: cat.id
    }))
  ]
})

const displaySchedules = computed(() => {
  if (props.schedules !== null) {
    return props.schedules
  }
  return scheduleStore.filteredSchedules
})

/**
 * Group schedules by date
 */
const groupedSchedules = computed(() => {
  const groups = {}

  displaySchedules.value.forEach(schedule => {
    const date = schedule.startDate
    if (!groups[date]) {
      groups[date] = {
        date,
        dateDisplay: getRelativeDate(date),
        schedules: []
      }
    }
    groups[date].schedules.push(schedule)
  })

  // Sort by date and time
  return Object.values(groups)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(group => ({
      ...group,
      schedules: group.schedules.sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1
        if (!a.isAllDay && b.isAllDay) return 1
        return a.startTime.localeCompare(b.startTime)
      })
    }))
})

/**
 * Handle category filter change
 */
function handleCategoryChange(value) {
  scheduleStore.setFilterCategory(value)
}

/**
 * Handle search
 */
function handleSearch() {
  scheduleStore.setSearchQuery(searchQuery.value)
}

/**
 * Handle delete schedule
 */
async function handleDelete(schedule) {
  const confirmed = await showConfirmDialog({
    title: '削除確認',
    message: `「${schedule.title}」を削除してもよろしいですか？`
  }).catch(() => false)

  if (confirmed) {
    const success = await scheduleStore.deleteSchedule(schedule.id)
    if (success) {
      showToast('削除しました')
      emit('schedule-delete', schedule)
    } else {
      showToast('削除に失敗しました')
    }
  }
}

/**
 * Handle toggle complete
 */
async function handleToggleComplete(schedule) {
  await scheduleStore.toggleComplete(schedule.id)
}

// Watch for filter changes from store
watch(
  () => scheduleStore.filterCategory,
  (value) => {
    filterCategory.value = value
  }
)

watch(
  () => scheduleStore.searchQuery,
  (value) => {
    searchQuery.value = value
  }
)
</script>

<style scoped>
.schedule-list {
  position: relative;
  min-height: 200px;
}

/* Filter bar */
.filter-bar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}

/* Schedule groups */
.schedule-groups {
  padding: var(--spacing-md);
}

.schedule-group {
  margin-bottom: var(--spacing-lg);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: 0 var(--spacing-sm);
}

.group-date {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.group-count {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* Loading state */
.loading-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
