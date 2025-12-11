import React, { createContext, useContext, useState, useEffect } from 'react';

const LearningContext = createContext();

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://leap-trading-dashboard.vercel.app';

export const LearningProvider = ({ children }) => {
  const [learningContent, setLearningContent] = useState({
    courses: [],
    videos: [],
    liveStreams: [],
    resources: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load content from API on mount
  useEffect(() => {
    loadLearningContent();
  }, []);

  const loadLearningContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from localStorage first
      const savedContent = localStorage.getItem('learningContent');
      if (savedContent) {
        const parsed = JSON.parse(savedContent);
        setLearningContent(parsed);
        setLoading(false);
        return;
      }
      
      // Try API if no local content
      try {
        const response = await fetch(`${API_BASE_URL}/api/learning`);
        const result = await response.json();
        
        if (result.success) {
          setLearningContent(result.data);
          localStorage.setItem('learningContent', JSON.stringify(result.data));
          console.log('Learning content loaded from API');
        } else {
          throw new Error('API failed');
        }
      } catch (apiError) {
        console.log('API not available, using default content');
        // Use default content if API fails
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
        };
        setLearningContent(defaultContent);
        localStorage.setItem('learningContent', JSON.stringify(defaultContent));
      }
    } catch (error) {
      console.error('Error loading learning content:', error);
      setError(null); // Don't show error, just use fallback
    } finally {
      setLoading(false);
    }
  };

  // Get only published content for public display
  const getPublishedContent = () => {
    const published = {
      courses: learningContent.courses.filter(course => course.status === 'Published'),
      videos: learningContent.videos.filter(video => video.status === 'Published'),
      liveStreams: learningContent.liveStreams.filter(stream => stream.status === 'Scheduled' || stream.status === 'Live'),
      resources: learningContent.resources.filter(resource => resource.status === 'Published')
    };
    console.log('Published content:', published);
    return published;
  };

  // Admin functions for managing content
  const addContent = async (type, content) => {
    try {
      const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
      const newContent = {
        ...content,
        id: Date.now(),
        status: content.status || 'Published',
        createdAt: new Date().toISOString(),
        students: type === 'course' ? 0 : undefined,
        views: type === 'video' ? 0 : undefined,
        likes: type === 'video' ? 0 : undefined,
        downloads: type === 'resource' ? 0 : undefined,
        registrations: type === 'stream' ? 0 : undefined
      };

      // Update local state immediately
      const updatedContent = {
        ...learningContent,
        [contentType]: [...learningContent[contentType], newContent]
      };
      
      setLearningContent(updatedContent);
      localStorage.setItem('learningContent', JSON.stringify(updatedContent));
      
      // Try to sync with API in background
      try {
        const response = await fetch(`${API_BASE_URL}/api/learning`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type, content: newContent })
        });
        
        if (response.ok) {
          console.log('Content synced with API');
        }
      } catch (apiError) {
        console.log('API sync failed, content saved locally');
      }
      
      console.log('Added content:', newContent);
      return newContent;
    } catch (error) {
      console.error('Error adding content:', error);
      throw error;
    }
  };

  const updateContent = async (type, id, updates) => {
    try {
      const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
      
      // Update local state immediately
      const updatedContent = {
        ...learningContent,
        [contentType]: learningContent[contentType].map(item =>
          item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
        )
      };
      
      setLearningContent(updatedContent);
      localStorage.setItem('learningContent', JSON.stringify(updatedContent));
      
      // Try to sync with API in background
      try {
        const response = await fetch(`${API_BASE_URL}/api/learning`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type, id, updates })
        });
        
        if (response.ok) {
          console.log('Content synced with API');
        }
      } catch (apiError) {
        console.log('API sync failed, content saved locally');
      }
      
      console.log('Updated content:', { type, id, updates });
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  };

  const deleteContent = async (type, id) => {
    try {
      const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
      
      // Update local state immediately
      const updatedContent = {
        ...learningContent,
        [contentType]: learningContent[contentType].filter(item => item.id !== id)
      };
      
      setLearningContent(updatedContent);
      localStorage.setItem('learningContent', JSON.stringify(updatedContent));
      
      // Try to sync with API in background
      try {
        const response = await fetch(`${API_BASE_URL}/api/learning?type=${type}&id=${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          console.log('Content synced with API');
        }
      } catch (apiError) {
        console.log('API sync failed, content saved locally');
      }
      
      console.log('Deleted content:', { type, id });
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  };

  const publishContent = async (type, id) => {
    await updateContent(type, id, { status: 'Published' });
  };

  const unpublishContent = async (type, id) => {
    await updateContent(type, id, { status: 'Draft' });
  };

  const resetToDefaults = async () => {
    await loadLearningContent();
  };

  const value = {
    learningContent,
    publishedContent: getPublishedContent(),
    loading,
    error,
    addContent,
    updateContent,
    deleteContent,
    publishContent,
    unpublishContent,
    resetToDefaults,
    refreshContent: loadLearningContent
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