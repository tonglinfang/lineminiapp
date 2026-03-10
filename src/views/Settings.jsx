/**
 * Settings.jsx - Settings view
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useUserStore } from '@/stores/userStore'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useNotification } from '@/hooks/useNotification'
import { useStorage } from '@/hooks/useStorage'
import { useLiff } from '@/hooks/useLiff'
import { REMINDER_OPTIONS, VIEW_MODES, APP_CONFIG } from '@/utils/constants'

export default function Settings() {
    const userStore = useUserStore()
    const scheduleStore = useScheduleStore()
    const notification = useNotification()
    const { storageStats, updateStats, clearUserData } = useStorage()
    const { getOS } = useLiff()

    const [showReminderPicker, setShowReminderPicker] = useState(false)
    const [showViewPicker, setShowViewPicker] = useState(false)

    useEffect(() => { updateStats() }, [])

    const notificationStatus = useMemo(() => {
        if (notification.permission === 'granted') return { text: '許可済み', className: 'tag-success' }
        if (notification.permission === 'denied') return { text: '拒否済み', className: 'tag-danger' }
        return { text: '未リクエスト', className: 'tag-warning' }
    }, [notification.permission])

    const defaultReminderDisplay = useMemo(() => {
        const time = userStore.preferences?.notifications?.defaultReminderTime
        const opt = REMINDER_OPTIONS.find(o => o.value === time)
        return opt ? opt.label : '15分前'
    }, [userStore.preferences?.notifications?.defaultReminderTime])

    const defaultViewDisplay = useMemo(() => {
        const viewMap = {
            [VIEW_MODES.MONTH]: '月表示',
            [VIEW_MODES.WEEK]: '週表示',
            [VIEW_MODES.DAY]: '日表示',
            [VIEW_MODES.LIST]: 'リスト表示'
        }
        return viewMap[userStore.preferences?.defaultView] || '月表示'
    }, [userStore.preferences?.defaultView])

    const liffEnv = useMemo(() => {
        const os = getOS()
        return os === 'web' ? 'ブラウザ' : `LINE (${os})`
    }, [])

    async function handleRequestPermission() {
        if (notification.permission === 'denied') {
            alert('ブラウザ/OSの設定から通知を許可してください')
            return
        }
        const result = await notification.requestPermission()
        if (result === 'granted') {
            alert('通知権限が許可されました')
            notification.rescheduleAll(scheduleStore.schedules)
        } else if (result === 'denied') {
            alert('通知権限が拒否されました')
        }
    }

    function handleToggleNotifications(enabled) {
        userStore.updateNotificationSettings({ enabled })
        if (enabled) {
            notification.rescheduleAll(scheduleStore.schedules)
            alert('リマインダーを有効にしました')
        } else {
            notification.cancelAllNotifications()
            alert('リマインダーを無効にしました')
        }
    }

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
            alert('エクスポートしました')
        } catch (error) {
            alert('エクスポートできませんでした')
        }
    }

    function handleImportData() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        input.onchange = async e => {
            const file = e.target.files[0]
            if (!file) return
            try {
                const text = await file.text()
                const data = JSON.parse(text)
                if (window.confirm(`${data.schedules?.length || 0} 件のスケジュールをインポートします。続行しますか？`)) {
                    const success = await scheduleStore.importSchedules(data, true)
                    if (success) {
                        alert('インポートしました')
                        notification.rescheduleAll(scheduleStore.schedules)
                    } else {
                        alert('インポートできませんでした')
                    }
                }
            } catch (error) {
                alert('ファイル形式が正しくありません')
            }
        }
        input.click()
    }

    async function handleClearData() {
        if (window.confirm('この操作はすべてのスケジュールデータをクリアします。元に戻せません！')) {
            clearUserData()
            await scheduleStore.loadSchedules()
            notification.cancelAllNotifications()
            alert('データをクリアしました')
        }
    }

    function handleTestNotification() {
        if (!notification.isGranted()) {
            alert('先に通知権限を許可してください')
            return
        }
        notification.testNotification()
        alert('テスト通知を送信しました')
    }

    return (
        <div className="settings-view">
            <div className="nav-bar">
                <h2 className="nav-title">設定</h2>
            </div>

            {/* User Info */}
            <div className="cell-group">
                <div className="cell-group-title">ユーザー情報</div>
                <div className="cell">
                    {userStore.pictureUrl && (
                        <img src={userStore.pictureUrl} className="user-avatar" alt="avatar" />
                    )}
                    <div className="cell-content">
                        <div className="cell-title">{userStore.displayName || 'ユーザー'}</div>
                        <div className="cell-label">User ID: {userStore.userId || '—'}</div>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="cell-group">
                <div className="cell-group-title">通知設定</div>

                <div className="cell">
                    <div className="cell-title">通知権限</div>
                    <span className={`tag ${notificationStatus.className}`}>{notificationStatus.text}</span>
                </div>

                {notification.permission !== 'granted' && (
                    <div className="cell cell-link" onClick={handleRequestPermission}>
                        <div className="cell-title">通知権限をリクエスト</div>
                        <span className="cell-arrow">›</span>
                    </div>
                )}

                {notification.permission === 'denied' && (
                    <div className="cell">
                        <div className="cell-title">通知が拒否されています</div>
                        <div className="cell-label">ブラウザ/OSの設定から通知を許可してください</div>
                    </div>
                )}

                <div className="cell">
                    <div className="cell-title">リマインダーを有効にする</div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={!!userStore.preferences?.notifications?.enabled}
                            disabled={!notification.isGranted()}
                            onChange={e => handleToggleNotifications(e.target.checked)}
                        />
                        <span className="toggle-slider" />
                    </label>
                </div>

                <div className="cell cell-link" onClick={() => setShowReminderPicker(true)}>
                    <div className="cell-title">デフォルトのリマインダー時間</div>
                    <span className="cell-value">{defaultReminderDisplay}</span>
                    <span className="cell-arrow">›</span>
                </div>

                <div className="cell">
                    <div className="cell-title">スケジュール済みリマインダー</div>
                    <span className="cell-value">{notification.getScheduledCount()} 件</span>
                </div>
            </div>

            {/* Calendar Settings */}
            <div className="cell-group">
                <div className="cell-group-title">カレンダー設定</div>

                <div className="cell cell-link" onClick={() => setShowViewPicker(true)}>
                    <div className="cell-title">デフォルト表示</div>
                    <span className="cell-value">{defaultViewDisplay}</span>
                    <span className="cell-arrow">›</span>
                </div>

                <div className="cell">
                    <div className="cell-title">週の開始日</div>
                    <div className="radio-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="weekStart"
                                value={0}
                                checked={userStore.preferences?.weekStartsOn === 0}
                                onChange={() => userStore.updatePreference('weekStartsOn', 0)}
                            />
                            日曜日
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="weekStart"
                                value={1}
                                checked={userStore.preferences?.weekStartsOn === 1}
                                onChange={() => userStore.updatePreference('weekStartsOn', 1)}
                            />
                            月曜日
                        </label>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="cell-group">
                <div className="cell-group-title">データ管理</div>

                <div className="cell">
                    <div className="cell-title">スケジュール数</div>
                    <span className="cell-value">{scheduleStore.getActiveSchedules().length} 件</span>
                </div>

                <div className="cell">
                    <div className="cell-title">ストレージ使用量</div>
                    <span className="cell-value">{storageStats.sizeKB} KB / {storageStats.percentUsed}%</span>
                </div>

                <div className="cell cell-link" onClick={handleExportData}>
                    <div className="cell-title">データをエクスポート</div>
                    <span className="cell-arrow">›</span>
                </div>

                <div className="cell cell-link" onClick={handleImportData}>
                    <div className="cell-title">データをインポート</div>
                    <span className="cell-arrow">›</span>
                </div>

                <div className="cell cell-link cell-danger" onClick={handleClearData}>
                    <div className="cell-title">すべてのデータをクリア</div>
                    <span className="cell-arrow">›</span>
                </div>
            </div>

            {/* Testing */}
            <div className="cell-group">
                <div className="cell-group-title">テスト</div>
                <div className="cell cell-link" onClick={handleTestNotification}>
                    <div className="cell-title">通知をテスト</div>
                    <span className="cell-arrow">›</span>
                </div>
            </div>

            {/* About */}
            <div className="cell-group">
                <div className="cell-group-title">について</div>
                <div className="cell">
                    <div className="cell-title">バージョン</div>
                    <span className="cell-value">{APP_CONFIG.VERSION}</span>
                </div>
                <div className="cell">
                    <div className="cell-title">LINE環境</div>
                    <span className="cell-value">{liffEnv}</span>
                </div>
            </div>

            {/* Reminder Picker */}
            {showReminderPicker && (
                <div className="popup-overlay" onClick={() => setShowReminderPicker(false)}>
                    <div className="popup-sheet popup-sheet-sm" onClick={e => e.stopPropagation()}>
                        <div className="picker-header">
                            <button className="btn btn-text" onClick={() => setShowReminderPicker(false)}>キャンセル</button>
                            <span className="picker-title">リマインダー時間</span>
                        </div>
                        <div className="picker-options">
                            {REMINDER_OPTIONS.map(opt => (
                                <div
                                    key={opt.value}
                                    className={`picker-option ${userStore.preferences?.notifications?.defaultReminderTime === opt.value ? 'is-selected' : ''}`}
                                    onClick={() => {
                                        userStore.updateNotificationSettings({ defaultReminderTime: opt.value })
                                        setShowReminderPicker(false)
                                        alert('保存しました')
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* View Picker */}
            {showViewPicker && (
                <div className="popup-overlay" onClick={() => setShowViewPicker(false)}>
                    <div className="popup-sheet popup-sheet-sm" onClick={e => e.stopPropagation()}>
                        <div className="picker-header">
                            <button className="btn btn-text" onClick={() => setShowViewPicker(false)}>キャンセル</button>
                            <span className="picker-title">デフォルト表示</span>
                        </div>
                        <div className="picker-options">
                            {[
                                { text: '月表示', value: VIEW_MODES.MONTH },
                                { text: '週表示', value: VIEW_MODES.WEEK },
                                { text: '日表示', value: VIEW_MODES.DAY },
                                { text: 'リスト表示', value: VIEW_MODES.LIST }
                            ].map(opt => (
                                <div
                                    key={opt.value}
                                    className={`picker-option ${userStore.preferences?.defaultView === opt.value ? 'is-selected' : ''}`}
                                    onClick={() => {
                                        userStore.updatePreference('defaultView', opt.value)
                                        setShowViewPicker(false)
                                        alert('保存しました')
                                    }}
                                >
                                    {opt.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
