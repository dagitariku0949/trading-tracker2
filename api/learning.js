// Vercel Serverless Function for Learning Content Management

// In-memory storage for learning content (in production, use a proper database)
let learningContent = {
  courses: [
    {
      id: 1,
      title: "Complete Forex Trading Mastery",
      description: "Master the fundamentals of forex trading from beginner to advanced level",
      duration: "12 hours",
      lessons: 24,
      level: "Beginner to Advanced",
      price: "Free",
      thumbnail: "🎓",
      topics: ["Market Analysis", "Risk Management", "Trading Psychology", "Technical Analysis"],
      status: "Published",
      students: 156,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Advanced Price Action Strategies",
      description: "Learn professional price action techniques used by institutional traders",
      duration: "8 hours",
      lessons: 16,
      level: "Intermediate",
      price: "$99",
      thumbnail: "📊",
      topics: ["Support & Resistance", "Candlestick Patterns", "Market Structure", "Entry Strategies"],
      status: "Published",
      students: 89,
      createdAt: "2024-02-10"
    },
    {
      id: 3,
      title: "Trading Psychology Mastery",
      description: "Develop the mental discipline required for consistent trading success",
      duration: "6 hours",
      lessons: 12,
      level: "All Levels",
      price: "$79",
      thumbnail: "🧠",
      topics: ["Emotional Control", "Discipline", "Risk Psychology", "Mindset Development"],
      status: "Published",
      students: 67,
      createdAt: "2024-03-01"
    }
  ],
  videos: [
    {
      id: 1,
      title: "How to Identify High Probability Setups",
      description: "Learn the key factors that make a trading setup high probability",
      duration: "15:30",
      views: "12.5K",
      category: "Technical Analysis",
      thumbnail: "🎯",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      status: "Published",
      likes: 890,
      uploadDate: "2024-03-01"
    },
    {
      id: 2,
      title: "Risk Management: The Key to Long-term Success",
      description: "Master the art of risk management and position sizing",
      duration: "22:15",
      views: "8.9K",
      category: "Risk Management",
      thumbnail: "⚖️",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      status: "Published",
      likes: 654,
      uploadDate: "2024-03-05"
    }
  ],
  liveStreams: [
    {
      id: 1,
      title: "Weekly Market Analysis",
      description: "Live analysis of current market conditions",
      scheduledDate: "2024-12-15T15:00:00Z",
      duration: "60 minutes",
      registrations: 45,
      status: "Scheduled"
    }
  ],
  resources: [
    {
      id: 1,
      title: "Trading Journal Template",
      description: "Professional Excel template for tracking your trades",
      type: "Download",
      format: "Excel (.xlsx)",
      size: "2.5 MB",
      icon: "📊",
      status: "Published",
      downloads: 234,
      uploadDate: "2024-02-20"
    }
  ]
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { method, body, query } = req

  try {
    // GET /api/learning - Get all learning content
    if (method === 'GET') {
      return res.json({
        success: true,
        data: learningContent
      })
    }

    // POST /api/learning - Add new content
    if (method === 'POST') {
      // Check owner authentication
      if (!isOwnerAuthenticated(req)) {
        return res.status(403).json({
          success: false,
          message: 'Owner privileges required'
        })
      }

      const { type, content } = body
      if (!type || !content) {
        return res.status(400).json({
          success: false,
          message: 'Type and content are required'
        })
      }

      const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
      const newContent = {
        ...content,
        id: Date.now(),
        status: 'Draft',
        createdAt: new Date().toISOString(),
        students: type === 'course' ? 0 : undefined,
        views: type === 'video' ? 0 : undefined,
        likes: type === 'video' ? 0 : undefined,
        downloads: type === 'resource' ? 0 : undefined,
        registrations: type === 'stream' ? 0 : undefined
      }

      learningContent[contentType].push(newContent)

      return res.status(201).json({
        success: true,
        data: newContent
      })
    }

    // PUT /api/learning - Update content
    if (method === 'PUT') {
      // Check owner authentication
      if (!isOwnerAuthenticated(req)) {
        return res.status(403).json({
          success: false,
          message: 'Owner privileges required'
        })
      }

      const { type, id, updates } = body
      if (!type || !id || !updates) {
        return res.status(400).json({
          success: false,
          message: 'Type, id, and updates are required'
        })
      }

      const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
      const contentIndex = learningContent[contentType].findIndex(item => item.id === id)
      
      if (contentIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        })
      }

      learningContent[contentType][contentIndex] = {
        ...learningContent[contentType][contentIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      return res.json({
        success: true,
        data: learningContent[contentType][contentIndex]
      })
    }

    // DELETE /api/learning - Delete content
    if (method === 'DELETE') {
      // Check owner authentication
      if (!isOwnerAuthenticated(req)) {
        return res.status(403).json({
          success: false,
          message: 'Owner privileges required'
        })
      }

      const { type, id } = query
      if (!type || !id) {
        return res.status(400).json({
          success: false,
          message: 'Type and id are required'
        })
      }

      const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
      const contentIndex = learningContent[contentType].findIndex(item => item.id === parseInt(id))
      
      if (contentIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        })
      }

      learningContent[contentType].splice(contentIndex, 1)

      return res.json({
        success: true,
        message: 'Content deleted successfully'
      })
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })

  } catch (error) {
    console.error('Learning API Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

function isOwnerAuthenticated(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.substring(7)
  let decodedToken = ''
  try {
    decodedToken = Buffer.from(token, 'base64').toString('utf-8')
  } catch (error) {
    decodedToken = token
  }
  
  return decodedToken.includes('owner') || token.includes('owner')
}