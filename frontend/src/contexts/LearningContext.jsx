import React, { createContext, useContext, useState, useEffect } from 'react';

const LearningContext = createContext();

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};

export const LearningProvider = ({ children }) => {
  const [learningContent, setLearningContent] = useState(() => ({
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
  }));

  // Get only published content for public display
  const getPublishedContent = () => {
    return {
      courses: learningContent.courses.filter(course => course.status === 'Published'),
      videos: learningContent.videos.filter(video => video.status === 'Published'),
      liveStreams: learningContent.liveStreams.filter(stream => stream.status === 'Scheduled' || stream.status === 'Live'),
      resources: learningContent.resources.filter(resource => resource.status === 'Published')
    };
  };

  // Admin functions for managing content
  const addContent = (type, content) => {
    const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
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
    };

    setLearningContent(prev => ({
      ...prev,
      [contentType]: [...prev[contentType], newContent]
    }));

    return newContent;
  };

  const updateContent = (type, id, updates) => {
    const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
    
    setLearningContent(prev => ({
      ...prev,
      [contentType]: prev[contentType].map(item =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    }));
  };

  const deleteContent = (type, id) => {
    const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
    
    setLearningContent(prev => ({
      ...prev,
      [contentType]: prev[contentType].filter(item => item.id !== id)
    }));
  };

  const publishContent = (type, id) => {
    updateContent(type, id, { status: 'Published' });
  };

  const unpublishContent = (type, id) => {
    updateContent(type, id, { status: 'Draft' });
  };

  const value = {
    learningContent,
    publishedContent: getPublishedContent(),
    addContent,
    updateContent,
    deleteContent,
    publishContent,
    unpublishContent
  };

  // Add error boundary
  try {
    return (
      <LearningContext.Provider value={value}>
        {children}
      </LearningContext.Provider>
    );
  } catch (error) {
    console.error('LearningContext error:', error);
    return <div>Error loading learning content</div>;
  }
};