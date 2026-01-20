import axios from 'axios'
import { API_BASE_URL } from '../utils/apiBase'

const token = localStorage.getItem('access_token')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

export const notificationService = {
  // Get all notifications
  getNotifications: async (limit = 20, unreadOnly = false) => {
    try {
      const response = await api.get('/notifications/', {
        params: {
          limit,
          unread_only: unreadOnly ? 'true' : 'false'
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      throw error
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count/')
      return response.data.unread_count
    } catch (error) {
      console.error('Failed to get unread count:', error)
      return 0
    }
  },

  // Get single notification
  getNotification: async (notificationId: string) => {
    try {
      const response = await api.get(`/notifications/${notificationId}/`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch notification:', error)
      throw error
    }
  },

  // Mark as read
  markAsRead: async (notificationId: string) => {
    try {
      const response = await api.post(`/notifications/${notificationId}/read/`)
      return response.data
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const response = await api.post('/notifications/read-all/')
      return response.data
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      throw error
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}/delete/`)
      return response.data
    } catch (error) {
      console.error('Failed to delete notification:', error)
      throw error
    }
  }
}

export default notificationService
