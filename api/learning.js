// Simple serverless function for learning content
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
    }
  ],
  videos: [],
  liveStreams: [],
  resources: []
}

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { method } = req

  if (method === 'GET') {
    return res.json({
      success: true,
      data: learningContent
    })
  }

  if (method === 'POST') {
    const { type, content } = req.body
    const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
    
    const newContent = {
      ...content,
      id: Date.now(),
      status: content.status || 'Published',
      createdAt: new Date().toISOString()
    }

    learningContent[contentType].push(newContent)

    return res.status(201).json({
      success: true,
      data: newContent
    })
  }

  if (method === 'PUT') {
    const { type, id, updates } = req.body
    const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
    
    const index = learningContent[contentType].findIndex(item => item.id === id)
    if (index !== -1) {
      learningContent[contentType][index] = {
        ...learningContent[contentType][index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      return res.json({
        success: true,
        data: learningContent[contentType][index]
      })
    }
    
    return res.status(404).json({
      success: false,
      message: 'Content not found'
    })
  }

  if (method === 'DELETE') {
    const { type, id } = req.query
    const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
    
    const initialLength = learningContent[contentType].length
    learningContent[contentType] = learningContent[contentType].filter(item => item.id !== parseInt(id))
    
    if (learningContent[contentType].length < initialLength) {
      return res.json({
        success: true,
        message: 'Content deleted'
      })
    }
    
    return res.status(404).json({
      success: false,
      message: 'Content not found'
    })
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  })
}