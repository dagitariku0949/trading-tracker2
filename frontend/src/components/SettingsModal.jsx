import React, { useState, useEffect } from 'react'

export default function SettingsModal({ onClose, currentBalance, onSave }) {
  const [startingBalance, setStartingBalance] = useState(currentBalance)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    setStartingBalance(currentBalance)
    
    // Check if notifications are enabled
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [currentBalance])

  const handleEnableNotifications = async () => {
    const { requestNotificationPermission } = await import('../utils/notifications')
    const granted = await requestNotificationPermission()
    setNotificationsEnabled(granted)
    
    if (granted) {
      alert('✅ Notifications enabled! You will receive reminders to journal your trades.')
    } else {
      alert('❌ Notifications blocked. Please enable them in your browser settings.')
    }
  }

  const handleSave = () => {
    const balance = parseFloat(startingBalance)
    if (isNaN(balance) || balance <= 0) {
      alert('Please enter a valid balance amount')
      return
    }
    onSave(balance)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">⚙️ Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Starting Balance</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-3 pl-8 text-lg font-semibold focus:outline-none focus:border-emerald-500"
                placeholder="100000"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              This is your account starting balance. All P&L calculations will be based on this amount.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">📱 Trade Journal Reminders</label>
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold">Browser Notifications</div>
                  <div className="text-xs text-slate-400">Get reminded to journal your trades after 1 hour</div>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-semibold ${
                  notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-600'
                }`}>
                  {notificationsEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              {!notificationsEnabled && (
                <button
                  onClick={handleEnableNotifications}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-semibold transition mt-2"
                >
                  Enable Notifications
                </button>
              )}
            </div>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 text-xl">⚠️</span>
              <div className="text-sm text-yellow-200">
                <div className="font-semibold mb-1">Important:</div>
                <div>Changing the starting balance will recalculate all metrics and percentages. Your trade P&L amounts will remain the same.</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-semibold transition"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
