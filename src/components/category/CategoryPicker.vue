<template>
  <van-field
    :label="label"
    :placeholder="placeholder"
    readonly
    clickable
    :model-value="selectedCategoryName"
    :rules="rules"
    @click="showPicker = true"
  >
    <template #left-icon>
      <van-icon
        :name="selectedCategory?.icon || 'label-o'"
        :color="selectedCategory?.color || 'var(--text-secondary)'"
        size="20"
      />
    </template>
    <template #right-icon>
      <van-icon name="arrow" />
    </template>
  </van-field>

  <!-- Category picker popup -->
  <van-popup
    v-model:show="showPicker"
    position="bottom"
    round
    :style="{ height: '50%' }"
  >
    <div class="category-picker-popup">
      <div class="picker-header">
        <van-button text @click="showPicker = false">取消</van-button>
        <span class="picker-title">選擇分類</span>
        <van-button type="primary" text @click="handleConfirm">確定</van-button>
      </div>

      <div class="category-list">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          :class="{ 'is-selected': tempSelected === category.id }"
          @click="tempSelected = category.id"
        >
          <van-icon
            :name="category.icon"
            :color="category.color"
            size="24"
          />
          <span class="category-name">{{ category.name }}</span>
          <van-icon
            v-if="tempSelected === category.id"
            name="success"
            color="var(--primary-color)"
            size="20"
          />
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCategoryStore } from '@/stores/category'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: '分類'
  },
  placeholder: {
    type: String,
    default: '請選擇分類'
  },
  rules: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Store
const categoryStore = useCategoryStore()

// Local state
const showPicker = ref(false)
const tempSelected = ref(props.modelValue)

// Computed
const categories = computed(() => categoryStore.allCategories)

const selectedCategory = computed(() => {
  return categoryStore.getCategoryById(props.modelValue)
})

const selectedCategoryName = computed(() => {
  return selectedCategory.value?.name || ''
})

/**
 * Handle confirm selection
 */
function handleConfirm() {
  emit('update:modelValue', tempSelected.value)
  showPicker.value = false
}
</script>

<style scoped>
.category-picker-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.picker-title {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.category-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.category-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.category-item:hover {
  background: var(--bg-hover);
}

.category-item.is-selected {
  border-color: var(--primary-color);
  background: rgba(6, 199, 85, 0.05);
}

.category-name {
  flex: 1;
  font-size: var(--font-base);
  color: var(--text-primary);
}
</style>
