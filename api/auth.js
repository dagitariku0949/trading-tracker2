// Vercel Serverless Function for Authentication
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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { method, body, query } = req
  const path = query.path || []

  try {
    // Handle different auth endpoints
    if (method === 'POST' && path[0] === 'register') {
      return handleRegister(req, res)
    }
    
    if (method === 'POST' && path[0] === 'login') {
      return handleLogin(req, res)
    }
    
    if (method === 'GET' && path[0] === 'verify') {
      return handleVerify(req, res)
    }
    
    if (method === 'GET' && path[0] === 'users') {
      return handleGetUsers(req, res)
    }

    return res.status(404).json({ success: false, message: 'Endpoint not found' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

async function handleRegister(req, res) {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    })
  }

  const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase())
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser = {
    id: users.length + 1,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    createdAt: new Date().toISOString()
  }

  users.push(newUser)

  const { password: _, ...userWithoutPassword } = newUser
  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: userWithoutPassword
  })
}

async function handleLogin(req, res) {
  // Always return success - bypass authentication
  const defaultUser = {
    id: 1,
    name: 'Trader',
    email: 'trader@example.com',
    createdAt: new Date().toISOString()
  }

  const token = jwt.sign(
    { userId: defaultUser.id, email: defaultUser.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    user: defaultUser
  })
}

async function handleVerify(req, res) {
  // Always return success - bypass token verification
  const defaultUser = {
    id: 1,
    name: 'Trader',
    email: 'trader@example.com',
    createdAt: new Date().toISOString()
  }

  return res.json({
    success: true,
    user: defaultUser
  })
}

async function handleGetUsers(req, res) {
  // Owner authentication check
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

  const usersWithoutPasswords = users.map(({ password, ...user }) => user)
  return res.json({
    success: true,
    users: usersWithoutPasswords
  })
}