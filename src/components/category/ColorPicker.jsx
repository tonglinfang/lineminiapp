/**
 * ColorPicker.jsx - Color selection component
 */

import React, { useState } from 'react'

const COLOR_OPTIONS = [
    '#FF6B6B', '#FF9FF3', '#FFE66D', '#FFB84D',
    '#4ECDC4', '#95E1D3', '#06C755', '#A8E6CF',
    '#5DADE2', '#C7CEEA', '#9B59B6', '#E74C3C',
    '#3498DB', '#1ABC9C', '#F39C12', '#B0B0B0'
]

export default function ColorPicker({ value, onChange, label = '色' }) {
    const [showPicker, setShowPicker] = useState(false)
    const [tempColor, setTempColor] = useState(value)

    function handleConfirm() {
        onChange && onChange(tempColor)
        setShowPicker(false)
    }

    function handleOpen() {
        setTempColor(value)
        setShowPicker(true)
    }

    return (
        <>
            <div className="form-field" onClick={handleOpen}>
                <label className="field-label">{label}</label>
                <div className="field-input field-clickable">
                    <div className="color-preview">
                        <div className="color-swatch" style={{ backgroundColor: value }} />
                        <span>{value}</span>
                    </div>
                    <span className="field-arrow">›</span>
                </div>
            </div>

            {showPicker && (
                <div className="popup-overlay" onClick={() => setShowPicker(false)}>
                    <div className="popup-sheet popup-sheet-sm" onClick={e => e.stopPropagation()}>
                        <div className="picker-header">
                            <button className="btn btn-text" onClick={() => setShowPicker(false)}>
                                キャンセル
                            </button>
                            <span className="picker-title">色を選択</span>
                            <button className="btn btn-text btn-primary-text" onClick={handleConfirm}>
                                確定
                            </button>
                        </div>

                        <div className="color-grid">
                            {COLOR_OPTIONS.map(color => (
                                <div
                                    key={color}
                                    className={`color-option ${tempColor === color ? 'is-selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setTempColor(color)}
                                >
                                    {tempColor === color && <span className="color-check">✓</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
