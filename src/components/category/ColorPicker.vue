<template>
  <van-field
    :label="label"
    readonly
    clickable
    @click="showPicker = true"
  >
    <template #input>
      <div class="color-preview">
        <div
          class="color-swatch"
          :style="{ backgroundColor: modelValue }"
        />
        <span>{{ modelValue }}</span>
      </div>
    </template>
    <template #right-icon>
      <van-icon name="arrow" />
    </template>
  </van-field>

  <!-- Color picker popup -->
  <van-popup
    v-model:show="showPicker"
    position="bottom"
    round
    :style="{ height: '40%' }"
  >
    <div class="color-picker-popup">
      <div class="picker-header">
        <van-button text @click="showPicker = false">取消</van-button>
        <span class="picker-title">選擇顏色</span>
        <van-button type="primary" text @click="handleConfirm">確定</van-button>
      </div>

      <div class="color-grid">
        <div
          v-for="color in colorOptions"
          :key="color"
          class="color-option"
          :class="{ 'is-selected': tempColor === color }"
          :style="{ backgroundColor: color }"
          @click="tempColor = color"
        >
          <van-icon
            v-if="tempColor === color"
            name="success"
            color="white"
            size="20"
          />
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: '#FF6B6B'
  },
  label: {
    type: String,
    default: '顏色'
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Local state
const showPicker = ref(false)
const tempColor = ref(props.modelValue)

// Predefined color palette
const colorOptions = [
  '#FF6B6B', // Red
  '#FF9FF3', // Pink
  '#FFE66D', // Yellow
  '#FFB84D', // Orange
  '#4ECDC4', // Teal
  '#95E1D3', // Mint
  '#06C755', // Green
  '#A8E6CF', // Light green
  '#5DADE2', // Blue
  '#C7CEEA', // Lavender
  '#9B59B6', // Purple
  '#E74C3C', // Dark red
  '#3498DB', // Sky blue
  '#1ABC9C', // Turquoise
  '#F39C12', // Gold
  '#B0B0B0'  // Gray
]

/**
 * Handle confirm selection
 */
function handleConfirm() {
  emit('update:modelValue', tempColor.value)
  showPicker.value = false
}
</script>

<style scoped>
.color-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.color-picker-popup {
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

.color-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.color-option {
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  border: 3px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.color-option:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.color-option.is-selected {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.1);
}
</style>
