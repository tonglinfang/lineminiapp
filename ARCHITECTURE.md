# 系統架構文檔

## 📐 整體架構

```
┌─────────────────────────────────────────────────────────────┐
│                       LINE Platform                          │
│  ┌─────────────┐         ┌──────────────┐                  │
│  │ LINE Login  │◄────────┤ LIFF SDK     │                  │
│  └─────────────┘         └──────────────┘                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ OAuth 2.0
                               │ User Profile
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                      │
│                     (Vue 3 + Vite)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  UI Layer (Vant 4)                    │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │  Calendar  │  │  Schedule  │  │  Settings  │     │  │
│  │  │   Views    │  │   Editor   │  │   Page     │     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              State Management (Pinia)                 │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │
│  │  │   User   │  │ Schedule │  │ Calendar │          │  │
│  │  │  Store   │  │  Store   │  │  Store   │          │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘          │  │
│  └───────┼─────────────┼──────────────┼────────────────┘  │
│          │             │              │                     │
│  ┌───────▼─────────────▼──────────────▼────────────────┐  │
│  │              Business Logic Layer                     │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────┐        │  │
│  │  │ useLiff │  │useCalendar│  │useNotification│      │  │
│  │  └─────────┘  └──────────┘  └─────────────┘        │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Data Persistence Layer                   │  │
│  │                   (LocalStorage)                      │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  User Data (Isolated by LINE User ID)        │   │  │
│  │  │  • Schedules                                  │   │  │
│  │  │  • Categories                                 │   │  │
│  │  │  • Preferences                                │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                               │
                               │ Notifications
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Browser Notification API                        │
│  (Local notifications triggered by setTimeout)              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 數據流程

### 1. 用戶認證流程

```
用戶打開 LIFF URL
       │
       ▼
LIFF SDK 初始化 (liff.init)
       │
       ├─────► 已登錄？
       │         │
       │         ├─ YES ──► 獲取用戶資料 (liff.getProfile)
       │         │                │
       │         │                ▼
       │         │         存儲到 User Store
       │         │                │
       │         │                ▼
       │         │         加載用戶數據 (LocalStorage)
       │         │                │
       │         │                ▼
       │         │         渲染應用界面
       │         │
       │         └─ NO ──► 跳轉 LINE 登錄頁面
       │                         │
       │                         ▼
       │                   用戶授權
       │                         │
       │                         ▼
       └───────────────────► 返回應用（已登錄）
```

### 2. 日程創建流程

```
用戶點擊「+」按鈕
       │
       ▼
打開 ScheduleEditor 組件
       │
       ▼
用戶填寫表單
 • 標題
 • 時間
 • 類別
 • 提醒設置
       │
       ▼
點擊「保存」
       │
       ▼
表單驗證
       │
       ├─ 失敗 ──► 顯示錯誤提示
       │
       └─ 成功 ──► scheduleStore.createSchedule()
                           │
                           ▼
                   生成唯一 ID (UUID)
                           │
                           ▼
                   添加到 schedules 數組
                           │
                           ▼
                   保存到 LocalStorage
                           │
                           ▼
                   啟用提醒？
                      │
                      ├─ YES ──► scheduleNotification()
                      │                │
                      │                ▼
                      │          計算提醒時間
                      │                │
                      │                ▼
                      │          setTimeout 調度
                      │                │
                      │                ▼
                      │          存儲 timeoutId
                      │
                      └─ NO ──► 完成
                           │
                           ▼
                   更新 UI 顯示
                           │
                           ▼
                   返回日曆頁面
```

### 3. 通知提醒流程

```
應用啟動
       │
       ▼
加載所有日程
       │
       ▼
rescheduleAll() - 重新調度所有通知
       │
       ▼
