import React, { useState } from 'react';
import { useLearning } from '../contexts/LearningContext';

const LearningHub = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState('courses');
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  let publishedContent;
  try {
    const learningContext = useLearning();
    publishedContent = learningContext.publishedContent;
  } catch (error) {
    console.error('Learning context error:', error);
    // Fallback data
    publishedContent = {
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
          topics: ["Market Analysis", "Risk Management", "Trading Psychology", "Technical Analysis"]
        }
      ],
      videos: [],
      liveStreams: [],
      resources: []
    };
  }

  // Use published content from context or fallback
  const learningContent = publishedContent;

  const categories = [
    { id: 'courses', label: 'Courses', icon: '🎓' },
    { id: 'videos', label: 'Videos', icon: '🎥' },
    { id: 'resources', label: 'Resources', icon: '📚' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </button>
            <div className="text-right">
              <div className="text-sm opacity-90">Learn with</div>
              <div className="text-2xl font-bold">Dagim Tariku</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Master Trading with Expert Guidance
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Learn from a professional trader with years of experience in forex markets. 
              Get access to courses, tutorials, and resources designed to accelerate your trading journey.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Category Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-slate-800 rounded-lg p-1">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors ${
                  activeCategory === category.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Section */}
        {activeCategory === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningContent.courses.map(course => (
              <div key={course.id} className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-750 transition-colors">
                <div className="p-6">
                  <div className="text-4xl mb-4 text-center">{course.thumbnail}</div>
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-gray-400 mb-4">{course.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Duration:</span>
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Lessons:</span>
                      <span>{course.lessons}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Level:</span>
                      <span>{course.level}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Topics covered:</div>
                    <div className="flex flex-wrap gap-1">
                      {course.topics.map((topic, index) => (
                        <span key={index} className="bg-slate-700 text-xs px-2 py-1 rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-emerald-400">{course.price}</span>
                    <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors">
                      {course.price === 'Free' ? 'Start Learning' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Videos Section */}
        {activeCategory === 'videos' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningContent.videos.map(video => (
                <div key={video.id} className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-750 transition-colors cursor-pointer"
                     onClick={() => setSelectedVideo(video)}>
                  <div className="aspect-video bg-slate-700 flex items-center justify-center text-4xl">
                    {video.thumbnail}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{video.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{video.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="bg-emerald-900 text-emerald-300 px-2 py-1 rounded">
                        {video.category}
                      </span>
                      <div className="text-gray-400">
                        {video.duration} • {video.views} views
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Video Modal */}
            {selectedVideo && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">{selectedVideo.title}</h2>
                      <button
                        onClick={() => setSelectedVideo(null)}
                        className="text-gray-400 hover:text-white text-2xl"
                      >
                        ×
                      </button>
                    </div>
                    <div className="aspect-video bg-slate-700 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🎥</div>
                        <p className="text-gray-400">Video player would be embedded here</p>
                        <p className="text-sm text-gray-500 mt-2">
                          In production, this would show the actual video content
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">{selectedVideo.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resources Section */}
        {activeCategory === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningContent.resources.map(resource => (
              <div key={resource.id} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{resource.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
                    <p className="text-gray-400 mb-4">{resource.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-400">
                        <div>Type: {resource.type}</div>
                        <div>Format: {resource.format}</div>
                        <div>Size: {resource.size}</div>
                      </div>
                    </div>
                    <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors w-full">
                      {resource.type === 'Download' ? 'Download' : 'Access Tool'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* About Instructor */}
        <div className="mt-12 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">👨‍💼</div>
            <h2 className="text-3xl font-bold mb-4">About Dagim Tariku</h2>
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-300 mb-6">
              Professional forex trader with over 5 years of experience in financial markets. 
              Specializes in price action trading, risk management, and trading psychology. 
              Has helped hundreds of traders develop profitable trading strategies through 
              comprehensive education and mentorship programs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400">500+</div>
                <div className="text-gray-400">Students Taught</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">5+ Years</div>
                <div className="text-gray-400">Trading Experience</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">95%</div>
                <div className="text-gray-400">Student Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningHub;