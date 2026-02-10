# LINE Mini App 日程管理系統 - 完整使用手冊

## 📋 目錄

1. [系統簡介](#系統簡介)
2. [前置準備](#前置準備)
3. [LINE 開發者帳號設置](#line-開發者帳號設置)
4. [本地開發環境配置](#本地開發環境配置)
5. [GitHub 部署配置](#github-部署配置)
6. [應用使用指南](#應用使用指南)
7. [常見問題解答](#常見問題解答)
8. [進階設定](#進階設定)

---

## 系統簡介

### 功能特色

這是一個基於 LINE Mini App (LIFF) 的個人日程管理系統，主要功能包括：

- ✅ **日程管理**：創建、編輯、刪除日程
- 📅 **多種視圖**：月視圖、週視圖切換
- 🏷️ **分類標籤**：支持自定義分類和標籤
- 🔔 **提醒通知**：瀏覽器本地通知提醒
- 💾 **離線存儲**：數據存儲在瀏覽器本地，無需後端服務器
- 🔒 **數據隔離**：每個 LINE 用戶的數據完全獨立

### 技術架構

- **前端框架**：Vue 3 + Vite
- **UI 組件**：Vant 4（專為移動端優化）
- **狀態管理**：Pinia
- **數據存儲**：瀏覽器 LocalStorage
- **部署平台**：GitHub Pages（免費）

---

## 前置準備

### 必需項目

1. **LINE 帳號**
   - 需要有 LINE 帳號用於登錄
   - 建議使用手機版 LINE 進行測試

2. **LINE Developers 帳號**
   - 用於創建 LIFF 應用
   - 網址：https://developers.line.biz/

3. **GitHub 帳號**
   - 用於托管代碼和部署
   - 網址：https://github.com/

4. **開發環境**（僅本地開發需要）
   - Node.js 16+ 版本
   - npm 或 yarn 包管理器
   - Git 版本控制工具

### 可選工具

- **ngrok**：用於本地 HTTPS 測試（https://ngrok.com/）
- **VS Code**：推薦的代碼編輯器

---

## LINE 開發者帳號設置

### 步驟 1：創建 Provider

1. 訪問 [LINE Developers Console](https://developers.line.biz/console/)
2. 點擊 **Create a new provider**
3. 輸入 Provider 名稱（例如：MyCompany）
4. 點擊 **Create**

### 步驟 2：創建 LINE Login Channel

1. 在 Provider 頁面，點擊 **Create a new channel**
2. 選擇 **LINE Login** 類型
3. 填寫 Channel 基本信息：
   - **Channel name**：日程管理系統
   - **Channel description**：個人日程管理應用
   - **App types**：勾選 **Web app**
4. 點擊 **Create**

### 步驟 3：創建 LIFF App

1. 進入剛創建的 Channel
2. 切換到 **LIFF** 標籤頁
3. 點擊 **Add**
4. 填寫 LIFF 應用信息：

   ```
   LIFF app name: 日程管理
   Size: Full
   Endpoint URL: https://yourusername.github.io/lineminiapp/
   Scope: 勾選 profile, openid
   Bot link feature: Off（暫不需要）
   ```

5. 點擊 **Add** 完成創建

### 步驟 4：獲取 LIFF ID

創建成功後，您會看到 **LIFF ID**，格式類似：`1234567890-abcdefgh`

⚠️ **重要**：請妥善保存此 LIFF ID，後續配置需要使用。

### 步驟 5：設置 Endpoint URL（部署後配置）

部署到 GitHub Pages 後，需要更新 Endpoint URL：

1. 返回 LIFF 設置頁面
2. 點擊 **Edit**
3. 將 **Endpoint URL** 更新為您的實際部署地址
   - 格式：`https://[你的GitHub用戶名].github.io/[倉庫名]/`
   - 例如：`https://johndoe.github.io/lineminiapp/`
4. 點擊 **Update**

---

## 本地開發環境配置

### 步驟 1：克隆代碼

```bash
# 克隆倉庫到本地
git clone https://github.com/yourusername/lineminiapp.git
cd lineminiapp

# 查看項目結構
ls -la
```

### 步驟 2：安裝依賴

```bash
# 使用 npm 安裝
npm install

# 或使用 yarn
yarn install
```

安裝過程需要 2-5 分鐘，請耐心等待。

### 步驟 3：配置環境變量

創建 `.env.development` 文件：

```bash
# 複製環境變量模板
cp .env.example .env.development

# 編輯配置文件
nano .env.development
```

填入以下內容：

```env
# LIFF ID（從 LINE Developers Console 獲取）
VITE_LIFF_ID=你的-LIFF-ID-在這裡

# 開發模式：設為 true 可在無 LIFF 環境下測試
VITE_LIFF_MOCK=false

# 應用標題
VITE_APP_TITLE=日程管理

# 環境標識
VITE_APP_ENV=development
```

### 步驟 4：啟動開發服務器

```bash
# 啟動開發服務器
npm run dev
```

看到以下輸出表示啟動成功：

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

### 步驟 5：本地測試（Mock 模式）

如果暫時沒有 LIFF ID，可以使用 Mock 模式進行開發：

1. 修改 `.env.development`：
   ```env
   VITE_LIFF_MOCK=true
   ```

2. 重新啟動開發服務器

3. 打開瀏覽器訪問 `http://localhost:5173/`

Mock 模式會創建一個虛擬用戶：
- 用戶名：測試用戶
- User ID：U1234567890abcdef

### 步驟 6：HTTPS 測試（使用 ngrok）

⚠️ LIFF 要求必須使用 HTTPS，本地測試需要 ngrok：

1. 下載並安裝 ngrok：https://ngrok.com/download

2. 啟動開發服務器（在一個終端）：
   ```bash
   npm run dev
   ```

3. 啟動 ngrok（在另一個終端）：
   ```bash
   ngrok http 5173
   ```

4. 複製 ngrok 提供的 HTTPS URL：
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:5173
   ```

5. 在 LINE Developers Console 中，將此 URL 設置為 LIFF Endpoint URL

6. 在 LINE 手機應用中測試 LIFF URL

---

## GitHub 部署配置

### 步驟 1：創建 GitHub 倉庫

1. 登錄 GitHub
2. 點擊右上角 **+** → **New repository**
3. 填寫倉庫信息：
   - **Repository name**：`lineminiapp`
   - **Visibility**：Public（必須為 Public 才能使用 GitHub Pages）
   - **Initialize**：不勾選任何選項（因為已有本地代碼）
4. 點擊 **Create repository**

### 步驟 2：推送代碼到 GitHub

```bash
# 初始化 git（如果還沒初始化）
git init

# 添加所有文件
git add .

# 創建首次提交
git commit -m "Initial commit: LINE Mini App Schedule Management System

- LIFF integration with mock mode support
- Complete schedule CRUD operations
- Calendar views (month/week)
- Notification system
- Category and tag management
- GitHub Pages deployment configuration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 添加遠程倉庫
git remote add origin https://github.com/yourusername/lineminiapp.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 步驟 3：配置 GitHub Secrets

1. 在 GitHub 倉庫頁面，點擊 **Settings**
2. 左側菜單選擇 **Secrets and variables** → **Actions**
3. 點擊 **New repository secret**
4. 添加 Secret：
   - **Name**: `VITE_LIFF_ID`
   - **Value**: 你的 LIFF ID（例如：`1234567890-abcdefgh`）
5. 點擊 **Add secret**

### 步驟 4：啟用 GitHub Pages

1. 在倉庫頁面，點擊 **Settings**
2. 左側菜單選擇 **Pages**
3. **Source** 選擇 **GitHub Actions**
4. 點擊 **Save**

### 步驟 5：更新 Base URL

⚠️ **重要**：需要修改 `vite.config.js` 中的 base URL：

```javascript
// vite.config.js
export default defineConfig({
  // ... 其他配置
  base: process.env.NODE_ENV === 'production'
    ? '/lineminiapp/'  // ← 改為你的倉庫名
    : '/',
})
```

如果倉庫名不是 `lineminiapp`，請改為實際的倉庫名。

提交並推送更改：

```bash
git add vite.config.js
git commit -m "Update base URL for GitHub Pages"
git push origin main
```

### 步驟 6：等待部署完成

1. 前往 **Actions** 標籤頁
2. 查看部署工作流狀態
3. 等待綠色勾選（約 2-3 分鐘）
4. 部署成功後，訪問：`https://yourusername.github.io/lineminiapp/`

### 步驟 7：更新 LIFF Endpoint URL

回到 LINE Developers Console，更新 LIFF Endpoint URL 為：

```
https://yourusername.github.io/lineminiapp/
```

---

## 應用使用指南

### 首次使用

1. **在 LINE 中打開應用**
   - 方式 1：在 LINE 聊天中發送 LIFF URL
   - 方式 2：掃描 LIFF QR Code
   - 方式 3：在 LINE 瀏覽器中直接訪問 URL

2. **授權登錄**
   - 首次使用會提示授權
   - 點擊 **同意** 授予權限
   - 授權項目：查看個人資料

3. **啟用通知（可選）**
   - 系統會請求通知權限
   - 點擊 **允許** 以接收日程提醒
   - 可在設置中隨時開關

### 日曆視圖操作

#### 月視圖

![月視圖示意]

- **當前日期**：以藍色圓圈標識
- **有日程的日期**：顯示彩色圓點徽章
- **點擊日期**：查看該日的所有日程
- **左右箭頭**：切換上/下個月
- **今天按鈕**：快速返回當前月份

#### 週視圖

- **顯示一週日程**：橫向滾動查看
- **時間軸**：顯示日程開始和結束時間
- **點擊日程卡片**：查看詳情或編輯

### 創建日程

#### 方法 1：通過浮動按鈕

1. 點擊右下角 **+** 按鈕
2. 填寫日程信息（見下方）
3. 點擊 **保存**

#### 方法 2：點擊日期

1. 在月視圖中點擊某個日期
2. 點擊 **新增日程**
3. 系統自動填入選中的日期

#### 日程信息表單

**基本信息：**
- **標題**（必填）：例如「團隊會議」
- **描述**（可選）：詳細說明

**時間設置：**
- **開始日期/時間**：選擇日程開始時間
- **結束日期/時間**：選擇日程結束時間
- **全天事件**：開關切換（開啟後不顯示具體時間）

**分類與標籤：**
- **類別**：選擇預設類別
  - 🔵 工作（藍色）
  - 🟢 個人（綠色）
  - 🔴 健康（紅色）
  - 🟡 學習（黃色）
  - 🟣 娛樂（紫色）
- **標籤**：輸入自定義標籤（用逗號分隔）
- **顏色**：選擇日程顏色標記

**提醒設置：**
- **啟用提醒**：開關切換
- **提醒時間**：
  - 15 分鐘前
  - 30 分鐘前
  - 1 小時前
  - 1 天前
  - 自定義

### 編輯日程

1. **進入編輯頁面**：
   - 方式 1：點擊日程卡片
   - 方式 2：在列表視圖中點擊日程

2. **修改信息**：
   - 更新任何欄位
   - 點擊 **保存** 確認更改

3. **快捷操作**：
   - **標記完成**：勾選複選框
   - **刪除**：左滑卡片或點擊刪除按鈕

### 刪除日程

#### 方法 1：左滑刪除

1. 在列表視圖中，向左滑動日程卡片
2. 點擊紅色 **刪除** 按鈕
3. 確認刪除

#### 方法 2：編輯頁面刪除

1. 打開日程編輯頁面
2. 滑到底部，點擊 **刪除日程**
3. 確認刪除

⚠️ **注意**：刪除使用軟刪除機制，數據不會立即消失，可在設置中恢復。

### 通知管理

#### 接收通知

- **前提條件**：
  - 瀏覽器已授予通知權限
  - 應用在後台運行（瀏覽器未關閉）
  - 設置了提醒的日程

- **通知內容**：
  - 日程標題
  - 開始時間
  - 描述（前50字）

- **點擊通知**：
  - 打開應用並跳轉到該日程

#### 限制說明

⚠️ **重要限制**：
- 通知僅在瀏覽器打開時有效
- 建議將應用添加到主屏幕並保持後台運行
- 未來版本將支持 LINE 推送通知

### 列表視圖

1. 點擊底部導航欄的 **列表** 圖標
2. 查看所有日程（按日期分組）
3. 功能：
   - **搜索**：輸入關鍵字搜索日程
   - **篩選**：按類別篩選
   - **排序**：按時間或類別排序

### 設置頁面

點擊底部導航欄的 **設置** 圖標，可進行以下配置：

#### 通知設置
- **啟用提醒**：總開關
- **默認提醒時間**：新建日程時的預設值
- **提醒音效**：選擇提示音

#### 視圖設置
- **默認視圖**：月視圖 / 週視圖
- **週起始日**：週日 / 週一
- **時間格式**：12 小時制 / 24 小時制

#### 數據管理
- **導出數據**：下載為 JSON 文件
- **導入數據**：從 JSON 文件恢復
- **清空數據**：刪除所有日程（謹慎操作）

#### 應用信息
- 版本號
- LIFF 狀態
- 用戶信息

---

## 常見問題解答

### Q1: 為什麼無法登錄？

**可能原因：**
- LIFF ID 配置錯誤
- Endpoint URL 不匹配
- 未在 LINE 瀏覽器中打開

**解決方法：**
1. 檢查 `.env.development` 中的 LIFF ID
2. 確認 LINE Developers Console 中的 Endpoint URL
3. 必須在 LINE 應用內打開（不能用普通瀏覽器）

### Q2: 本地開發如何測試？

**方案 1：Mock 模式**
```env
VITE_LIFF_MOCK=true
```

**方案 2：使用 ngrok**
```bash
npm run dev
# 另一個終端
ngrok http 5173
```

### Q3: 部署後顯示 404？

**檢查項目：**
1. `vite.config.js` 中的 `base` 是否正確
2. GitHub Pages 是否已啟用
3. GitHub Actions 工作流是否成功

**解決步驟：**
```javascript
// vite.config.js
base: '/你的實際倉庫名/'  // 必須與 GitHub 倉庫名一致
```

### Q4: 資產文件 404 錯誤？

**原因**：Base URL 配置錯誤

**解決**：
1. 檢查 `vite.config.js` 的 `base` 配置
2. 重新構建並部署：
   ```bash
   npm run build
   git add dist
   git commit -m "Fix base URL"
   git push
   ```

### Q5: 通知不工作？

**檢查清單：**
- ✅ 已授予瀏覽器通知權限
- ✅ 應用在後台運行（未關閉瀏覽器）
- ✅ 提醒時間在 24 小時內
- ✅ 日程的提醒開關已開啟

**瀏覽器設置檢查：**
```
Chrome: 設置 → 隱私和安全性 → 網站設置 → 通知
Safari: 偏好設置 → 網站 → 通知
```

### Q6: 數據會丟失嗎？

**數據存儲位置：**
- 瀏覽器 LocalStorage
- 按 LINE User ID 隔離

**可能丟失情況：**
- 清除瀏覽器緩存
- 卸載 LINE 應用（iOS）
- 手動刪除數據

**保護措施：**
- 定期導出數據（設置 → 導出數據）
- 保存 JSON 備份文件

### Q7: 多設備同步？

**當前版本：**
❌ 不支持多設備同步（數據存儲在本地）

**未來版本計劃：**
- 整合雲端存儲（Firebase / Supabase）
- 支持跨設備同步

**臨時方案：**
使用導出/導入功能手動同步：
1. 設備 A：導出數據
2. 傳送 JSON 文件到設備 B
3. 設備 B：導入數據

### Q8: 如何更新 LIFF ID？

**開發環境：**
修改 `.env.development` 文件

**生產環境：**
1. GitHub 倉庫 → Settings → Secrets
2. 編輯 `VITE_LIFF_ID`
3. 重新觸發部署（推送新提交）

### Q9: 應用加載緩慢？

**優化建議：**
1. 使用 CDN 加速（已配置）
2. 啟用瀏覽器緩存
3. 減少初始數據量（定期清理舊日程）

**檢查網絡：**
```bash
# 測試部署速度
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://yourusername.github.io/lineminiapp/
```

### Q10: 如何貢獻代碼？

1. Fork 倉庫
2. 創建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---

## 進階設定

### 自定義主題顏色

修改 `src/assets/styles/variables.css`：

```css
:root {
  /* 主色調 */
  --primary-color: #06C755;  /* LINE 綠色 */
  --line-green-dark: #05B04D;

  /* 自定義你的顏色 */
  --primary-color: #FF6B6B;  /* 改為紅色主題 */
}
```

### 添加自定義類別

修改 `src/utils/constants.js`：

```javascript
export const CATEGORIES = [
  { id: 'work', label: '工作', color: '#3b82f6', icon: '💼' },
  { id: 'personal', label: '個人', color: '#10b981', icon: '🏠' },
  // 添加新類別
  { id: 'custom', label: '自定義', color: '#f59e0b', icon: '⭐' },
]
```

### 修改默認提醒時間

修改 `src/utils/constants.js`：

```javascript
export const REMINDER_OPTIONS = [
  { label: '15 分鐘前', value: 15, unit: 'minutes' },
  { label: '30 分鐘前', value: 30, unit: 'minutes' },
  // 添加新選項
  { label: '2 小時前', value: 2, unit: 'hours' },
]
```

### 配置 LIFF 進階功能

在 LINE Developers Console 中：

1. **Scan QR**：允許掃描 QR Code
2. **BLE**：藍牙功能（實驗性）
3. **Module Mode**：嵌入到聊天室中

修改 `src/composables/useLiff.js`：

```javascript
await liff.init({
  liffId: config.liff.id,
  withLoginOnExternalBrowser: true,  // 外部瀏覽器登錄
})
```

### 整合 Google Calendar

未來版本功能，預計實現：

```javascript
// 導出到 Google Calendar
function exportToGoogleCalendar(schedule) {
  const event = {
    summary: schedule.title,
    description: schedule.description,
    start: { dateTime: schedule.startDate + 'T' + schedule.startTime },
    end: { dateTime: schedule.endDate + 'T' + schedule.endTime },
  }
  // Google Calendar API 調用
}
```

### 數據遷移工具

導出數據後，可用 Python 腳本轉換格式：

```python
import json

# 讀取導出的數據
with open('schedules.json', 'r') as f:
    data = json.load(f)

# 轉換為 CSV
import csv
with open('schedules.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['title', 'startDate', 'category'])
    writer.writeheader()
    for schedule in data['schedules']:
        writer.writerow({
            'title': schedule['title'],
            'startDate': schedule['startDate'],
            'category': schedule['category']
        })
```

---

## 技術支持

### 獲取幫助

- **GitHub Issues**：https://github.com/yourusername/lineminiapp/issues
- **文檔**：參考 DEPLOYMENT.md
- **LINE LIFF 文檔**：https://developers.line.biz/en/docs/liff/

### 錯誤回報

提交 Issue 時請包含：

1. **錯誤描述**：詳細說明問題
2. **重現步驟**：如何觸發錯誤
3. **環境信息**：
   - 瀏覽器版本
   - LINE 版本
   - 操作系統
4. **截圖**：如果可能，提供錯誤截圖
5. **控制台日誌**：瀏覽器開發者工具的錯誤信息

### 聯繫方式

- **Email**: your-email@example.com
- **LINE Official Account**: @yourlineoa

---

## 版本更新

### 當前版本：v1.0.0

**主要功能：**
- ✅ LIFF 整合
- ✅ 日程 CRUD
- ✅ 月/週視圖
- ✅ 本地通知
- ✅ 數據導出/導入

**計劃功能（v1.1.0）：**
- 🔄 重複日程支持
- 🔄 與 LINE 群組整合
- 🔄 日程分享功能
- 🔄 雲端同步（Firebase）

### 更新日誌

**2024-02-10 - v1.0.0**
- 初始版本發布
- 完整的日程管理功能
- GitHub Pages 部署支持

---

## 附錄

### A. 鍵盤快捷鍵

| 快捷鍵 | 功能 |
|--------|------|
| `N` | 新建日程 |
| `←` / `→` | 切換月份 |
| `T` | 返回今天 |
| `ESC` | 關閉彈窗 |
| `/` | 搜索日程 |

### B. LocalStorage 數據結構

```javascript
// lineminiapp_schedules_U1234567890
{
  "schedules": [
    {
      "id": "uuid",
      "userId": "U1234567890",
      "title": "會議",
      "startDate": "2024-02-15",
      "startTime": "14:00",
      // ... 其他欄位
    }
  ]
}
```

### C. API 參考（LIFF）

```javascript
// 獲取用戶資料
const profile = await liff.getProfile()
// profile.userId, profile.displayName, profile.pictureUrl

// 關閉 LIFF 視窗
liff.closeWindow()

// 發送訊息到聊天室（需要 openWindow）
liff.sendMessages([{ type: 'text', text: 'Hello' }])
```

### D. 故障排除命令

```bash
# 清除 node_modules 重新安裝
rm -rf node_modules package-lock.json
npm install

# 清除建置緩存
rm -rf dist .vite

# 重新構建
npm run build

# 查看建置輸出大小
du -sh dist/*

# 測試生產建置
npm run preview
```

---

**最後更新**：2024-02-10
**文檔版本**：1.0
**維護者**：您的名字

如有任何問題或建議，歡迎在 GitHub 提交 Issue！
