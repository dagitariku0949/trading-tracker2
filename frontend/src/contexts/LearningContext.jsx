import React, { createContext, useContext, useState, useEffect } from 'react';

const LearningContext = createContext();

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

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

  // Auto-refresh content every 30 seconds to sync changes across browsers
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing learning content...');
      loadLearningContent();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);



  const loadLearningContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try API first with cache busting to ensure fresh content
      try {
        const cacheBuster = `?v=${Date.now()}&force=true`;
        const apiUrl = `${API_BASE_URL}/api/learning${cacheBuster}`;
        console.log('API_BASE_URL:', API_BASE_URL);
        console.log('Fetching from API:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success && result.data) {
          setLearningContent(result.data);
          localStorage.setItem('learningContent', JSON.stringify({
            ...result.data,
            _cached_at: new Date().toISOString(),
            _version: result.version || 'api'
          }));
          console.log('Learning content loaded from API successfully');
          return;
        } else {
          throw new Error('Invalid API response');
        }
      } catch (apiError) {
        console.error('API failed completely:', apiError.message);
        setError('Failed to load learning content from API');
        
        // Don't use hardcoded fallback - this prevents admin changes from working
        // Instead, keep trying to load from API
        setTimeout(() => {
          console.log('Retrying API call in 5 seconds...');
          loadLearningContent();
        }, 5000);
      }
    } catch (error) {
      console.error('Error loading learning content:', error);
      setError(null);
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
      // Try API first
      try {
        const response = await fetch(`${API_BASE_URL}/api/learning`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type, content })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Refresh all content to ensure consistency across browsers
            await loadLearningContent();
            console.log('Content added via API, refreshed all content');
            return result.data;
          }
        }
        throw new Error('API call failed');
      } catch (apiError) {
        console.log('API failed, adding locally:', apiError.message);
        
        // Fallback to local storage
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

        const updatedContent = {
          ...learningContent,
          [contentType]: [...learningContent[contentType], newContent]
        };
        
        setLearningContent(updatedContent);
        localStorage.setItem('learningContent', JSON.stringify(updatedContent));
        console.log('Content added locally:', newContent);
        return newContent;
      }
    } catch (error) {
      console.error('Error adding content:', error);
      throw error;
    }
  };

  const updateContent = async (type, id, updates) => {
    try {
      // Try API first
      try {
        const response = await fetch(`${API_BASE_URL}/api/learning`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type, id, updates })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Refresh all content to ensure consistency across browsers
            await loadLearningContent();
            console.log('Content updated via API, refreshed all content');
            return;
          }
        }
        throw new Error('API call failed');
      } catch (apiError) {
        console.log('API failed, updating locally:', apiError.message);
        
        // Fallback to local update
        const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
        const updatedContent = {
          ...learningContent,
          [contentType]: learningContent[contentType].map(item =>
            item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
          )
        };
        
        setLearningContent(updatedContent);
        localStorage.setItem('learningContent', JSON.stringify(updatedContent));
        console.log('Content updated locally:', { type, id, updates });
      }
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  };

  const deleteContent = async (type, id) => {
    try {
      // Try API first
      try {
        const response = await fetch(`${API_BASE_URL}/api/learning?type=${type}&id=${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Refresh all content to ensure consistency across browsers
            await loadLearningContent();
            console.log('Content deleted via API, refreshed all content');
            return;
          }
        }
        throw new Error('API call failed');
      } catch (apiError) {
        console.log('API failed, deleting locally:', apiError.message);
        
        // Fallback to local delete
        const contentType = type === 'stream' ? 'liveStreams' : `${type}s`;
        const updatedContent = {
          ...learningContent,
          [contentType]: learningContent[contentType].filter(item => item.id !== id)
        };
        
        setLearningContent(updatedContent);
        localStorage.setItem('learningContent', JSON.stringify(updatedContent));
        console.log('Content deleted locally:', { type, id });
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

  const forceRefresh = async () => {
    console.log('FORCE REFRESH: Clearing all caches...');
    // Clear all possible caches
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any browser cache for the API endpoint
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Browser caches cleared');
      } catch (error) {
        console.log('Cache clearing failed:', error);
      }
    }
    
    // Force reload content
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
    refreshContent: loadLearningContent,
    forceRefresh
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