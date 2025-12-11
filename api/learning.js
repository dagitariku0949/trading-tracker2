// Serverless function for learning content with persistent storage
import { promises as fs } from 'fs'
import path from 'path'

// Default content
const defaultContent = {
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

// Global storage using environment variables as a simple database
let globalContent = null

async function getContent() {
  if (globalContent) return globalContent
  
  // Try to get from environment variable or use default
  try {
    const stored = process.env.LEARNING_CONTENT
    if (stored) {
      globalContent = JSON.parse(stored)
      return globalContent
    }
  } catch (error) {
    console.log('No stored content found, using default')
  }
  
  globalContent = { ...defaultContent }
  return globalContent
}

async function saveContent(content) {
  globalContent = content
  // In a real app, you'd save to a database here
  // For now, we'll keep it in memory during the function lifetime
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { method } = req

  try {
    if (method === 'GET') {
      const content = await getContent()
      return res.json({
        success: true,
        data: content
      })
    }

    if (method === 'POST') {
      const { type, content } = req.body
      const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
      
      const currentContent = await getContent()
      const newContent = {
        ...content,
        id: Date.now(),
        status: content.status || 'Published',
        createdAt: new Date().toISOString()
      }

      currentContent[contentType].push(newContent)
      await saveContent(currentContent)

      return res.status(201).json({
        success: true,
        data: newContent
      })
    }

    if (method === 'PUT') {
      const { type, id, updates } = req.body
      const contentType = type === 'stream' ? 'liveStreams' : `${type}s`
      
      const currentContent = await getContent()
      const index = currentContent[contentType].findIndex(item => item.id === id)
      
      if (index !== -1) {
        currentContent[contentType][index] = {
          ...currentContent[contentType][index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        
        await saveContent(currentContent)
        
        return res.json({
          success: true,
          data: currentContent[contentType][index]
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
      
      const currentContent = await getContent()
      const initialLength = currentContent[contentType].length
      currentContent[contentType] = currentContent[contentType].filter(item => item.id !== parseInt(id))
      
      if (currentContent[contentType].length < initialLength) {
        await saveContent(currentContent)
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
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}