遍歷每個日程
       │
       ├─────► 提醒已啟用？
       │           │
       │           ├─ NO ──► 跳過
       │           │
       │           └─ YES ──► 計算提醒時間
       │                           │
       │                           ▼
       │                     時間在未來 24 小時內？
       │                           │
       │                           ├─ NO ──► 跳過
       │                           │
       │                           └─ YES ──► 調度通知
       │                                           │
       └───────────────────────────────────────────┘
                           │
                           ▼
              到達提醒時間（setTimeout 觸發）
                           │
                           ▼
              創建瀏覽器通知 (new Notification)
                           │
                           ▼
              顯示通知內容：
               • 標題
               • 描述
               • 時間
                           │
                           ▼
              用戶點擊通知？
                      │
                      ├─ YES ──► 打開應用並跳轉到該日程
                      │
                      └─ NO ──► 通知自動關閉
```

## 📦 模塊結構

### 核心模塊

#### 1. LIFF Integration (`src/composables/useLiff.js`)

**職責**：
- 初始化 LIFF SDK
- 處理用戶認證
- 獲取用戶資料
- 提供 Mock 模式支持

**關鍵 API**：
```javascript
{
  initLiff()      // 初始化 LIFF
  login()         // 執行登錄
  logout()        // 登出
  getUserProfile()// 獲取用戶資料
  isInClient()    // 檢查是否在 LINE 客戶端
  closeWindow()   // 關閉 LIFF 視窗
}
```

#### 2. State Management

**User Store** (`src/stores/user.js`)
```javascript
{
  state: {
    profile,        // LINE 用戶資料
    preferences,    // 用戶偏好設置
    isAuthenticated // 認證狀態
  },
  actions: {
    setProfile(),
    updatePreferences(),
    logout()
  }
}
```

**Schedule Store** (`src/stores/schedule.js`)
```javascript
{
  state: {
    schedules,      // 所有日程
    loading,        // 加載狀態
    error          // 錯誤信息
  },
  getters: {
    getSchedulesByDate(),    // 按日期查詢
    getSchedulesByRange(),   // 按範圍查詢
    upcomingSchedules(),     // 即將到來的日程
    todaySchedules()         // 今日日程
  },
  actions: {
    loadSchedules(),         // 加載數據
    createSchedule(),        // 創建
    updateSchedule(),        // 更新
    deleteSchedule(),        // 刪除
    toggleComplete()         // 標記完成
  }
}
```

**Calendar Store** (`src/stores/calendar.js`)
```javascript
{
  state: {
    currentDate,    // 當前顯示日期
    viewMode,       // 視圖模式（月/週）
    selectedDate    // 選中的日期
  },
  actions: {
    setCurrentDate(),
    setViewMode(),
    goToToday(),
    goNext(),
    goPrev()
  }
}
```

#### 3. Business Logic

**Calendar Logic** (`src/composables/useCalendar.js`)
```javascript
{
  monthGrid,          // 月視圖網格（42 天）
  weekDays,           // 當前週的日期
  goNext(),           // 下一個月/週
  goPrev(),           // 上一個月/週
  goToToday(),        // 返回今天
  isToday(),          // 判斷是否今天
  getScheduleCount()  // 獲取日程數量
}
```

**Notification System** (`src/composables/useNotification.js`)
```javascript
{
  requestPermission(),      // 請求通知權限
  scheduleNotification(),   // 調度單個通知
  cancelNotification(),     // 取消通知
  rescheduleAll(),          // 重新調度所有
  sendScheduleReminder(),   // 發送提醒
  cleanupExpired()          // 清理過期通知
}
```

#### 4. Data Persistence

**Storage Service** (`src/utils/storage.js`)
```javascript
class StorageService {
  // 用戶數據隔離
  getUserKey(key, userId)

  // CRUD 操作
  getSchedules(userId)
  saveSchedules(schedules, userId)
  addSchedule(schedule, userId)
  updateSchedule(id, updates, userId)
  deleteSchedule(id, userId)

