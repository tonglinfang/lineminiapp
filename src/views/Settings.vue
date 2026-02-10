<template>
  <div class="settings-view">
    <van-nav-bar title="設置" />

    <!-- User Info Section -->
    <van-cell-group title="用戶信息" inset>
      <van-cell
        :title="userStore.displayName"
        :label="`User ID: ${userStore.userId}`"
      >
        <template #icon>
          <van-image
            round
            width="40"
            height="40"
            :src="userStore.pictureUrl"
            style="margin-right: 12px"
          />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- Notification Settings -->
    <van-cell-group title="通知設置" inset>
      <van-cell title="通知權限">
        <template #value>
          <van-tag
            :type="notificationStatus.type"
            size="medium"
          >
            {{ notificationStatus.text }}
          </van-tag>
        </template>
      </van-cell>

      <van-cell
        v-if="notification.permission !== 'granted'"
        title="請求通知權限"
        is-link
        @click="handleRequestPermission"
      />

      <van-cell title="啟用提醒">
        <template #right-icon>
          <van-switch
            v-model="userStore.preferences.notifications.enabled"
            @change="handleToggleNotifications"
            :disabled="!notification.isGranted()"
          />
        </template>
      </van-cell>

      <van-cell
        title="默認提醒時間"
        :value="defaultReminderDisplay"
        is-link
        :disabled="!userStore.preferences.notifications.enabled"
        @click="showReminderPicker = true"
      />

      <van-cell title="已調度的提醒">
        <template #value>
          {{ notification.getScheduledCount() }} 個
        </template>
      </van-cell>
    </van-cell-group>

    <!-- Calendar Settings -->
    <van-cell-group title="日曆設置" inset>
      <van-cell
        title="默認視圖"
        :value="defaultViewDisplay"
        is-link
        @click="showViewPicker = true"
      />

      <van-cell title="週起始日">
        <template #value>
          <van-radio-group
            v-model="userStore.preferences.weekStartsOn"
            direction="horizontal"
            @change="userStore.savePreferences()"
          >
            <van-radio :name="0">週日</van-radio>
            <van-radio :name="1">週一</van-radio>
          </van-radio-group>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- Data Management -->
    <van-cell-group title="數據管理" inset>
      <van-cell
        title="日程數量"
        :value="`${scheduleStore.activeSchedules.length} 個`"
      />

      <van-cell
        title="存儲使用"
        :value="`${storageStats.sizeKB} KB / ${storageStats.percentUsed}%`"
      />

      <van-cell
        title="導出數據"
        is-link
        @click="handleExportData"
      />

      <van-cell
        title="導入數據"
        is-link
        @click="handleImportData"
      />

      <van-cell
        title="清除所有數據"
        is-link
        @click="handleClearData"
      />
    </van-cell-group>

    <!-- Testing -->
    <van-cell-group title="測試" inset>
      <van-cell
        title="測試通知"
        is-link
        @click="handleTestNotification"
      />
    </van-cell-group>

    <!-- About -->
    <van-cell-group title="關於" inset>
      <van-cell
        title="版本"
        :value="appVersion"
      />

      <van-cell
        title="LINE 環境"
        :value="liffEnv"
      />
    </van-cell-group>

    <!-- Reminder Picker -->
    <van-popup v-model:show="showReminderPicker" position="bottom" round>
      <van-picker
        :columns="reminderOptions"
        @confirm="handleReminderConfirm"
        @cancel="showReminderPicker = false"
      />
    </van-popup>

    <!-- View Mode Picker -->
    <van-popup v-model:show="showViewPicker" position="bottom" round>
      <van-picker
        :columns="viewOptions"
        @confirm="handleViewConfirm"
        @cancel="showViewPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useScheduleStore } from '@/stores/schedule'
import { useNotification } from '@/composables/useNotification'
import { useStorage } from '@/composables/useStorage'
import { useLiff } from '@/composables/useLiff'
import { REMINDER_OPTIONS, VIEW_MODES, APP_CONFIG } from '@/utils/constants'
import { showToast, showConfirmDialog } from 'vant'

// Stores & Composables
const userStore = useUserStore()
const scheduleStore = useScheduleStore()
const notification = useNotification()
const storage = useStorage()
const { getOS } = useLiff()

// State
const showReminderPicker = ref(false)
const showViewPicker = ref(false)

