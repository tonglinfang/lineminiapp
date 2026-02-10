# 故障排除指南

本文档提供常見問題的快速解決方案。

---

## 快速運行項目

### 本地開發（5分鐘）

```bash
# 1. 安裝依賴
npm install

# 2. 創建環境變量（Mock 模式）
cat > .env.development << EOF
VITE_LIFF_ID=随便填
VITE_LIFF_MOCK=true
VITE_APP_TITLE=日程管理
VITE_APP_ENV=development
EOF

# 3. 啟動開發服務器
npm run dev

# 4. 訪問 http://localhost:5173/
```

**說明**：Mock 模式使用假用戶數據，無需真實 LIFF ID，所有功能正常可用。

---

## 部署到 GitHub Pages

### 第 1 步：獲取 LIFF ID

1. 訪問 https://developers.line.biz/console/
2. 創建 Provider 和 LINE Login Channel
3. 添加 LIFF App：
   - **Size**: Full
   - **Endpoint URL**: `https://你的用戶名.github.io/lineminiapp/`
   - **Scope**: ☑ profile, ☑ openid
4. 複製 **LIFF ID**（格式：`1234567890-abcdefgh`）

### 第 2 步：設置 GitHub

1. **創建倉庫**（必須 Public）
2. **設置 Secret**：
   - 前往：`Settings → Secrets and variables → Actions`
   - 新建 Secret：
     - Name: `VITE_LIFF_ID`
     - Value: 你的 LIFF ID
3. **啟用 GitHub Pages**：
   - 前往：`Settings → Pages`
   - Source: **GitHub Actions**

### 第 3 步：推送代碼

```bash
# 1. 修改 vite.config.js 的倉庫名
# base: '/lineminiapp/' 改為你的實際倉庫名

# 2. 推送代碼
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用戶名/倉庫名.git
git push -u origin main
```

### 第 4 步：等待部署

1. 前往 `Actions` 標籤頁
2. 等待綠色 ✅（2-3 分鐘）
3. 部署成功後訪問：`https://你的用戶名.github.io/倉庫名/`

---

## 常見問題

### ❌ 問題 1：部署後顯示 404

**原因**：`vite.config.js` 的 base 路徑配置錯誤

**解決方案**：

1. 檢查 `vite.config.js`：
   ```javascript
   base: process.env.NODE_ENV === 'production'
     ? '/你的實際倉庫名/'  // ← 必須與 GitHub 倉庫名一致
     : '/',
   ```

2. 確認：
   - ✅ 倉庫名正確
   - ✅ 前後都有斜線：`/倉庫名/`
   - ✅ **不包含** https 或域名

3. 推送更新：
   ```bash
   git add vite.config.js
   git commit -m "Fix base URL"
   git push
   ```

**其他檢查項**：
- ✅ GitHub Pages Source 設置為 **GitHub Actions**
- ✅ 倉庫為 **Public**（不是 Private）
- ✅ Actions 工作流顯示綠色 ✅

---

### ❌ 問題 2：打開後沒有登錄狀態

**原因 1**：使用了錯誤的 URL

❌ **錯誤**：直接訪問 `https://你的用戶名.github.io/lineminiapp/`
✅ **正確**：使用 LIFF URL `https://liff.line.me/你的LIFF-ID`

**獲取正確的 LIFF URL**：
1. 登錄 LINE Developers Console
2. 進入 Channel → LIFF 標籤頁
3. 複製 **LIFF URL**（格式：`https://liff.line.me/1234567890-abcdefgh`）

**原因 2**：LIFF ID 未配置

**解決方案**：
1. 前往：`https://github.com/你的用戶名/倉庫名/settings/secrets/actions`
2. 檢查是否有 `VITE_LIFF_ID`
3. 如果沒有或錯誤，添加/更新：
   - Name: `VITE_LIFF_ID`
   - Value: 你的完整 LIFF ID
4. 觸發重新部署：
   ```bash
   git commit --allow-empty -m "Update LIFF config"
   git push
   ```

---

### ❌ 問題 3：登錄後沒有顯示用戶信息

**原因**：LIFF Scope 配置錯誤

**解決方案**：

#### 步驟 1：檢查 Scope 配置

1. 訪問 LINE Developers Console
2. 進入 Channel → LIFF → 編輯 LIFF 應用
3. 確認 Scope 設置：
   ```
   ☑ profile   ← 必須勾選！
   ☑ openid    ← 必須勾選！
   ```
4. 如果沒勾選，勾選後點擊 **Update**

#### 步驟 2：刪除舊授權

**iOS**：
1. LINE 設置 → 隱私管理 → 與 LINE 連接的服務
2. 找到應用 → 解除連接

**Android**：
1. LINE 設置 → 隱私 → 已連接的應用程式
2. 找到應用 → 解除授權

#### 步驟 3：重新授權

1. 在 LINE 中打開 LIFF URL：
   ```
   https://liff.line.me/你的LIFF-ID
   ```
2. 確認授權頁面顯示：
   ```
   日程管理 想要訪問：
   ☑ 您的個人資料  ← 必須看到這一行

   [拒絕] [同意]
   ```
