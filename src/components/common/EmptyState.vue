<template>
  <div class="empty-state">
    <van-icon
      :name="icon"
      :size="iconSize"
      :color="iconColor"
      class="empty-icon"
    />

    <h3 v-if="title" class="empty-title">{{ title }}</h3>
    <p v-if="description" class="empty-description">{{ description }}</p>

    <van-button
      v-if="actionText"
      :type="actionType"
      :size="actionSize"
      @click="$emit('action')"
      class="empty-action"
    >
      {{ actionText }}
    </van-button>
  </div>
</template>

<script setup>
// Props
defineProps({
  icon: {
    type: String,
    default: 'orders-o'
  },
  iconSize: {
    type: [String, Number],
    default: 64
  },
  iconColor: {
    type: String,
    default: 'var(--text-light)'
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: ''
  },
  actionType: {
    type: String,
    default: 'primary'
  },
  actionSize: {
    type: String,
    default: 'normal'
  }
})

// Emits
defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
  min-height: 200px;
}

.empty-icon {
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-title {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-description {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  max-width: 300px;
}

.empty-action {
  margin-top: var(--spacing-md);
}
</style>
