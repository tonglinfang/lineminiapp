<template>
  <div class="schedule-editor">
    <van-form @submit="handleSubmit">
      <!-- Title -->
      <van-field
        v-model="form.title"
        label="標題"
        placeholder="請輸入日程標題"
        required
        :rules="[{ required: true, message: '請輸入標題' }]"
        maxlength="50"
        show-word-limit
      />

      <!-- Description -->
      <van-field
        v-model="form.description"
        label="描述"
        type="textarea"
        placeholder="請輸入描述（可選）"
        rows="3"
        autosize
        maxlength="200"
        show-word-limit
      />

      <!-- Start Date -->
      <van-field
        label="開始日期"
        :model-value="formatDate(form.startDate)"
        placeholder="請選擇開始日期"
        readonly
        required
        clickable
        @click="showStartDatePicker = true"
      >
        <template #left-icon>
          <van-icon name="calendar-o" />
        </template>
      </van-field>

      <!-- Start Time (hidden if all-day) -->
      <van-field
        v-if="!form.isAllDay"
        label="開始時間"
        :model-value="form.startTime"
        placeholder="請選擇開始時間"
        readonly
        clickable
        @click="showStartTimePicker = true"
      >
        <template #left-icon>
          <van-icon name="clock-o" />
        </template>
      </van-field>

      <!-- End Date -->
      <van-field
        label="結束日期"
        :model-value="formatDate(form.endDate)"
        placeholder="請選擇結束日期"
        readonly
        clickable
        @click="showEndDatePicker = true"
      >
        <template #left-icon>
          <van-icon name="calendar-o" />
        </template>
      </van-field>

      <!-- End Time (hidden if all-day) -->
      <van-field
        v-if="!form.isAllDay"
        label="結束時間"
        :model-value="form.endTime"
        placeholder="請選擇結束時間"
        readonly
        clickable
        @click="showEndTimePicker = true"
      >
        <template #left-icon>
          <van-icon name="clock-o" />
        </template>
      </van-field>

      <!-- All Day Toggle -->
      <van-field label="全天">
        <template #input>
          <van-switch v-model="form.isAllDay" size="20" />
        </template>
      </van-field>

      <!-- Category -->
      <category-picker
        v-model="form.category"
        :rules="[{ required: true, message: '請選擇分類' }]"
      />

      <!-- Color -->
      <color-picker v-model="form.color" />

      <!-- Tags -->
      <van-field label="標籤">
        <template #input>
          <div class="tag-list">
            <van-tag
              v-for="(tag, index) in form.tags"
              :key="index"
              closeable
              @close="removeTag(index)"
            >
              {{ tag }}
            </van-tag>
            <van-button
              size="small"
              icon="plus"
              plain
              @click="showTagInput = true"
            >
              添加
            </van-button>
          </div>
        </template>
      </van-field>

      <!-- Reminder -->
      <van-field label="提醒">
        <template #input>
          <van-switch v-model="form.reminder.enabled" size="20" />
        </template>
      </van-field>

      <!-- Reminder Time (shown if reminder enabled) -->
      <van-field
        v-if="form.reminder.enabled"
        label="提前提醒"
        :model-value="getReminderDisplay()"
        readonly
        clickable
        @click="showReminderPicker = true"
      >
        <template #left-icon>
          <van-icon name="bell-o" />
        </template>
      </van-field>

      <!-- Submit Buttons -->
      <div class="form-actions">
        <van-button
          block
          type="primary"
          native-type="submit"
          :loading="loading"
        >
          {{ isEdit ? '更新日程' : '創建日程' }}
        </van-button>
        <van-button
          v-if="showCancel"
          block
          @click="$emit('cancel')"
        >
          取消
        </van-button>
      </div>
    </van-form>

    <!-- Date Pickers -->
    <van-popup v-model:show="showStartDatePicker" position="bottom" round>
      <van-date-picker
        v-model="startDateValue"
        title="選擇開始日期"
        :min-date="new Date(2020, 0, 1)"
        :max-date="new Date(2030, 11, 31)"
        @confirm="handleStartDateConfirm"
        @cancel="showStartDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showEndDatePicker" position="bottom" round>
      <van-date-picker
        v-model="endDateValue"
        title="選擇結束日期"
        :min-date="new Date(form.startDate)"
        :max-date="new Date(2030, 11, 31)"
        @confirm="handleEndDateConfirm"
        @cancel="showEndDatePicker = false"
      />
    </van-popup>

    <!-- Time Pickers -->
    <van-popup v-model:show="showStartTimePicker" position="bottom" round>
      <van-time-picker
        v-model="startTimeValue"
        title="選擇開始時間"
        @confirm="handleStartTimeConfirm"
        @cancel="showStartTimePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showEndTimePicker" position="bottom" round>
      <van-time-picker
        v-model="endTimeValue"
        title="選擇結束時間"
        @confirm="handleEndTimeConfirm"
        @cancel="showEndTimePicker = false"
      />
    </van-popup>

    <!-- Reminder Picker -->
    <van-popup v-model:show="showReminderPicker" position="bottom" round>
      <van-picker
        :columns="reminderOptions"
        @confirm="handleReminderConfirm"
        @cancel="showReminderPicker = false"
      />
    </van-popup>

    <!-- Tag Input Dialog -->
    <van-dialog
      v-model:show="showTagInput"
      title="添加標籤"
      show-cancel-button
      @confirm="handleAddTag"
    >
      <van-field
        v-model="newTag"
        placeholder="請輸入標籤名稱"
        maxlength="10"
      />
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getCurrentDate, getCurrentTime, formatDate as formatDateUtil } from '@/utils/date'
import { REMINDER_OPTIONS } from '@/utils/constants'
import CategoryPicker from '@/components/category/CategoryPicker.vue'
import ColorPicker from '@/components/category/ColorPicker.vue'
import { showToast } from 'vant'