3. 點擊 **同意**

#### 步驟 4：驗證

1. 進入應用的 **設置** 頁面
2. 應該看到：
   - ✅ 您的 LINE 頭像
   - ✅ 您的 LINE 名稱
   - ✅ 您的 User ID

---

## 配置檢查清單

部署前確認：

### LINE Developers Console
- [ ] Provider 已創建
- [ ] LINE Login Channel 已創建
- [ ] LIFF App 已添加
- [ ] LIFF ID 已複製
- [ ] Endpoint URL：`https://你的用戶名.github.io/倉庫名/`
- [ ] Scope：☑ profile ☑ openid
- [ ] Size：Full

### GitHub 配置
- [ ] 倉庫已創建（Public）
- [ ] Secret `VITE_LIFF_ID` 已設置
- [ ] GitHub Pages 已啟用（Source: GitHub Actions）
- [ ] Actions 工作流運行成功（綠色 ✅）

### 代碼配置
- [ ] `vite.config.js` 的 base 路徑正確
- [ ] 代碼已推送到 GitHub
- [ ] 部署完成（等待 2-3 分鐘）

### 測試驗證
- [ ] 使用 LIFF URL 在 LINE 中打開
- [ ] 看到授權頁面或直接登錄
- [ ] 用戶信息正常顯示
- [ ] 可以創建和查看日程

---

## URL 說明

### 三種 URL 的區別

| URL 類型 | 格式 | 用途 |
|---------|------|------|
| **LIFF URL** | `https://liff.line.me/1234567890-abcdefgh` | **用戶訪問地址**（在 LINE 中打開） |
| **Endpoint URL** | `https://你的用戶名.github.io/倉庫名/` | LIFF 設置中配置（代碼部署位置） |
| **GitHub Pages URL** | `https://你的用戶名.github.io/倉庫名/` | 同 Endpoint URL（不直接訪問） |

**重要**：
- ✅ 用戶應該訪問 **LIFF URL**
- ❌ 不要直接訪問 GitHub Pages URL
- ✅ Endpoint URL 在 LINE Developers Console 中配置

---

## 快速命令參考

### 本地開發
```bash
npm install              # 安裝依賴
npm run dev             # 啟動開發服務器
npm run build           # 構建生產版本
npm run preview         # 預覽生產版本
```

### Git 操作
```bash
git status              # 查看狀態
git add .               # 添加所有文件
git commit -m "msg"     # 提交
git push                # 推送到遠程
git commit --allow-empty -m "Trigger deploy"  # 觸發重新部署
```

### 故障排查
```bash
# 查看遠程倉庫
git remote -v

# 查看提交歷史
git log --oneline -5

# 查看分支狀態
git branch -vv

# 重新構建
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

---

## 獲取幫助

### 檢查日誌

1. **GitHub Actions 日誌**：
   ```
   https://github.com/你的用戶名/倉庫名/actions
   ```
   查看構建和部署日誌

2. **瀏覽器控制台**：
   - 在 LINE 中打開應用
   - 查看開發者工具 Console
   - 尋找錯誤信息

### 常用鏈接

- **LINE Developers Console**: https://developers.line.biz/console/
- **GitHub Repository**: https://github.com/你的用戶名/倉庫名
- **GitHub Actions**: https://github.com/你的用戶名/倉庫名/actions
- **GitHub Pages Settings**: https://github.com/你的用戶名/倉庫名/settings/pages
- **GitHub Secrets**: https://github.com/你的用戶名/倉庫名/settings/secrets/actions
- **LIFF Inspector**: https://liff-inspector.line.me/

### 文檔

- 完整使用手冊：[USER_MANUAL.md](USER_MANUAL.md)
- 部署詳細說明：[DEPLOYMENT.md](DEPLOYMENT.md)
- 快速入門：[QUICK_START.md](QUICK_START.md)
- 配置清單：[CONFIGURATION_CHECKLIST.md](CONFIGURATION_CHECKLIST.md)

---

## 常見錯誤代碼

### LIFF 錯誤

| 錯誤 | 原因 | 解決方案 |
|------|------|---------|
| `LIFF ID is not configured` | LIFF ID 未設置 | 設置 GitHub Secret |
| `Invalid redirect URI` | Endpoint URL 不匹配 | 檢查 LINE Console 配置 |
| `Failed to fetch user profile` | Scope 未包含 profile | 勾選 profile scope |
| `LIFF init failed` | LIFF ID 錯誤 | 檢查 LIFF ID 是否正確 |

### 部署錯誤

| 錯誤 | 原因 | 解決方案 |
|------|------|---------|
| 404 Not Found | base URL 錯誤 | 檢查 vite.config.js |
| Build failed | 依賴安裝失敗 | 檢查 package.json |
| Permission denied | 權限不足 | 檢查 workflow permissions |
| Secret not found | Secret 未設置 | 添加 VITE_LIFF_ID |

---

**最後更新**：2024-02-10
**版本**：1.0

如有其他問題，請參考完整文檔或在 GitHub 提交 Issue。
