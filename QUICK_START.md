# 快速入門指南 🚀

這是一份 5 分鐘快速配置指南，幫助您快速部署 LINE Mini App。

## 📝 前置檢查清單

在開始之前，請確認：

- [ ] 有 LINE 帳號
- [ ] 有 GitHub 帳號
- [ ] 有 LINE Developers 帳號（免費註冊：https://developers.line.biz/）

## ⚡ 三步驟快速部署

### 步驟 1：獲取 LIFF ID（3 分鐘）

1. **訪問** [LINE Developers Console](https://developers.line.biz/console/)
2. **創建 Provider**（如果還沒有）
3. **創建 LINE Login Channel**
4. **添加 LIFF App**：
   ```
   Name: 日程管理
   Size: Full
   Endpoint URL: https://yourusername.github.io/lineminiapp/
   Scope: profile, openid
   ```
5. **複製 LIFF ID**（格式：`1234567890-abcdefgh`）

### 步驟 2：部署到 GitHub Pages（5 分鐘）

#### 2.1 推送代碼

```bash
# 在項目目錄下執行
git init
git add .
git commit -m "Initial commit"

# 創建 GitHub 倉庫後
git remote add origin https://github.com/yourusername/lineminiapp.git
git push -u origin main
```

#### 2.2 配置 GitHub

1. **設置 Secret**：
   - 前往倉庫 → Settings → Secrets and variables → Actions
   - 點擊 **New repository secret**
   - Name: `VITE_LIFF_ID`
   - Value: 你的 LIFF ID
   - 點擊 **Add secret**

2. **啟用 GitHub Pages**：
   - Settings → Pages
   - Source: **GitHub Actions**
   - Save

3. **修改 vite.config.js**：
   ```javascript
   base: process.env.NODE_ENV === 'production'
     ? '/lineminiapp/'  // 改為你的倉庫名
     : '/',
   ```

4. **推送更改**：
   ```bash
   git add vite.config.js
   git commit -m "Update base URL"
   git push
   ```

#### 2.3 等待部署

- 前往 Actions 標籤頁
- 等待綠色勾選（約 2-3 分鐘）
- 成功後訪問：`https://yourusername.github.io/lineminiapp/`

### 步驟 3：更新 LIFF 配置（1 分鐘）

1. 返回 LINE Developers Console
2. 編輯 LIFF App
3. 更新 **Endpoint URL** 為：`https://yourusername.github.io/lineminiapp/`
4. 保存

## ✅ 驗證部署

在 LINE 手機應用中：

1. 發送你的 LIFF URL 到任意聊天
2. 點擊鏈接打開應用
3. 授權登錄
4. 看到日曆界面 = 成功！🎉

## 🔧 本地開發（可選）

```bash
# 安裝依賴
npm install

# 創建 .env.development
echo "VITE_LIFF_ID=你的LIFF-ID" > .env.development
echo "VITE_LIFF_MOCK=false" >> .env.development

# 啟動開發服務器
npm run dev

# Mock 模式（無需 LIFF）
echo "VITE_LIFF_MOCK=true" > .env.development
npm run dev
```

## 🆘 常見問題

### 問題 1：404 錯誤

**原因**：Base URL 配置錯誤

**解決**：
```javascript
// vite.config.js - 確保倉庫名正確
base: '/你的實際倉庫名/'
```

### 問題 2：LIFF 初始化失敗

**檢查項**：
- GitHub Secret 中的 LIFF ID 是否正確
- LINE Developers Console 中的 Endpoint URL 是否匹配
- 必須在 LINE 瀏覽器中打開（不能用 Chrome/Safari）

### 問題 3：白屏

**解決步驟**：
1. 打開瀏覽器開發者工具（F12）
2. 查看 Console 錯誤信息
3. 檢查 Network 標籤的資源加載情況
4. 確認 base URL 正確

## 📚 更多資源

- **完整手冊**：[USER_MANUAL.md](USER_MANUAL.md)
- **部署文檔**：[DEPLOYMENT.md](DEPLOYMENT.md)
- **項目說明**：[README.md](README.md)
- **LIFF 官方文檔**：https://developers.line.biz/en/docs/liff/

## 🎯 下一步

部署成功後，您可以：

1. **創建日程**：點擊右下角 + 按鈕
2. **啟用通知**：在設置中開啟提醒功能
3. **自定義類別**：添加您的專屬分類
4. **導出數據**：定期備份您的日程

## 💡 小貼士

### 添加到主屏幕

**iOS（iPhone）：**
1. 在 Safari 中打開應用
2. 點擊底部「分享」按鈕
3. 選擇「加入主畫面」
4. 輸入名稱，點擊「新增」

**Android：**
1. 在 Chrome 中打開應用
2. 點擊右上角「⋮」菜單
3. 選擇「加到主畫面」
4. 輸入名稱，點擊「新增」

### 啟用離線功能

應用數據存儲在本地，即使離線也能：
- ✅ 查看已有日程
- ✅ 創建新日程
- ✅ 編輯和刪除日程
- ❌ 無法同步到其他設備（需要導出/導入）

### 數據備份建議

每月備份一次數據：
1. 打開應用
2. 進入「設置」頁面
3. 點擊「導出數據」
4. 保存 JSON 文件到雲端硬碟

## 📞 需要幫助？

- **GitHub Issues**：https://github.com/yourusername/lineminiapp/issues
- **查看日誌**：Actions 標籤頁 → 最新工作流 → Build 日誌
- **測試工具**：使用 LIFF Inspector 調試（https://liff-inspector.line.me/）

---

**預計設置時間**：10-15 分鐘
**難度等級**：⭐⭐☆☆☆（簡單）

祝使用愉快！🎉
