const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// In-memory user storage (in production, use a proper database)
let users = [
  {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    createdAt: new Date().toISOString()
  }
]

const JWT_SECRET = 'your-secret-key-change-in-production'

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      })
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)

    // Return success (don't send password)
    const { password: _, ...userWithoutPassword } = newUser
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    // Find user
    const user = users.find(user => user.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Return success (don't send password)
    const { password: _, ...userWithoutPassword } = user
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed'
    })
  }
})

// Verify token middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
}

// Verify token endpoint
router.get('/verify', verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId)
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  const { password: _, ...userWithoutPassword } = user
  res.json({
    success: true,
    user: userWithoutPassword
  })
})

// Get all users (owner access only)
router.get('/users', (req, res) => {
  try {
    console.log('Users endpoint called')
    console.log('Current users:', users.length)
    
    // Check for owner authentication
    const authHeader = req.headers.authorization
    console.log('Auth header:', authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header or wrong format')
      return res.status(401).json({
        success: false,
        message: 'Owner access required'
      })
    }

    const token = authHeader.substring(7)
    console.log('Token:', token)
    
    // Decode base64 token and check for owner
    let decodedToken = ''
    try {
      decodedToken = Buffer.from(token, 'base64').toString('utf-8')
      console.log('Decoded token:', decodedToken)
    } catch (error) {
      decodedToken = token // fallback to original token
    }
    
    // Simple owner token check (in production, use proper JWT verification)
    if (!decodedToken.includes('owner') && !token.includes('owner')) {
      console.log('Token does not include owner')
      return res.status(403).json({
        success: false,
        message: 'Owner privileges required'
      })
    }

    const usersWithoutPasswords = users.map(({ password, ...user }) => user)
    console.log('Returning users:', usersWithoutPasswords)
    
    res.json({
      success: true,
      users: usersWithoutPasswords
    })
  } catch (error) {
    console.error('Users endpoint error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    })
  }
})

// Get user trading analytics (owner access only)
router.get('/users/:userId/trades', (req, res) => {
  try {
    // Check for owner authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Owner access required'
      })
    }

    const token = authHeader.substring(7)
    let decodedToken = ''
    try {
      decodedToken = Buffer.from(token, 'base64').toString('utf-8')
    } catch (error) {
      decodedToken = token
    }
    
    if (!decodedToken.includes('owner') && !token.includes('owner')) {
      return res.status(403).json({
        success: false,
        message: 'Owner privileges required'
      })
    }

    const userId = parseInt(req.params.userId)
    
    // Mock trading data for demonstration (in production, query actual database)
    const mockTrades = [
      {
        id: 1,
        user_id: userId,
        symbol: 'EURUSD',
        direction: 'LONG',
        entry_price: 1.0850,
        exit_price: 1.0920,
        lot_size: 0.1,
        pnl: 70.00,
        status: 'CLOSED',
        trade_date: new Date().toISOString(),
        notes: 'Good breakout trade'
      },
      {
        id: 2,
        user_id: userId,
        symbol: 'GBPUSD',
        direction: 'SHORT',
        entry_price: 1.2650,
        exit_price: 1.2580,
        lot_size: 0.2,
        pnl: 140.00,
        status: 'CLOSED',
        trade_date: new Date().toISOString(),
        notes: 'Perfect reversal setup'
      }
    ]

    // Calculate performance metrics
    const totalTrades = mockTrades.length
    const winningTrades = mockTrades.filter(t => t.pnl > 0).length
    const losingTrades = mockTrades.filter(t => t.pnl < 0).length
    const totalPnL = mockTrades.reduce((sum, t) => sum + t.pnl, 0)
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(1) : 0

    res.json({
      success: true,
      data: {
        trades: mockTrades,
        analytics: {
          totalTrades,
          winningTrades,
          losingTrades,
          totalPnL,
          winRate,
          avgPnL: totalTrades > 0 ? (totalPnL / totalTrades).toFixed(2) : 0
        }
      }
    })
  } catch (error) {
    console.error('User trades endpoint error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user trades'
    })
  }
})

// Get all users trading summary (owner access only)
router.get('/users/trading-summary', (req, res) => {
  try {
    // Check for owner authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Owner access required'
      })
    }

    const token = authHeader.substring(7)
    let decodedToken = ''
    try {
      decodedToken = Buffer.from(token, 'base64').toString('utf-8')
    } catch (error) {
      decodedToken = token
    }
    
    if (!decodedToken.includes('owner') && !token.includes('owner')) {
      return res.status(403).json({
        success: false,
        message: 'Owner privileges required'
      })
    }

    // Mock trading summary for all users
    const tradingSummary = users.map(user => ({
      userId: user.id,
      name: user.name,
      email: user.email,
      totalTrades: Math.floor(Math.random() * 50) + 1,
      totalPnL: (Math.random() * 2000 - 1000).toFixed(2),
      winRate: (Math.random() * 40 + 40).toFixed(1), // 40-80%
      lastTradeDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      accountBalance: (10000 + Math.random() * 5000).toFixed(2)
    }))

    res.json({
      success: true,
      data: tradingSummary
    })
  } catch (error) {
    console.error('Trading summary endpoint error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trading summary'
    })
  }
})

module.exports = router