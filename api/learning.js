// Serverless function for learning content with GitHub-based persistent storage

// Default content - Updated 2024-12-11 v2
const defaultContent = {
  _version: '2024-12-11-v2',
  _updated: new Date().toISOString(),
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
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z"
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
      created_at: "2024-02-10T00:00:00Z",
      updated_at: "2024-02-10T00:00:00Z"
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
      created_at: "2024-03-01T00:00:00Z",
      updated_at: "2024-03-01T00:00:00Z"
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
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      status: "Published",
      likes: 890,
      upload_date: "2024-03-01T00:00:00Z",
      created_at: "2024-03-01T00:00:00Z",
      updated_at: "2024-03-01T00:00:00Z"
    },
    {
      id: 2,
      title: "Risk Management: The Key to Long-term Success",
      description: "Master the art of risk management and position sizing",
      duration: "22:15",
      views: 8900,
      category: "Risk Management",
      thumbnail: "⚖️",
      video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      status: "Published",
      likes: 654,
      upload_date: "2024-03-05T00:00:00Z",
      created_at: "2024-03-05T00:00:00Z",
      updated_at: "2024-03-05T00:00:00Z"
    }
  ],
  liveStreams: [
    {
      id: 1,
      title: "Weekly Market Analysis",
      description: "Live analysis of current market conditions",
      scheduled_date: "2024-12-15T15:00:00Z",
      duration: "60 minutes",
      registrations: 45,
      status: "Scheduled",
      created_at: "2024-12-01T00:00:00Z",
      updated_at: "2024-12-01T00:00:00Z"
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
      upload_date: "2024-02-20T00:00:00Z",
      created_at: "2024-02-20T00:00:00Z",
      updated_at: "2024-02-20T00:00:00Z"
    }
  ]
}

// GitHub-based persistent storage
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'ghp_dummy_token'
const GITHUB_REPO = 'dagitariku0949/trading-tracker2'
const DATA_FILE = 'learning-content.json'

async function getContent() {
  // For now, always use the updated default content to ensure consistency
  // This ensures all users see the same content regardless of GitHub state
  console.log('Using updated default content')
  return { ...defaultContent }
  
  // TODO: Re-enable GitHub storage once content is stable
  /*
  try {
    // Try to fetch from GitHub
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      const content = JSON.parse(Buffer.from(data.content, 'base64').toString())
      console.log('Content loaded from GitHub')
      return content
    }
  } catch (error) {
    console.log('GitHub fetch failed:', error.message)
  }
  
  // Fallback to default content
  console.log('Using default content')
  return { ...defaultContent }
  */
}

async function saveContent(content) {
  // Temporarily disabled GitHub saving to ensure consistency
  // All content changes will use the default content for now
  console.log('GitHub saving temporarily disabled')
  return true
  
  // TODO: Re-enable GitHub storage once content management is stable
  /*
  try {
    // Get current file to get SHA
    let sha = null
    try {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        sha = data.sha
      }
    } catch (error) {
      console.log('File does not exist, will create new')
    }
    
    // Save to GitHub
    const contentBase64 = Buffer.from(JSON.stringify(content, null, 2)).toString('base64')
    
    const payload = {
      message: 'Update learning content',
      content: contentBase64,
      ...(sha && { sha })
    }
    
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    if (response.ok) {
      console.log('Content saved to GitHub')
      return true
    } else {
      console.log('GitHub save failed:', response.status)
      return false
    }
  } catch (error) {
    console.log('Save error:', error.message)
    return false
  }
  */
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Add cache-busting headers to force fresh content
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { method } = req

  try {
    if (method === 'GET') {
      const content = await getContent()
      return res.json({
        success: true,
        data: content,
        version: '2024-12-11-v2', // Version identifier to track updates
        timestamp: new Date().toISOString()
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add default values based on content type
        ...(type === 'course' && { students: 0 }),
        ...(type === 'video' && { views: 0, likes: 0, upload_date: new Date().toISOString() }),
        ...(type === 'stream' && { registrations: 0 }),
        ...(type === 'resource' && { downloads: 0, upload_date: new Date().toISOString() })
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
          updated_at: new Date().toISOString()
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