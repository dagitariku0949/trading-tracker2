const express = require('express')
const router = express.Router()
const ownerAuth = require('../middleware/ownerAuth')

// In-memory learning content storage (in production, use a proper database)
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
      views: 12500,
      category: "Technical Analysis",
      thumbnail: "🎯",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      status: "Published",
      likes: 890,
      uploadDate: "2024-03-01"
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

// Get all learning content (public)
router.get('/content', (req, res) => {
  try {
    res.json({
      success: true,
      data: learningContent
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch learning content' 
    })
  }
})

// Get only published content (public)
router.get('/published', (req, res) => {
  try {
    const publishedContent = {
      courses: learningContent.courses.filter(course => course.status === 'Published'),
      videos: learningContent.videos.filter(video => video.status === 'Published'),
      liveStreams: learningContent.liveStreams.filter(stream => stream.status === 'Scheduled' || stream.status === 'Live'),
      resources: learningContent.resources.filter(resource => resource.status === 'Published')
    }

    res.json({
      success: true,
      data: publishedContent
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch published content' 
    })
  }
})

// Create new content (owner only)
router.post('/content/:type', ownerAuth, (req, res) => {
  try {
    const { type } = req.params
    const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
    
    const newContent = {
      ...req.body,
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

    res.status(201).json({
      success: true,
      data: newContent,
      message: `${type} created successfully`
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to create ${req.params.type}` 
    })
  }
})

// Update content (owner only)
router.put('/content/:type/:id', ownerAuth, (req, res) => {
  try {
    const { type, id } = req.params
    const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
    
    const contentIndex = learningContent[contentType].findIndex(item => item.id === parseInt(id))
    
    if (contentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      })
    }

    learningContent[contentType][contentIndex] = {
      ...learningContent[contentType][contentIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    res.json({
      success: true,
      data: learningContent[contentType][contentIndex],
      message: `${type} updated successfully`
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to update ${req.params.type}` 
    })
  }
})

// Delete content (owner only)
router.delete('/content/:type/:id', ownerAuth, (req, res) => {
  try {
    const { type, id } = req.params
    const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
    
    const initialLength = learningContent[contentType].length
    learningContent[contentType] = learningContent[contentType].filter(item => item.id !== parseInt(id))
    
    if (learningContent[contentType].length === initialLength) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      })
    }

    res.json({
      success: true,
      message: `${type} deleted successfully`
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to delete ${req.params.type}` 
    })
  }
})

module.exports = router