import axios from 'axios'

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE || (
    import.meta.env.PROD 
      ? 'https://your-backend-url.vercel.app' 
      : 'http://localhost:4000'
  )
})

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('userToken')
      localStorage.removeItem('userData')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default api
