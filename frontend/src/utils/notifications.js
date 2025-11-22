// Notification utility for trade journaling reminders

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return notification
  }
}

export const scheduleTradeReminder = (tradeId, tradeSymbol) => {
  // Schedule reminder for 1 hour
  const reminderId = setTimeout(() => {
    showNotification('📝 Trade Journal Reminder', {
      body: `Did you journal your ${tradeSymbol} trade?`,
      tag: `trade-reminder-${tradeId}`,
      requireInteraction: true,
      actions: [
        { action: 'journal', title: 'Open Journal' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })

    // Remove from active reminders
    removeActiveReminder(tradeId)
  }, 60 * 60 * 1000) // 1 hour in milliseconds

  // Store reminder ID in localStorage
  const activeReminders = getActiveReminders()
  activeReminders[tradeId] = {
    reminderId,
    symbol: tradeSymbol,
    scheduledAt: Date.now()
  }
  localStorage.setItem('tradeReminders', JSON.stringify(activeReminders))

  return reminderId
}

export const cancelTradeReminder = (tradeId) => {
  const activeReminders = getActiveReminders()
  
  if (activeReminders[tradeId]) {
    clearTimeout(activeReminders[tradeId].reminderId)
    delete activeReminders[tradeId]
    localStorage.setItem('tradeReminders', JSON.stringify(activeReminders))
  }
}

export const getActiveReminders = () => {
  const reminders = localStorage.getItem('tradeReminders')
  return reminders ? JSON.parse(reminders) : {}
}

export const removeActiveReminder = (tradeId) => {
  const activeReminders = getActiveReminders()
  delete activeReminders[tradeId]
  localStorage.setItem('tradeReminders', JSON.stringify(activeReminders))
}

export const restoreReminders = (trades) => {
  // Restore reminders for open trades on app load
  const activeReminders = getActiveReminders()
  const openTrades = trades.filter(t => t.status === 'OPEN')

  openTrades.forEach(trade => {
    if (activeReminders[trade.id]) {
      const { scheduledAt, symbol } = activeReminders[trade.id]
      const elapsed = Date.now() - scheduledAt
      const remaining = (60 * 60 * 1000) - elapsed

      if (remaining > 0) {
        // Reschedule with remaining time
        const reminderId = setTimeout(() => {
          showNotification('📝 Trade Journal Reminder', {
            body: `Did you journal your ${symbol} trade?`,
            tag: `trade-reminder-${trade.id}`,
            requireInteraction: true
          })
          removeActiveReminder(trade.id)
        }, remaining)

        // Update reminder ID
        activeReminders[trade.id].reminderId = reminderId
        localStorage.setItem('tradeReminders', JSON.stringify(activeReminders))
      } else {
        // Time already passed, show notification now
        showNotification('📝 Trade Journal Reminder', {
          body: `Did you journal your ${symbol} trade?`,
          tag: `trade-reminder-${trade.id}`,
          requireInteraction: true
        })
        removeActiveReminder(trade.id)
      }
    }
  })
}
