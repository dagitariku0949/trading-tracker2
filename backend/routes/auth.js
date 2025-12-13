const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const router = express.Router()

// In-memory user database (structured for easy PostgreSQL migration)
class UserDatabase {
  constructor() {
    this.users = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@tradingdashboard.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
        role: 'admin',
        isVerified: true,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        resetToken: null,
        resetTokenExpiry: null
      }
    ]
    this.idCounter = 2
  }

  async findByEmail(email) {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase())
  }

  async findById(id) {
    return this.users.find(user => user.id === parseInt(id))
  }

  async createUser(userData) {
    const newUser = {
      id: this.idCounter++,
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      resetToken: null,
      resetTokenExpiry: null
    }
    this.users.push(newUser)
    return newUser
  }

  async updateUser(id, updates) {
    const index = this.users.findIndex(user => user.id === parseInt(id))
    if (index === -1) return null
    
    this.users[index] = {
      ...this.users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return this.users[index]
  }

  async deleteUser(id) {
    const index = this.users.findIndex(user => user.id === parseInt(id))
    if (index === -1) return false
    this.users.splice(index, 1)
    return true
  }

  async getAllUsers() {
    return this.users.map(user => {
      const { password, resetToken, ...safeUser } = user
      return safeUser
    })
  }
}

const userDb = new UserDatabase()

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' })
  }
  next()
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      })
    }

    // Check if user already exists
    const existingUser = await userDb.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const newUser = await userDb.createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      isVerified: true // Auto-verify for now
    })

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Remove password from response
    const { password: _, ...userResponse } = newUser

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
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

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    // Find user
    const user = await userDb.findByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Update last login
    await userDb.updateUser(user.id, { lastLogin: new Date().toISOString() })

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Remove password from response
    const { password: _, resetToken, ...userResponse } = user

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed'
    })
  }
})

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      })
    }

    const user = await userDb.findByEmail(email)
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token
    await userDb.updateUser(user.id, {
      resetToken,
      resetTokenExpiry: resetTokenExpiry.toISOString()
    })

    // In production, send email here
    console.log(`Password reset token for ${email}: ${resetToken}`)
    console.log(`Reset URL: http://localhost:5173/reset-password?token=${resetToken}`)

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
      // For development only - remove in production
      resetToken: resetToken,
      resetUrl: `http://localhost:5173/reset-password?token=${resetToken}`
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    res.status(500).json({
      success: false,
      message: 'Password reset request failed'
    })
  }
})

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      })
    }

    // Find user by reset token
    const user = userDb.users.find(u => u.resetToken === token)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      })
    }

    // Check if token is expired
    if (new Date() > new Date(user.resetTokenExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password and clear reset token
    await userDb.updateUser(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    })

    res.json({
      success: true,
      message: 'Password reset successful'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    })
  }
})

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await userDb.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const { password, resetToken, ...userResponse } = user
    res.json({
      success: true,
      data: userResponse
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    })
  }
})

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body
    const updates = {}

    if (name) updates.name = name
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await userDb.findByEmail(email)
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        })
      }
      updates.email = email.toLowerCase()
    }

    const updatedUser = await userDb.updateUser(req.user.id, updates)
    const { password, resetToken, ...userResponse } = updatedUser

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({
      success: false,
      message: 'Profile update failed'
    })
  }
})

// Admin: Get all users
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await userDb.getAllUsers()
    res.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    })
  }
})

// Admin: Update user
router.put('/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role, isVerified } = req.body

    const updates = {}
    if (name) updates.name = name
    if (email) updates.email = email.toLowerCase()
    if (role) updates.role = role
    if (typeof isVerified === 'boolean') updates.isVerified = isVerified

    const updatedUser = await userDb.updateUser(id, updates)
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const { password, resetToken, ...userResponse } = updatedUser
    res.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    })
  } catch (error) {
    console.error('Admin user update error:', error)
    res.status(500).json({
      success: false,
      message: 'User update failed'
    })
  }
})

// Admin: Delete user
router.delete('/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      })
    }

    const deleted = await userDb.deleteUser(id)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Admin user delete error:', error)
    res.status(500).json({
      success: false,
      message: 'User deletion failed'
    })
  }
})

// Admin: Reset user password
router.post('/admin/users/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUser = await userDb.updateUser(id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    })

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error('Admin password reset error:', error)
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    })
  }
})

// Verify token (for frontend to check if user is still authenticated)
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  })
})

module.exports = router