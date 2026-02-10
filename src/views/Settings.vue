<template>
  <div class="settings-view">
    <van-nav-bar title="設定" />

    <!-- User Info Section -->
    <van-cell-group title="ユーザー情報" inset>
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
    <van-cell-group title="通知設定" inset>
      <van-cell title="通知権限">
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
        title="通知権限をリクエスト"
        is-link
        @click="handleRequestPermission"
      />

      <van-cell title="リマインダーを有効にする">
        <template #right-icon>
          <van-switch
            v-model="userStore.preferences.notifications.enabled"
            @change="handleToggleNotifications"
            :disabled="!notification.isGranted()"
          />
        </template>
      </van-cell>

      <van-cell
        title="デフォルトのリマインダー時間"
        :value="defaultReminderDisplay"
        is-link
        :disabled="!userStore.preferences.notifications.enabled"
        @click="showReminderPicker = true"
      />

      <van-cell title="スケジュール済みリマインダー">
        <template #value>
          {{ notification.getScheduledCount() }} 件
        </template>
      </van-cell>
    </van-cell-group>

    <!-- Calendar Settings -->
    <van-cell-group title="カレンダー設定" inset>
      <van-cell
        title="デフォルト表示"
        :value="defaultViewDisplay"
        is-link
        @click="showViewPicker = true"
      />

      <van-cell title="週の開始日">
        <template #value>
          <van-radio-group
            v-model="userStore.preferences.weekStartsOn"
            direction="horizontal"
            @change="userStore.savePreferences()"
          >
            <van-radio :name="0">日曜日</van-radio>
            <van-radio :name="1">月曜日</van-radio>
          </van-radio-group>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- Data Management -->
    <van-cell-group title="データ管理" inset>
      <van-cell
        title="スケジュール数"
        :value="`${scheduleStore.activeSchedules.length} 件`"
      />

      <van-cell
        title="ストレージ使用量"
        :value="`${storageStats.sizeKB} KB / ${storageStats.percentUsed}%`"
      />

      <van-cell
        title="データをエクスポート"
        is-link
        @click="handleExportData"
      />

      <van-cell
        title="データをインポート"
        is-link
        @click="handleImportData"
      />

      <van-cell
        title="すべてのデータをクリア"
        is-link
        @click="handleClearData"
      />
    </van-cell-group>

    <!-- Testing -->
    <van-cell-group title="テスト" inset>
      <van-cell
        title="通知をテスト"
        is-link
        @click="handleTestNotification"
      />
    </van-cell-group>

    <!-- About -->
    <van-cell-group title="について" inset>
      <van-cell
        title="バージョン"
        :value="appVersion"
      />

      <van-cell
        title="LINE環境"
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
    return { text: '許可済み', type: 'success' }
  } else if (notification.permission === 'denied') {
    return { text: '拒否済み', type: 'danger' }
  } else {
    return { text: '未リクエスト', type: 'warning' }
  }
})

const defaultReminderDisplay = computed(() => {
  const time = userStore.preferences.notifications.defaultReminderTime
  const option = REMINDER_OPTIONS.find(opt => opt.value === time)
  return option ? option.label : '15分前'
})

const defaultViewDisplay = computed(() => {
  const viewMap = {
    [VIEW_MODES.MONTH]: '月表示',
    [VIEW_MODES.WEEK]: '週表示',
    [VIEW_MODES.DAY]: '日表示',
    [VIEW_MODES.LIST]: 'リスト表示'
  }
  return viewMap[userStore.preferences.defaultView] || '月表示'
})

const storageStats = computed(() => storage.storageStats)

const appVersion = computed(() => APP_CONFIG.VERSION)

const liffEnv = computed(() => {
  const os = getOS()
  return os === 'web' ? 'ブラウザ' : `LINE (${os})`
})

const reminderOptions = REMINDER_OPTIONS.map(opt => ({
  text: opt.label,
  value: opt.value
}))

const viewOptions = [
  { text: '月表示', value: VIEW_MODES.MONTH },
  { text: '週表示', value: VIEW_MODES.WEEK },
  { text: '日表示', value: VIEW_MODES.DAY },
  { text: 'リスト表示', value: VIEW_MODES.LIST }
]

/**
 * Handle request notification permission
 */
async function handleRequestPermission() {
  const result = await notification.requestPermission()
  if (result === 'granted') {
    showToast('通知権限が許可されました')
    // Reschedule all notifications
    notification.rescheduleAll(scheduleStore.schedules)
  } else if (result === 'denied') {
    showToast('通知権限が拒否されました')
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
    showToast('リマインダーを有効にしました')
  } else {
    // Cancel all notifications
    notification.cancelAllNotifications()
    showToast('リマインダーを無効にしました')
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
  showToast('保存しました')
}

/**
 * Handle view mode confirm
 */
function handleViewConfirm(value) {
  userStore.updatePreference('defaultView', value.value)
  showViewPicker.value = false
  showToast('保存しました')
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
    showToast('エクスポートしました')
  } catch (error) {
    showToast('エクスポートできませんでした')
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
        title: 'インポートの確認',
        message: `${data.schedules?.length || 0} 件のスケジュールをインポートします。続行しますか？`
      })

      if (confirmed) {
        const success = await scheduleStore.importSchedules(data, true)
        if (success) {
          showToast('インポートしました')
          // Reschedule notifications
          notification.rescheduleAll(scheduleStore.schedules)
        } else {
          showToast('インポートできませんでした')
        }
      }
    } catch (error) {
      showToast('ファイル形式が正しくありません')
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
    title: 'クリアの確認',
    message: 'この操作はすべてのスケジュールデータをクリアします。元に戻せません！'
  }).catch(() => false)

  if (confirmed) {
    storage.clearUserData()
    await scheduleStore.loadSchedules()
    notification.cancelAllNotifications()
    showToast('データをクリアしました')
  }
}

/**
 * Handle test notification
 */
function handleTestNotification() {
  if (!notification.isGranted()) {
    showToast('先に通知権限を許可してください')
    return
  }

  notification.testNotification()
  showToast('テスト通知を送信しました')
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
