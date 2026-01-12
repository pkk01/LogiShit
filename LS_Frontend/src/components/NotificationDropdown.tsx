import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import notificationService from '../services/notificationService'

interface Notification {
  id: string
  title: string
  message: string
  notification_type: string
  is_read: string
  created_at: string
  action_url?: string
  related_delivery_id?: string
}

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  onNotificationClick?: (notification: Notification) => void
  onCountChange?: () => void
  refreshKey?: number
}

export default function NotificationDropdown({ isOpen, onClose, onNotificationClick, onCountChange, refreshKey }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, refreshKey])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const data = await notificationService.getNotifications(15, false)
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(
        notifications.map(n =>
          n.id === notificationId ? { ...n, is_read: 'true' } : n
        )
      )
      setUnreadCount(Math.max(0, unreadCount - 1))
      onCountChange?.() // Notify parent to refresh count
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const notification = notifications.find(n => n.id === notificationId)
      await notificationService.deleteNotification(notificationId)
      setNotifications(notifications.filter(n => n.id !== notificationId))
      if (notification && notification.is_read === 'false') {
        setUnreadCount(Math.max(0, unreadCount - 1))
      }
      onCountChange?.() // Notify parent to refresh count
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, is_read: 'true' })))
      setUnreadCount(0)
      onCountChange?.() // Notify parent to refresh count
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'important':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'important':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'success':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-blue-600 dark:text-blue-400'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    // Format date with IST timezone
    const istOffset = 5.5 * 60 * 60 * 1000
    const utcDate = date.getTime() + date.getTimezoneOffset() * 60 * 1000
    const istDate = new Date(utcDate + istOffset)
    return istDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 z-[100] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

      {/* Notifications List */}
      <div className="overflow-y-auto bg-white dark:bg-gray-800 max-h-[400px]">
        {loading ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            <div className="inline-block animate-spin">
              <Bell className="w-6 h-6" />
            </div>
            <p className="mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 border-l-4 transition cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  notif.is_read === 'false'
                    ? 'border-primary bg-blue-50 dark:bg-blue-900/20'
                    : `border-transparent ${getNotificationColor(notif.notification_type)}`
                }`}
                onClick={() => {
                  if (onNotificationClick) onNotificationClick(notif)
                  if (notif.is_read === 'false') handleMarkAsRead(notif.id, {} as any)
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${getNotificationIcon(notif.notification_type)}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{notif.title}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 break-words">{notif.message}</p>
                      </div>
                      {notif.is_read === 'false' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{formatTime(notif.created_at)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 ml-8">
                  {notif.is_read === 'false' && (
                    <button
                      onClick={e => handleMarkAsRead(notif.id, e)}
                      className="flex items-center gap-1 text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3" />
                      Read
                    </button>
                  )}
                  <button
                    onClick={e => handleDelete(notif.id, e)}
                    className="flex items-center gap-1 text-xs px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && unreadCount > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </button>
        </div>
      )}
    </div>
    </>
  )
}
