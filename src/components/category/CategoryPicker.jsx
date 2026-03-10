/**
 * CategoryPicker.jsx - Category selection component
 */

import React, { useState } from 'react'
import { useCategoryStore } from '@/stores/categoryStore'

export default function CategoryPicker({ value, onChange, label = 'カテゴリー' }) {
    const categoryStore = useCategoryStore()
    const [showPicker, setShowPicker] = useState(false)
    const [tempSelected, setTempSelected] = useState(value)

    const categories = categoryStore.getAllCategories()
    const selectedCategory = categoryStore.getCategoryById(value)

    function handleConfirm() {
        onChange && onChange(tempSelected)
        setShowPicker(false)
    }

    function handleOpen() {
        setTempSelected(value)
        setShowPicker(true)
    }

    return (
        <>
            <div className="form-field" onClick={handleOpen}>
                <label className="field-label">{label}</label>
                <div className="field-input field-clickable">
                    {selectedCategory ? (
                        <span className="category-display">
                            <span className="category-icon">{selectedCategory.name.charAt(0)}</span>
                            <span>{selectedCategory.name}</span>
                        </span>
                    ) : (
                        <span className="field-placeholder">カテゴリーを選択してください</span>
                    )}
                    <span className="field-arrow">›</span>
                </div>
            </div>

            {showPicker && (
                <div className="popup-overlay" onClick={() => setShowPicker(false)}>
                    <div className="popup-sheet" onClick={e => e.stopPropagation()}>
                        <div className="picker-header">
                            <button className="btn btn-text" onClick={() => setShowPicker(false)}>
                                キャンセル
                            </button>
                            <span className="picker-title">カテゴリーを選択</span>
                            <button className="btn btn-text btn-primary-text" onClick={handleConfirm}>
                                確定
                            </button>
                        </div>

                        <div className="category-list">
                            {categories.map(category => (
                                <div
                                    key={category.id}
                                    className={`category-item ${tempSelected === category.id ? 'is-selected' : ''}`}
                                    onClick={() => setTempSelected(category.id)}
                                >
                                    <span className="category-color-dot" style={{ backgroundColor: category.color }} />
                                    <span className="category-name">{category.name}</span>
                                    {tempSelected === category.id && <span className="check-icon">✓</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