  // 數據管理
  exportData(userId)
  importData(data, userId)
  clearUserData(userId)
}
```

**LocalStorage 鍵值結構**：
```
lineminiapp_user_U1234567890        → 用戶資料
lineminiapp_schedules_U1234567890   → 日程數據
lineminiapp_categories_U1234567890  → 自定義類別
lineminiapp_prefs_U1234567890       → 用戶偏好
lineminiapp_last_user               → 最後登錄用戶
lineminiapp_version                 → 數據版本
```

## 🎨 UI 組件層次

```
App.vue
 │
 ├─ AppHeader.vue (頁面標題)
 │
 ├─ router-view (路由視圖)
 │   │
 │   ├─ Home.vue (首頁 - 日曆)
 │   │   ├─ CalendarHeader.vue
 │   │   ├─ MonthView.vue
 │   │   │   └─ DateCell.vue (×42)
 │   │   └─ WeekView.vue
 │   │       └─ ScheduleItem.vue (×N)
 │   │
 │   ├─ ScheduleList.vue (列表頁)
 │   │   ├─ SearchBar.vue
 │   │   ├─ FilterBar.vue
 │   │   └─ ScheduleItem.vue (×N)
 │   │
 │   ├─ ScheduleCreate.vue (創建頁)
 │   │   └─ ScheduleEditor.vue
 │   │       ├─ CategoryPicker.vue
 │   │       ├─ ColorPicker.vue
 │   │       └─ ReminderPicker.vue
 │   │
 │   ├─ ScheduleEdit.vue (編輯頁)
 │   │   └─ ScheduleEditor.vue (復用)
 │   │
 │   └─ Settings.vue (設置頁)
 │       ├─ NotificationSettings.vue
 │       ├─ ViewSettings.vue
 │       └─ DataManagement.vue
 │
 └─ AppTabbar.vue (底部導航欄)
```

## 🔐 數據安全

### 用戶數據隔離

每個 LINE 用戶的數據完全隔離：

```javascript
// 用戶 A (U111111111)
localStorage.getItem('lineminiapp_schedules_U111111111')
// → 僅返回用戶 A 的數據

// 用戶 B (U222222222)
localStorage.getItem('lineminiapp_schedules_U222222222')
// → 僅返回用戶 B 的數據
```

### 數據驗證

所有 LocalStorage 讀取都經過驗證：

```javascript
try {
  const data = JSON.parse(localStorage.getItem(key))

  // 驗證數據結構
  if (!Array.isArray(data.schedules)) {
    throw new Error('Invalid data format')
  }

  // 驗證每個日程
  data.schedules = data.schedules.filter(schedule => {
    return schedule.id &&
           schedule.userId === currentUserId &&
           schedule.title
  })

  return data
} catch (error) {
  console.error('Data validation failed:', error)
  return { schedules: [] }
}
```

## ⚡ 性能優化

### 1. 代碼分割

```javascript
// 路由懶加載
const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/schedules',
    component: () => import('@/views/ScheduleList.vue')
  }
]
```

**構建結果**：
- 主入口：~162 KB
- 路由塊：1-10 KB each
- 總下載：按需加載

### 2. 組件緩存

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="['Home', 'ScheduleList']">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

### 3. 計算屬性緩存

```javascript
// 使用 computed 緩存計算結果
const monthGrid = computed(() => {
  return getMonthCalendarGrid(currentDate.value, weekStartsOn.value)
})

// 只在 currentDate 或 weekStartsOn 變化時重新計算
```

### 4. LocalStorage 批量操作

```javascript
// 避免頻繁寫入
let pendingWrites = []
let writeTimer = null

function scheduleWrite(data) {
  pendingWrites.push(data)

  clearTimeout(writeTimer)
  writeTimer = setTimeout(() => {
    // 批量寫入
    const merged = mergePendingWrites(pendingWrites)
    localStorage.setItem(key, JSON.stringify(merged))
    pendingWrites = []
  }, 100)
}
```

## 🚀 部署流程

### CI/CD 流程

```
開發者推送代碼
       │
       ▼
GitHub Actions 觸發
       │
       ▼
