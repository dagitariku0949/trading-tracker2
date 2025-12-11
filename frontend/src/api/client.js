import axios from 'axios'

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4000'
})

// Demo mode for production when backend is not available
const isDemoMode = import.meta.env.PROD && !import.meta.env.VITE_API_BASE

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors and demo mode
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If in demo mode and backend is not available, return mock data
    if (isDemoMode && error.code === 'ERR_NETWORK') {
      return Promise.resolve({
        data: getMockData(error.config.url, error.config.method)
      })
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('userToken')
      localStorage.removeItem('userData')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

// Mock data for demo mode
function getMockData(url, method) {
  if (url.includes('/api/trades') && method === 'get') {
    return [
      {
        id: 1,
        symbol: 'EURUSD',
        direction: 'LONG',
        entry_price: 1.0850,
        exit_price: 1.0920,
        lot_size: 0.1,
        pnl: 70.00,
        status: 'CLOSED',
        trade_date: new Date().toISOString(),
        notes: 'Demo trade - LEAP Trading Dashboard'
      }
    ]
  }
  
  if (url.includes('/api/trades/stats')) {
    return {
      totalTrades: 1,
      winningTrades: 1,
      losingTrades: 0,
      totalPnl: 70.00,
      winRate: 100
    }
  }
  
  return { success: true, message: 'Demo mode active' }
}

export default api
