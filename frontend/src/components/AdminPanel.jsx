import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLearning } from '../contexts/LearningContext';
import { useAuth } from '../contexts/AuthContext';

import UserManagementTab from './UserManagementTab';

const AdminPanel = ({ onBackToDashboard, onLogout, trades = [], metrics = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [serverStatus, setServerStatus] = useState('checking');
  const [logs, setLogs] = useState([]);
  const [selectedUserTrades, setSelectedUserTrades] = useState(null);
  const [showTradesModal, setShowTradesModal] = useState(false);

  // Learning content from context
  let learningContent, addContent, updateContent, deleteContent, publishContent, unpublishContent, resetToDefaults;
  
  try {
    const learningContext = useLearning();
    learningContent = learningContext.learningContent;
    addContent = learningContext.addContent;
    updateContent = learningContext.updateContent;
    deleteContent = learningContext.deleteContent;
    publishContent = learningContext.publishContent;
    unpublishContent = learningContext.unpublishContent;
    resetToDefaults = learningContext.resetToDefaults;
  } catch (error) {
    console.error('Learning context error:', error);
    // Fallback data
    learningContent = {
      videos: [],
      articles: [],
      courses: []
    };
  }

  const [showContentModal, setShowContentModal] = useState(false);
  const [contentModalType, setContentModalType] = useState('');
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadTradingSummary();
    const interval = setInterval(checkServerStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    try {
      // Mock user data for demo
      const mockUsers = [
        {
          userId: 1,
          name: 'Demo Trader',
          email: 'demo@example.com',
          role: 'user',
          totalTrades: trades.length,
          totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(2),
          winRate: trades.length > 0 ? ((trades.filter(t => (t.pnl || 0) > 0).length / trades.length) * 100).toFixed(1) : '0',
          status: 'active',
          accountBalance: '10000.00',
          lastTradeDate: trades.length > 0 ? trades[0].entry_date : new Date().toISOString()
        }
      ];
      setUsers(mockUsers);
      addLog('Users loaded successfully', 'success');
    } catch (error) {
      addLog('Failed to load users: ' + error.message, 'error');
    }
  };

  const loadTradingSummary = async () => {
    try {
      // Mock user trades data
      const mockTradesData = {
        trades: trades.slice(0, 10),
        analytics: {
          totalTrades: trades.length,
          winRate: trades.length > 0 ? ((trades.filter(t => (t.pnl || 0) > 0).length / trades.length) * 100).toFixed(1) : '0',
          totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(2),
          avgPnL: trades.length > 0 ? (trades.reduce((sum, t) => sum + (t.pnl || 0), 0) / trades.length).toFixed(2) : '0'
        }
      };
      
      setSelectedUserTrades(mockTradesData);
      addLog('Trading summary loaded', 'success');
    } catch (error) {
      addLog('Failed to load trading summary: ' + error.message, 'error');
    }
  };

  const handleContentAction = (action, type, content = null) => {
    if (action === 'create') {
      setContentModalType(type);
      setEditingContent(null);
      setFormData({
        title: '',
        description: '',
        video_url: '',
        uploadMethod: 'url',
        category: 'beginner',
        duration: '',
        tags: ''
      });
      setShowContentModal(true);
    } else if (action === 'edit') {
      setContentModalType(type);
      setEditingContent(content);
      setFormData({
        title: content.title || '',
        description: content.description || '',
        video_url: content.video_url || '',
        uploadMethod: 'url',
        category: content.category || 'beginner',
        duration: content.duration || '',
        tags: Array.isArray(content.tags) ? content.tags.join(', ') : (content.tags || '')
      });
      setShowContentModal(true);
    }
  };

  const handleContentSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      const newContent = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published: false
      };

      if (editingContent) {
        await updateContent(contentModalType, editingContent.id, newContent);
        addLog(`${contentModalType} updated successfully`, 'success');
      } else {
        await addContent(contentModalType, newContent);
        addLog(`${contentModalType} created successfully`, 'success');
      }

      setShowContentModal(false);
      setEditingContent(null);
      setFormData({});
    } catch (error) {
      addLog(`Failed to save ${contentModalType}: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { timestamp, message, type }]);
  };

  const checkServerStatus = async () => {
    try {
      const response = await axios.get('http://localhost:4000/', { timeout: 3000 });
      setServerStatus('online');
      
      const uniqueAccounts = new Set(trades.map(t => t.account || 'Default')).size;
      
      if (logs.length === 0) {
        addLog('Admin panel initialized', 'success');
        addLog(`Found ${trades.length} trades across ${uniqueAccounts} accounts`, 'info');
        addLog(`Server status: ${response.data.message}`, 'success');
      }
    } catch (error) {
      setServerStatus('offline');
      if (logs.length === 0) {
        addLog('Backend server is offline', 'error');
        addLog('Running in demo mode with mock data', 'info');
      }
    }
  };

  const handleAction = async (action) => {
    addLog(`Executing ${action}...`, 'info');
    
    try {
      switch (action) {
        case 'backup':
          addLog('Database backup completed', 'success');
          break;
          
        case 'export':
          const csv = convertToCSV(trades);
          downloadCSV(csv, `trades_export_${new Date().toISOString().split('T')[0]}.csv`);
          addLog(`Exported ${trades.length} trades to CSV`, 'success');
          break;
          
        case 'reset':
          if (confirm('Reset all learning content to defaults? This cannot be undone.')) {
            await resetToDefaults();
            addLog('Learning content reset to defaults', 'success');
          }
          break;
          
        default:
          addLog(`Action ${action} completed`, 'success');
      }
    } catch (error) {
      addLog(`Action ${action} failed: ${error.message}`, 'error');
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const StatusIndicator = ({ status, label }) => (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${
        status === 'online' || status === 'connected' ? 'bg-green-500' :
        status === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
      }`}></div>
      <span className="text-sm text-gray-300">{label}: {status}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-emerald-400">🔧 Admin Panel</h1>
            <StatusIndicator status={serverStatus} label="Backend" />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onBackToDashboard}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition"
            >
              ← Dashboard
            </button>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 min-h-screen p-4">
          <nav className="space-y-2">
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'users', label: '👥 Users', icon: '👥' },
              { id: 'learning', label: '📚 Learning', icon: '📚' },
              { id: 'system', label: '⚙️ System', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">System Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-emerald-400">{users.length}</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Total Trades</h3>
                  <p className="text-3xl font-bold text-blue-400">{trades.length}</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Learning Content</h3>
                  <p className="text-3xl font-bold text-purple-400">
                    {(learningContent?.videos?.length || 0) + (learningContent?.articles?.length || 0)}
                  </p>
                </div>
              </div>

              {/* Activity Logs */}
              <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Activity Logs</h3>
                <div className="bg-slate-900 p-4 rounded-lg h-64 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-gray-400">{log.timestamp}</span>
                      <span className={`text-sm ${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'success' ? 'text-green-400' : 'text-gray-300'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <UserManagementTab />
          )}

          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Learning Content Management</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleContentAction('create', 'video')}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition"
                  >
                    + Add Video
                  </button>
                  <button
                    onClick={() => handleContentAction('create', 'article')}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition"
                  >
                    + Add Article
                  </button>
                </div>
              </div>

              {/* Content Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Videos */}
                <div className="bg-slate-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Videos ({learningContent?.videos?.length || 0})</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {learningContent?.videos?.map(video => (
                      <div key={video.id} className="bg-slate-700 p-4 rounded-lg">
                        <h4 className="font-semibold">{video.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{video.description}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            video.published ? 'bg-green-600' : 'bg-yellow-600'
                          }`}>
                            {video.published ? 'Published' : 'Draft'}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleContentAction('edit', 'video', video)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => video.published ? unpublishContent('video', video.id) : publishContent('video', video.id)}
                              className="text-green-400 hover:text-green-300 text-sm"
                            >
                              {video.published ? 'Unpublish' : 'Publish'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Articles */}
                <div className="bg-slate-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Articles ({learningContent?.articles?.length || 0})</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {learningContent?.articles?.map(article => (
                      <div key={article.id} className="bg-slate-700 p-4 rounded-lg">
                        <h4 className="font-semibold">{article.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{article.description}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            article.published ? 'bg-green-600' : 'bg-yellow-600'
                          }`}>
                            {article.published ? 'Published' : 'Draft'}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleContentAction('edit', 'article', article)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => article.published ? unpublishContent('article', article.id) : publishContent('article', article.id)}
                              className="text-green-400 hover:text-green-300 text-sm"
                            >
                              {article.published ? 'Unpublish' : 'Publish'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">System Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Database Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleAction('backup')}
                      className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition"
                    >
                      💾 Backup Database
                    </button>
                    <button
                      onClick={() => handleAction('export')}
                      className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition"
                    >
                      📤 Export Trades
                    </button>
                    <button
                      onClick={() => handleAction('reset')}
                      className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition"
                    >
                      🔄 Reset Learning Content
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">System Status</h3>
                  <div className="space-y-3">
                    <StatusIndicator status={serverStatus} label="Backend Server" />
                    <StatusIndicator status="connected" label="Database" />
                    <StatusIndicator status="online" label="File Storage" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Modal */}
      {showContentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingContent ? 'Edit' : 'Create'} {contentModalType.charAt(0).toUpperCase() + contentModalType.slice(1)}
            </h3>
            
            <form onSubmit={handleContentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white h-24"
                  required
                />
              </div>

              {contentModalType === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Video URL</label>
                  <input
                    type="url"
                    value={formData.video_url || ''}
                    onChange={(e) => handleInputChange('video_url', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowContentModal(false);
                    setEditingContent(null);
                    setFormData({});
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-3 rounded-lg font-semibold transition-colors"
                  disabled={isUploading || !formData.title || !formData.description}
                >
                  {isUploading ? 'Processing...' : 
                   `${editingContent ? 'Update' : 'Create'} ${contentModalType.charAt(0).toUpperCase() + contentModalType.slice(1)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;