// Props
const props = defineProps({
  initialData: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['submit', 'cancel'])

// Form state
const form = ref({
  title: '',
  description: '',
  startDate: getCurrentDate(),
  startTime: getCurrentTime(),
  endDate: getCurrentDate(),
  endTime: getCurrentTime(),
  isAllDay: false,
  category: 'personal',
  tags: [],
  color: '#FF6B6B',
  reminder: {
    enabled: true,
    type: 'local',
    time: 15,
    unit: 'minutes'
  }
})

// Picker states
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const showStartTimePicker = ref(false)
const showEndTimePicker = ref(false)
const showReminderPicker = ref(false)
const showTagInput = ref(false)

// Picker values (for van-date-picker format)
const startDateValue = ref(new Date())
const endDateValue = ref(new Date())
const startTimeValue = ref(['12', '00'])
const endTimeValue = ref(['12', '00'])

// Tag input
const newTag = ref('')

// Reminder options
const reminderOptions = computed(() => {
  return REMINDER_OPTIONS.map(opt => ({
    text: opt.label,
    value: opt.value,
    unit: opt.unit
  }))
})

// Initialize form with existing data
if (props.initialData) {
  Object.assign(form.value, props.initialData)
}

/**
 * Format date for display
 */
function formatDate(date) {
  return formatDateUtil(date, 'YYYY-MM-DD')
}

/**
 * Handle start date confirm
 */
function handleStartDateConfirm(value) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  form.value.startDate = `${year}-${month}-${day}`
  showStartDatePicker.value = false

  // Auto-update end date if it's before start date
  if (form.value.endDate < form.value.startDate) {
    form.value.endDate = form.value.startDate
  }
}

/**
 * Handle end date confirm
 */
function handleEndDateConfirm(value) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  form.value.endDate = `${year}-${month}-${day}`
  showEndDatePicker.value = false
}

/**
 * Handle start time confirm
 */
function handleStartTimeConfirm(value) {
  form.value.startTime = `${value[0]}:${value[1]}`
  showStartTimePicker.value = false
}

/**
 * Handle end time confirm
 */
function handleEndTimeConfirm(value) {
  form.value.endTime = `${value[0]}:${value[1]}`
  showEndTimePicker.value = false
}

/**
 * Handle reminder confirm
 */
function handleReminderConfirm(value) {
  form.value.reminder.time = value.value
  form.value.reminder.unit = value.unit
  showReminderPicker.value = false
}

/**
 * Get reminder display text
 */
function getReminderDisplay() {
  const option = REMINDER_OPTIONS.find(
    opt => opt.value === form.value.reminder.time
  )
  return option ? option.label : '15分鐘前'
}

/**
 * Add tag
 */
function handleAddTag() {
  const tag = newTag.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

/**
 * Remove tag
 */
function removeTag(index) {
  form.value.tags.splice(index, 1)
}

/**
 * Handle form submit
 */
function handleSubmit() {
  // Validate
  if (!form.value.title) {
    showToast('請輸入標題')
    return
  }

  if (!form.value.startDate) {
    showToast('請選擇開始日期')
    return
  }

  // Emit submit event
  emit('submit', { ...form.value })
}

/**
 * Watch all-day toggle
 */
watch(() => form.value.isAllDay, (isAllDay) => {
  if (isAllDay) {
    form.value.startTime = '00:00'
    form.value.endTime = '23:59'
  }
})
</script>

<style scoped>
.schedule-editor {
  background: var(--bg-page);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
}

.form-actions {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
</style>
