/**
 * Category Store (Zustand)
 * Manages categories and tags
 */

import { create } from 'zustand'
import { DEFAULT_CATEGORIES } from '@/utils/constants'
import { storageService } from '@/utils/storage'
import { useUserStore } from './userStore'

export const useCategoryStore = create((set, get) => ({
    // State
    customCategories: [],
    tags: [],
    loading: false,

    // Selectors
    getAllCategories() {
        return [...DEFAULT_CATEGORIES, ...get().customCategories]
    },

    getCategoryById(id) {
        const all = [...DEFAULT_CATEGORIES, ...get().customCategories]
        return all.find(cat => cat.id === id) || DEFAULT_CATEGORIES[5]
    },

    getSortedTags() {
        return [...get().tags].sort()
    },

    hasTag(tag) {
        return get().tags.includes(tag)
    },

    // Actions
    async loadCategories() {
        set({ loading: true })
        try {
            const userStore = useUserStore.getState()
            if (!userStore.userId) throw new Error('User not logged in')

            const data = storageService.getCategories()
            set({
                customCategories: data.customCategories || [],
                tags: data.tags || []
            })
            console.log(`✅ Loaded ${(data.customCategories || []).length} custom categories`)
        } catch (err) {
            console.error('Failed to load categories:', err)
        } finally {
            set({ loading: false })
        }
    },

    async saveCategories() {
        try {
            const { customCategories, tags } = get()
            const success = storageService.saveCategories({ customCategories, tags })
            if (!success) throw new Error('Failed to save categories')
            return true
        } catch (err) {
            console.error('Failed to save categories:', err)
            return false
        }
    },

    async addCustomCategory(category) {
        if (!category.id || !category.name) return false
        if (get().customCategories.some(c => c.id === category.id)) return false

        set(state => ({
            customCategories: [...state.customCategories, {
                id: category.id,
                name: category.name,
                nameEn: category.nameEn || category.name,
                color: category.color || '#B0B0B0',
                icon: category.icon || 'label-o'
            }]
        }))
        return get().saveCategories()
    },

    async updateCustomCategory(categoryId, updates) {
        const index = get().customCategories.findIndex(c => c.id === categoryId)
        if (index === -1) return false

        set(state => {
            const updated = [...state.customCategories]
            updated[index] = { ...updated[index], ...updates }
            return { customCategories: updated }
        })
        return get().saveCategories()
    },

    async deleteCustomCategory(categoryId) {
        set(state => ({
            customCategories: state.customCategories.filter(c => c.id !== categoryId)
        }))
        return get().saveCategories()
    },

    async addTag(tag) {
        if (!tag || typeof tag !== 'string') return false
        const trimmedTag = tag.trim()
        if (!trimmedTag || get().tags.includes(trimmedTag)) return false

        set(state => ({ tags: [...state.tags, trimmedTag] }))
        return get().saveCategories()
    },

    async removeTag(tag) {
        set(state => ({ tags: state.tags.filter(t => t !== tag) }))
        return get().saveCategories()
    },

    async clearTags() {
        set({ tags: [] })
        return get().saveCategories()
    }
}))