// Computed
const notificationStatus = computed(() => {
  if (notification.permission === 'granted') {
    return { text: '已授權', type: 'success' }
  } else if (notification.permission === 'denied') {
    return { text: '已拒絕', type: 'danger' }
  } else {
    return { text: '未請求', type: 'warning' }
  }
})

const defaultReminderDisplay = computed(() => {
  const time = userStore.preferences.notifications.defaultReminderTime
  const option = REMINDER_OPTIONS.find(opt => opt.value === time)
  return option ? option.label : '15分鐘前'
})

const defaultViewDisplay = computed(() => {
  const viewMap = {
    [VIEW_MODES.MONTH]: '月視圖',
    [VIEW_MODES.WEEK]: '週視圖',
    [VIEW_MODES.DAY]: '日視圖',
    [VIEW_MODES.LIST]: '列表視圖'
  }
  return viewMap[userStore.preferences.defaultView] || '月視圖'
})

const storageStats = computed(() => storage.storageStats)

const appVersion = computed(() => APP_CONFIG.VERSION)

const liffEnv = computed(() => {
  const os = getOS()
  return os === 'web' ? '瀏覽器' : `LINE (${os})`
})

const reminderOptions = REMINDER_OPTIONS.map(opt => ({
  text: opt.label,
  value: opt.value
}))

const viewOptions = [
  { text: '月視圖', value: VIEW_MODES.MONTH },
  { text: '週視圖', value: VIEW_MODES.WEEK },
  { text: '日視圖', value: VIEW_MODES.DAY },
  { text: '列表視圖', value: VIEW_MODES.LIST }
]

/**
 * Handle request notification permission
 */
async function handleRequestPermission() {
  const result = await notification.requestPermission()
  if (result === 'granted') {
    showToast('通知權限已授予')
    // Reschedule all notifications
    notification.rescheduleAll(scheduleStore.schedules)
  } else if (result === 'denied') {
    showToast('通知權限被拒絕')
  }
}

/**
 * Handle toggle notifications
 */
function handleToggleNotifications(enabled) {
  userStore.updateNotificationSettings({ enabled })

  if (enabled) {
    // Reschedule all notifications
    notification.rescheduleAll(scheduleStore.schedules)
    showToast('提醒已啟用')
  } else {
    // Cancel all notifications
    notification.cancelAllNotifications()
    showToast('提醒已關閉')
  }
}

/**
 * Handle reminder time confirm
 */
function handleReminderConfirm(value) {
  userStore.updateNotificationSettings({
    defaultReminderTime: value.value
  })
  showReminderPicker.value = false
  showToast('已保存')
}

/**
 * Handle view mode confirm
 */
function handleViewConfirm(value) {
  userStore.updatePreference('defaultView', value.value)
  showViewPicker.value = false
  showToast('已保存')
}

/**
 * Handle export data
 */
function handleExportData() {
  try {
    const data = scheduleStore.exportSchedules()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `schedules-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('導出成功')
  } catch (error) {
    showToast('導出失敗')
    console.error('Export failed:', error)
  }
}

/**
 * Handle import data
 */
function handleImportData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'

  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const confirmed = await showConfirmDialog({
        title: '確認導入',
        message: `將導入 ${data.schedules?.length || 0} 個日程，是否繼續？`
      })

      if (confirmed) {
        const success = await scheduleStore.importSchedules(data, true)
        if (success) {
          showToast('導入成功')
          // Reschedule notifications
          notification.rescheduleAll(scheduleStore.schedules)
        } else {
          showToast('導入失敗')
        }
      }
    } catch (error) {
      showToast('文件格式錯誤')
      console.error('Import failed:', error)
    }
  }

  input.click()
}

/**
 * Handle clear all data
 */
async function handleClearData() {
  const confirmed = await showConfirmDialog({
    title: '確認清除',
    message: '此操作將清除所有日程數據，且無法恢復！'
  }).catch(() => false)

  if (confirmed) {
    storage.clearUserData()
    await scheduleStore.loadSchedules()
    notification.cancelAllNotifications()
    showToast('數據已清除')
  }
}

/**
 * Handle test notification
 */
function handleTestNotification() {
  if (!notification.isGranted()) {
    showToast('請先授予通知權限')
    return
  }

  notification.testNotification()
  showToast('測試通知已發送')
}

onMounted(() => {
  storage.updateStats()
})
</script>

<style scoped>
.settings-view {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: var(--spacing-xl);
}

:deep(.van-cell-group) {
  margin-bottom: var(--spacing-md);
}
</style>