安裝 Node.js 18
       │
       ▼
npm ci (安裝依賴)
       │
       ▼
npm run build (構建)
 • 注入 VITE_LIFF_ID
 • 設置 production 環境
 • 代碼壓縮優化
       │
       ▼
生成 dist/ 目錄
       │
       ▼
上傳到 GitHub Pages
       │
       ▼
部署完成
       │
       ▼
可訪問：https://username.github.io/lineminiapp/
```

### 構建產物

```
dist/
├── index.html                    # 入口 HTML
├── assets/
│   ├── index-[hash].js          # 主應用（162 KB）
│   ├── vendor-vue-[hash].js     # Vue 核心（103 KB）
│   ├── vendor-ui-[hash].js      # Vant UI（72 KB）
│   ├── Home-[hash].js           # 首頁（6.3 KB）
│   ├── ScheduleList-[hash].js   # 列表頁（3.2 KB）
│   └── ... (其他路由塊)
└── favicon.ico
```

## 📊 數據模型

### Schedule 數據結構

```typescript
interface Schedule {
  id: string                    // UUID v4
  userId: string                // LINE User ID
  title: string                 // 標題（必填）
  description?: string          // 描述（可選）

  // 時間
  startDate: string            // YYYY-MM-DD
  startTime: string            // HH:mm
  endDate: string              // YYYY-MM-DD
  endTime: string              // HH:mm
  isAllDay: boolean            // 全天事件

  // 分類
  category: CategoryId         // 類別 ID
  tags: string[]               // 標籤數組
  color: string                // 顏色（HEX）

  // 提醒
  reminder: {
    enabled: boolean
    type: 'local' | 'line'
    time: number               // 數值
    unit: 'minutes' | 'hours' | 'days'
  }

  // 元數據
  createdAt: string            // ISO 8601
  updatedAt: string            // ISO 8601
  isCompleted: boolean         // 完成狀態
  isDeleted: boolean           // 軟刪除標記
}
```

### Category 數據結構

```typescript
interface Category {
  id: string
  label: string
  color: string               // HEX 顏色
  icon: string                // Emoji 圖標
  isDefault: boolean          // 預設類別
  userId?: string             // 自定義類別的用戶 ID
}
```

## 🔧 擴展性

### 添加新功能

#### 1. 添加新的日程字段

```javascript
// 1. 更新數據模型
interface Schedule {
  // ... 現有欄位
  location?: string          // 新增：地點
  attendees?: string[]       // 新增：參與者
}

// 2. 更新 ScheduleEditor 組件
<van-field v-model="form.location" label="地點" />

// 3. 更新存儲服務
// StorageService 自動支持新欄位
```

#### 2. 整合外部服務

```javascript
// 整合 Google Calendar
// src/services/googleCalendar.js

export async function syncToGoogle(schedule) {
  // OAuth 認證
  const token = await getGoogleAuthToken()

  // 轉換數據格式
  const event = convertToGoogleFormat(schedule)

  // API 調用
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  })

  return response.json()
}
```

#### 3. 添加新視圖模式

```javascript
// 1. 定義新視圖
// src/utils/constants.js
export const VIEW_MODES = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',        // 現有
  AGENDA: 'agenda'    // 新增：議程視圖
}

// 2. 創建視圖組件
// src/components/calendar/AgendaView.vue

// 3. 在路由中注冊
// src/router/index.js
```

## 📈 監控與分析

### 錯誤追蹤

```javascript
// 全局錯誤處理
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)

  // 可選：發送到錯誤追蹤服務
  // sendToSentry(err, { instance, info })
}
```

### 性能監控

```javascript
// 頁面加載時間
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0]
  console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms')
})

// API 響應時間
const startTime = performance.now()
await someAsyncOperation()
const endTime = performance.now()
console.log('Operation took:', endTime - startTime, 'ms')
```

---

**文檔版本**：1.0
**最後更新**：2024-02-10
