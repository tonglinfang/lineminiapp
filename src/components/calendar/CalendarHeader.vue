<template>
  <div class="calendar-header">
    <!-- Navigation and title -->
    <div class="header-nav">
      <van-button
        icon="arrow-left"
        size="small"
        plain
        @click="handlePrev"
        class="nav-button"
      />

      <div class="header-title" @click="$emit('title-click')">
        <span>{{ title }}</span>
        <van-icon
          v-if="showViewToggle"
          name="arrow-down"
          size="14"
          class="title-icon"
        />
      </div>

      <van-button
        icon="arrow"
        size="small"
        plain
        @click="handleNext"
        class="nav-button"
      />
    </div>

    <!-- Action buttons -->
    <div class="header-actions">
      <van-button
        size="small"
        type="primary"
        @click="handleToday"
        :disabled="isToday"
      >
        今天
      </van-button>

      <van-button
        v-if="showViewModeToggle"
        icon="apps-o"
        size="small"
        plain
        @click="$emit('toggle-view')"
        class="view-toggle"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  isToday: {
    type: Boolean,
    default: false
  },
  showViewToggle: {
    type: Boolean,
    default: false
  },
  showViewModeToggle: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['prev', 'next', 'today', 'title-click', 'toggle-view'])

/**
 * Handle previous period navigation
 */
function handlePrev() {
  emit('prev')
}

/**
 * Handle next period navigation
 */
function handleNext() {
  emit('next')
}

/**
 * Handle today button click
 */
function handleToday() {
  emit('today')
}
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.nav-button {
  min-width: 36px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.title-icon {
  color: var(--text-secondary);
  transition: transform var(--transition-fast);
}

.header-title:active .title-icon {
  transform: rotate(180deg);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.view-toggle {
  min-width: 36px;
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .calendar-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .header-title {
    font-size: var(--font-base);
  }
}
</style>
