require('dotenv').config()
const express = require('express')
const app = express()
const kiroRoutes = require('./routes/kiro')
const tradesRoutes = require('./routes/trades')
const learningRoutes = require('./routes/learning')
const authRoutes = require('./routes/auth')

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.use(express.json())

// Serve uploaded files statically
const path = require('path')
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Root endpoint for ngrok verification
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Trading Dashboard API',
    endpoints: {
      trades: '/api/trades',
      metrics: '/api/trades/stats/metrics',
      account: '/api/trades/stats/account'
    }
  })
})

app.use('/api/kiro', kiroRoutes)
app.use('/api/trades', tradesRoutes)
app.use('/api/learning', learningRoutes)
app.use('/api/auth', authRoutes)

const port = process.env.PORT || 4000
app.listen(port, ()=> console.log('Server listening on', port))
