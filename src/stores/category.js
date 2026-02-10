/**
 * Category Store
 * Manages categories and tags
 */

import { defineStore } from 'pinia'
import { DEFAULT_CATEGORIES } from '@/utils/constants'
import { storageService } from '@/utils/storage'
import { useUserStore } from './user'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    customCategories: [],
    tags: [],
    loading: false
  }),

  getters: {
    /**
     * Get all categories (default + custom)
     */
    allCategories: (state) => {
      return [...DEFAULT_CATEGORIES, ...state.customCategories]
    },

    /**
     * Get category by ID
     * @param {string} id - Category ID
     */
    getCategoryById: (state) => (id) => {
      const allCategories = [...DEFAULT_CATEGORIES, ...state.customCategories]
      return allCategories.find(cat => cat.id === id) || DEFAULT_CATEGORIES[5] // Default to 'other'
    },

    /**
     * Get sorted tags (by usage frequency - future feature)
     */
    sortedTags: (state) => {
      return [...state.tags].sort()
    },

    /**
     * Check if a tag exists
     * @param {string} tag - Tag name
     */
    hasTag: (state) => (tag) => {
      return state.tags.includes(tag)
    }
  },

  actions: {
    /**
     * Load categories and tags from localStorage
     */
    async loadCategories() {
      this.loading = true

      try {
        const userStore = useUserStore()
        if (!userStore.userId) {
          throw new Error('User not logged in')
        }

        const data = storageService.getCategories()
        this.customCategories = data.customCategories || []
        this.tags = data.tags || []

        console.log(`✅ Loaded ${this.customCategories.length} custom categories, ${this.tags.length} tags`)
      } catch (err) {
        console.error('Failed to load categories:', err)
      } finally {
        this.loading = false
      }
    },

    /**
     * Save categories and tags to localStorage
     */
    async saveCategories() {
      try {
        const data = {
          customCategories: this.customCategories,
          tags: this.tags
        }

        const success = storageService.saveCategories(data)
        if (!success) {
          throw new Error('Failed to save categories')
        }

        return true
      } catch (err) {
        console.error('Failed to save categories:', err)
        return false
      }
    },

    /**
     * Add a custom category
     * @param {Object} category - Category object
     */
    async addCustomCategory(category) {
      if (!category.id || !category.name) {
        console.error('Invalid category')
        return false
      }

      // Check if already exists
      if (this.customCategories.some(c => c.id === category.id)) {
        console.warn('Category already exists')
        return false
      }

      this.customCategories.push({
        id: category.id,
        name: category.name,
        nameEn: category.nameEn || category.name,
        color: category.color || '#B0B0B0',
        icon: category.icon || 'label-o'
      })

      return await this.saveCategories()
    },

    /**
     * Update a custom category
     * @param {string} categoryId - Category ID
     * @param {Object} updates - Fields to update
     */
    async updateCustomCategory(categoryId, updates) {
      const index = this.customCategories.findIndex(c => c.id === categoryId)
      if (index === -1) {
        console.error('Category not found')
        return false
      }

      this.customCategories[index] = {
        ...this.customCategories[index],
        ...updates
      }

      return await this.saveCategories()
    },

    /**
     * Delete a custom category
     * @param {string} categoryId - Category ID
     */
    async deleteCustomCategory(categoryId) {
      this.customCategories = this.customCategories.filter(c => c.id !== categoryId)
      return await this.saveCategories()
    },

    /**
     * Add a tag
     * @param {string} tag - Tag name
     */
    async addTag(tag) {
      if (!tag || typeof tag !== 'string') {
        return false
      }

      const trimmedTag = tag.trim()
      if (!trimmedTag || this.tags.includes(trimmedTag)) {
        return false
      }

      this.tags.push(trimmedTag)
      return await this.saveCategories()
    },

    /**
     * Remove a tag
     * @param {string} tag - Tag name
     */
    async removeTag(tag) {
      this.tags = this.tags.filter(t => t !== tag)
      return await this.saveCategories()
    },

    /**
     * Clear all tags
     */
    async clearTags() {
      this.tags = []
      return await this.saveCategories()
    }
  }
})

