import React, { useState, useEffect } from 'react'
import api from '../api/client'
// import AdminPanel from '../components/AdminPanel' // Temporarily disabled due to syntax error
import { LearningProvider } from '../contexts/LearningContext'

export default function AdminPage() {
  console.log('AdminPage component loaded!')
  const [trades, setTrades] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [tradesRes, metricsRes] = await Promise.all([
        api.get('/api/trades'),
        api.get('/api/trades/stats/metrics')
      ])
      
      setTrades(tradesRes.data)
      setMetrics(metricsRes.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLogout = () => {
    // Redirect to main dashboard
    window.location.href = '/'
  }

  const handleBackToDashboard = () => {
    // Redirect to main dashboard
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading Admin Panel...</div>
      </div>
    )
  }

  return (
    <LearningProvider>
      <AdminPanel 
        onBackToDashboard={handleBackToDashboard}
        onLogout={handleLogout}
        trades={trades}
        metrics={metrics}
      />
    </LearningProvider>
  )
}