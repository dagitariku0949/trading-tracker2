const jwt = require('jsonwebtoken')

const JWT_SECRET = 'your-secret-key-change-in-production'

// User authentication middleware
const userAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      message: 'Access token required. Please login.' 
    })
  }
  
  const token = authHeader.substring(7) // Remove 'Bearer ' prefix
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token. Please login again.' 
    })
  }
}

module.exports = userAuth