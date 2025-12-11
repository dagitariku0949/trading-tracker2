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
      
      const response = await fetch(`${API_BASE_URL}/api/learning/content`);
      const result = await response.json();
      
      if (result.success) {
        setLearningContent(result.data);
        console.log('Learning content loaded from API');
      } else {
        throw new Error(result.message || 'Failed to load learning content');
      }
    } catch (error) {
      console.error('Error loading learning content:', error);
      setError(error.message);
      
      // Fallback to default content if API fails
      setLearningContent({
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
          }
        ],
        videos: [],
        liveStreams: [],
        resources: []
      });
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
      const ownerToken = localStorage.getItem('ownerToken');
      if (!ownerToken) {
        throw new Error('Owner authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/learning/content/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ownerToken}`
        },
        body: JSON.stringify(content)
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
        setLearningContent(prev => ({
          ...prev,
          [contentType]: [...prev[contentType], result.data]
        }));
        console.log('Added content:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to add content');
      }
    } catch (error) {
      console.error('Error adding content:', error);
      throw error;
    }
  };

  const updateContent = async (type, id, updates) => {
    try {
      const ownerToken = localStorage.getItem('ownerToken');
      if (!ownerToken) {
        throw new Error('Owner authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/learning/content/${type}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ownerToken}`
        },
        body: JSON.stringify(updates)
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
        setLearningContent(prev => ({
          ...prev,
          [contentType]: prev[contentType].map(item =>
            item.id === id ? result.data : item
          )
        }));
        console.log('Updated content:', result.data);
      } else {
        throw new Error(result.message || 'Failed to update content');
      }
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  };

  const deleteContent = async (type, id) => {
    try {
      const ownerToken = localStorage.getItem('ownerToken');
      if (!ownerToken) {
        throw new Error('Owner authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/learning/content/${type}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${ownerToken}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
        setLearningContent(prev => ({
          ...prev,
          [contentType]: prev[contentType].filter(item => item.id !== id)
        }));
        console.log('Deleted content:', { type, id });
      } else {
        throw new Error(result.message || 'Failed to delete content');
      }
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