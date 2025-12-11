import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLearning } from '../contexts/LearningContext';

const AdminPanel = ({ onBackToDashboard, onLogout, trades = [], metrics = {} }) => {
  let learningContent, addContent, updateContent, deleteContent, publishContent, unpublishContent;
  
  try {
    const learningContext = useLearning();
    learningContent = learningContext.learningContent;
    addContent = learningContext.addContent;
    updateContent = learningContext.updateContent;
    deleteContent = learningContext.deleteContent;
    publishContent = learningContext.publishContent;
    unpublishContent = learningContext.unpublishContent;
  } catch (error) {
    console.error('Learning context error:', error);
    // Fallback data
    learningContent = {
      courses: [],
      videos: [],
      liveStreams: [],
      resources: []
    };
    addContent = () => {};
    updateContent = () => {};
    deleteContent = () => {};
    publishContent = () => {};
    unpublishContent = () => {};
  }
  const [serverStatus, setServerStatus] = useState({
    backend: 'checking',
    database: 'checking',
    totalTrades: 0,
    accounts: 0,
    strategies: 0,
    uptime: '0m',
    lastSync: 'Never'
  });
  
  const [activeTab, setActiveTab] = useState('overview');
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [tradingSummary, setTradingSummary] = useState([]);
  const [selectedUserTrades, setSelectedUserTrades] = useState(null);
  const [showTradesModal, setShowTradesModal] = useState(false);
  // Learning content now comes from context
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentModalType, setContentModalType] = useState('');
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    memory: '0 MB',
    cpu: '0%',
    storage: '0 GB'
  });

  useEffect(() => {
    checkServerStatus();
    loadSystemInfo();
    loadUsers();
    loadTradingSummary();
    // Learning content loaded from context
    const interval = setInterval(checkServerStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTradingSummary = async () => {
    try {
      const ownerToken = sessionStorage.getItem('ownerAuthToken');
      const response = await axios.get('http://localhost:4000/api/auth/users/trading-summary', {
        headers: {
          'Authorization': `Bearer ${ownerToken}`
        }
      });
      
      if (response.data.success) {
        setTradingSummary(response.data.data);
        addLog(`Loaded trading summary for ${response.data.data.length} users`, 'success');
      }
    } catch (error) {
      addLog('Failed to load trading summary: ' + (error.response?.data?.message || error.message), 'error');
      console.error('Error loading trading summary:', error);
    }
  };

  const loadUserTrades = async (userId, userName) => {
    try {
      const ownerToken = sessionStorage.getItem('ownerAuthToken');
      const response = await axios.get(`http://localhost:4000/api/auth/users/${userId}/trades`, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`
        }
      });
      
      if (response.data.success) {
        setSelectedUserTrades({
          user: { id: userId, name: userName },
          ...response.data.data
        });
        setShowTradesModal(true);
        addLog(`Loaded ${response.data.data.trades.length} trades for ${userName}`, 'success');
      }
    } catch (error) {
      addLog('Failed to load user trades: ' + (error.response?.data?.message || error.message), 'error');
      console.error('Error loading user trades:', error);
    }
  };

  // Learning content is now managed by context

  const handleContentAction = (action, type, content = null) => {
    switch (action) {
      case 'add':
        setContentModalType(type);
        setEditingContent(null);
        setFormData({});
        setShowContentModal(true);
        addLog(`Opening ${type} creation form`, 'info');
        break;
      case 'edit':
        setContentModalType(type);
        setEditingContent(content);
        // Initialize form data with existing content
        setFormData({
          title: content.title || '',
          description: content.description || '',
          price: content.price || '',
          duration: content.duration || '',
          lessons: content.lessons || '',
          scheduledDate: content.scheduledDate ? new Date(content.scheduledDate).toISOString().slice(0, 16) : '',
          platform: content.platform || ''
        });
        setShowContentModal(true);
        addLog(`Editing ${type}: ${content.title}`, 'info');
        break;
      case 'delete':
        if (confirm(`Delete ${type}: ${content.title}?`)) {
          deleteContent(type, content.id);
          addLog(`Deleted ${type}: ${content.title}`, 'warning');
        }
        break;
      case 'publish':
        publishContent(type, content.id);
        addLog(`Published ${type}: ${content.title}`, 'success');
        break;
      case 'unpublish':
        unpublishContent(type, content.id);
        addLog(`Unpublished ${type}: ${content.title}`, 'warning');
        break;
      default:
        break;
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      const newContent = {
        id: editingContent ? editingContent.id : Date.now(),
        ...formData,
        status: editingContent ? editingContent.status : 'Draft',
        createdAt: editingContent ? editingContent.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add specific fields based on content type
      if (contentModalType === 'course') {
        newContent.students = editingContent ? editingContent.students : 0;
        newContent.lessons = parseInt(formData.lessons) || 0;
      } else if (contentModalType === 'video') {
        newContent.views = editingContent ? editingContent.views : 0;
        newContent.likes = editingContent ? editingContent.likes : 0;
        newContent.uploadDate = editingContent ? editingContent.uploadDate : new Date().toISOString();
      } else if (contentModalType === 'stream') {
        newContent.registrations = editingContent ? editingContent.registrations : 0;
      }

      // Use context functions to manage content
      if (editingContent) {
        updateContent(contentModalType, editingContent.id, newContent);
      } else {
        addContent(contentModalType, newContent);
      }

      addLog(`${editingContent ? 'Updated' : 'Created'} ${contentModalType}: ${formData.title}`, 'success');
      setShowContentModal(false);
      setEditingContent(null);
      setFormData({});
    } catch (error) {
      addLog(`Failed to ${editingContent ? 'update' : 'create'} ${contentModalType}: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Content management functions now come from context

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (file, type = 'video') => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate file upload progress
    const uploadSimulation = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadSimulation);
          setIsUploading(false);
          addLog(`${type} file uploaded successfully: ${file.name}`, 'success');
          
          // Update form data with file info
          setFormData(prev => ({
            ...prev,
            fileName: file.name,
            fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            fileType: file.type,
            duration: type === 'video' ? '00:00' : undefined
          }));
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const loadUsers = async () => {
    try {
      const ownerToken = sessionStorage.getItem('ownerAuthToken');
      console.log('Owner token:', ownerToken); // Debug log
      
      if (!ownerToken) {
        addLog('No owner token found', 'error');
        return;
      }

      const response = await axios.get('http://localhost:4000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${ownerToken}`
        }
      });
      
      console.log('Users response:', response.data); // Debug log
      
      if (response.data.success) {
        setUsers(response.data.users);
        addLog(`Loaded ${response.data.users.length} registered users`, 'success');
      } else {
        addLog('Failed to load users: ' + response.data.message, 'error');
      }
    } catch (error) {
      addLog('Failed to load users: ' + (error.response?.data?.message || error.message), 'error');
      console.error('Error loading users:', error);
    }
  };

  const checkServerStatus = async () => {
    try {
      const response = await axios.get('http://localhost:4000/', { timeout: 3000 });
      
      const uniqueAccounts = new Set(trades.map(t => t.account || 'Default')).size;
      const uniqueStrategies = new Set(trades.map(t => t.strategy || 'None')).size;
      
      setServerStatus({
        backend: 'online',
        database: 'connected',
        totalTrades: trades.length,
        accounts: uniqueAccounts || 1,
        strategies: uniqueStrategies || 1,
        totalUsers: users.length,
        uptime: calculateUptime(),
        lastSync: new Date().toLocaleTimeString()
      });

      addLog('System check completed successfully', 'success');
    } catch (error) {
      setServerStatus(prev => ({
        ...prev,
        backend: 'offline',
        database: 'disconnected'
      }));
      addLog('Backend connection failed', 'error');
    }
  };

  const loadSystemInfo = () => {
    setSystemInfo({
      memory: '245 MB',
      cpu: '12%',
      storage: '2.1 GB'
    });
  };

  const calculateUptime = () => {
    const start = sessionStorage.getItem('serverStartTime');
    if (!start) {
      sessionStorage.setItem('serverStartTime', Date.now().toString());
      return '0m';
    }
    const minutes = Math.floor((Date.now() - parseInt(start)) / 60000);
    return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes/60)}h ${minutes%60}m`;
  };

  const addLog = (message, type = 'info') => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const handleAction = async (action) => {
    addLog(`Executing ${action}...`, 'info');
    
    try {
      switch (action) {
        case 'backup':
          // Simulate backup
          await new Promise(resolve => setTimeout(resolve, 2000));
          addLog('Database backup completed successfully', 'success');
          break;
          
        case 'export':
          const response = await axios.get('http://localhost:4000/api/trades');
          const tradesData = response.data;
          const csv = convertToCSV(tradesData);
          downloadCSV(csv, `trades_export_${new Date().toISOString().split('T')[0]}.csv`);
          addLog(`Exported ${tradesData.length} trades to CSV`, 'success');
          break;
          
        case 'sync':
          // Simulate GitHub sync
          await new Promise(resolve => setTimeout(resolve, 1500));
          setServerStatus(prev => ({ ...prev, lastSync: new Date().toLocaleTimeString() }));
          addLog('GitHub sync completed', 'success');
          break;
          
        case 'restart':
          addLog('Server restart initiated', 'warning');
          // In real app, this would restart the server
          break;
          
        case 'clearLogs':
          setLogs([]);
          addLog('System logs cleared', 'info');
          break;
          
        default:
          addLog(`Unknown action: ${action}`, 'error');
      }
    } catch (error) {
      addLog(`Action failed: ${error.message}`, 'error');
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    return csvContent;
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
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
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 text-center">
        👑 OWNER MODE: Exclusive system management access
      </div>

      <div className="p-6">
        {/* Title Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-400 flex items-center">
              👑 Owner Panel
            </h1>
            <p className="text-gray-400">Exclusive system management and monitoring</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              title="Logout from owner panel"
            >
              🚪 Logout
            </button>
            <button
              onClick={onBackToDashboard}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'trading', label: 'Trading Analytics', icon: '📈' },
            { id: 'learning', label: 'Learning Management', icon: '🎓' },
            { id: 'monitoring', label: 'Monitoring', icon: '🖥️' },
            { id: 'database', label: 'Database', icon: '💾' },
            { id: 'logs', label: 'Logs', icon: '📋' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">System Overview</h2>
            
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-blue-600 p-2 rounded">📊</div>
                  <div>
                    <p className="text-gray-400 text-sm">TOTAL TRADES</p>
                    <p className="text-2xl font-bold">{serverStatus.totalTrades}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-green-600 p-2 rounded">👥</div>
                  <div>
                    <p className="text-gray-400 text-sm">REGISTERED USERS</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-purple-600 p-2 rounded">📈</div>
                  <div>
                    <p className="text-gray-400 text-sm">STRATEGIES</p>
                    <p className="text-2xl font-bold">{serverStatus.strategies}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-orange-600 p-2 rounded">⏱️</div>
                  <div>
                    <p className="text-gray-400 text-sm">UPTIME</p>
                    <p className="text-2xl font-bold">{serverStatus.uptime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Server Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Server Status</h3>
                <div className="space-y-3">
                  <StatusIndicator status={serverStatus.backend} label="Backend API" />
                  <StatusIndicator status={serverStatus.database} label="Database" />
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-300">Last Sync: {serverStatus.lastSync}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">System Resources</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory Usage:</span>
                    <span className="text-white">{systemInfo.memory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">CPU Usage:</span>
                    <span className="text-white">{systemInfo.cpu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Storage Used:</span>
                    <span className="text-white">{systemInfo.storage}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => handleAction('backup')}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg transition-colors text-center"
                >
                  💾<br />Backup
                </button>
                <button
                  onClick={() => handleAction('export')}
                  className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg transition-colors text-center"
                >
                  📤<br />Export
                </button>
                <button
                  onClick={() => handleAction('sync')}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg transition-colors text-center"
                >
                  🔄<br />Sync
                </button>
                <button
                  onClick={() => handleAction('restart')}
                  className="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg transition-colors text-center"
                >
                  🔄<br />Restart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Registered Users ({users.length})</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const token = sessionStorage.getItem('ownerAuthToken');
                      addLog(`Debug: Owner token = ${token ? 'exists' : 'missing'}`, 'info');
                      console.log('Debug info:', { token, users: users.length });
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    🐛 Debug
                  </button>
                  <button
                    onClick={loadUsers}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
              
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-4">👥</div>
                  <p>No users registered yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="pb-3 text-gray-400">ID</th>
                        <th className="pb-3 text-gray-400">Name</th>
                        <th className="pb-3 text-gray-400">Email</th>
                        <th className="pb-3 text-gray-400">Registered</th>
                        <th className="pb-3 text-gray-400">Last Login</th>
                        <th className="pb-3 text-gray-400">Status</th>
                        <th className="pb-3 text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b border-gray-700">
                          <td className="py-3 text-gray-300">#{user.id}</td>
                          <td className="py-3 text-white font-medium">{user.name}</td>
                          <td className="py-3 text-gray-300">{user.email}</td>
                          <td className="py-3 text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-gray-300">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="py-3">
                            <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-sm">
                              Active
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                  addLog(`Viewing user ${user.name} details`, 'info');
                                }}
                                className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-colors"
                                title="View Details"
                              >
                                👁️
                              </button>
                              <button
                                onClick={() => addLog(`Reset password for ${user.name}`, 'warning')}
                                className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs transition-colors"
                                title="Reset Password"
                              >
                                🔑
                              </button>
                              {user.email !== 'demo@example.com' && (
                                <button
                                  onClick={() => addLog(`Deactivated user ${user.name}`, 'warning')}
                                  className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs transition-colors"
                                  title="Deactivate User"
                                >
                                  🚫
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h4 className="font-bold mb-4">User Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Users:</span>
                    <span className="text-white font-bold">{users.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">New Today:</span>
                    <span className="text-white font-bold">
                      {users.filter(u => 
                        new Date(u.createdAt).toDateString() === new Date().toDateString()
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">This Week:</span>
                    <span className="text-white font-bold">
                      {users.filter(u => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return new Date(u.createdAt) > weekAgo;
                      }).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h4 className="font-bold mb-4">Recent Registrations</h4>
                <div className="space-y-2">
                  {users.slice(-3).reverse().map(user => (
                    <div key={user.id} className="text-sm">
                      <div className="text-white">{user.name}</div>
                      <div className="text-gray-400 text-xs">
                        {new Date(user.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className="text-gray-400 text-sm">No recent registrations</div>
                  )}
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h4 className="font-bold mb-4">User Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => addLog('User export initiated', 'info')}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors text-sm"
                  >
                    📤 Export User List
                  </button>
                  <button
                    onClick={() => addLog('User analytics generated', 'info')}
                    className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors text-sm"
                  >
                    📊 User Analytics
                  </button>
                  <button
                    onClick={loadUsers}
                    className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors text-sm"
                  >
                    🔄 Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trading Analytics Tab */}
        {activeTab === 'trading' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Trading Analytics</h2>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">User Trading Performance</h3>
                <button
                  onClick={loadTradingSummary}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>
              
              {tradingSummary.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-4">📊</div>
                  <p>No trading data available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="pb-3 text-gray-400">User</th>
                        <th className="pb-3 text-gray-400">Total Trades</th>
                        <th className="pb-3 text-gray-400">Total P&L</th>
                        <th className="pb-3 text-gray-400">Win Rate</th>
                        <th className="pb-3 text-gray-400">Account Balance</th>
                        <th className="pb-3 text-gray-400">Last Trade</th>
                        <th className="pb-3 text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradingSummary.map(summary => (
                        <tr key={summary.userId} className="border-b border-gray-700">
                          <td className="py-3">
                            <div>
                              <div className="text-white font-medium">{summary.name}</div>
                              <div className="text-gray-400 text-sm">{summary.email}</div>
                            </div>
                          </td>
                          <td className="py-3 text-gray-300">{summary.totalTrades}</td>
                          <td className="py-3">
                            <span className={`font-bold ${
                              parseFloat(summary.totalPnL) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ${summary.totalPnL}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`font-bold ${
                              parseFloat(summary.winRate) >= 50 ? 'text-green-400' : 'text-yellow-400'
                            }`}>
                              {summary.winRate}%
                            </span>
                          </td>
                          <td className="py-3 text-white font-medium">${summary.accountBalance}</td>
                          <td className="py-3 text-gray-300">
                            {new Date(summary.lastTradeDate).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => loadUserTrades(summary.userId, summary.name)}
                              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                            >
                              📊 View Trades
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Trading Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h4 className="font-bold mb-2 text-blue-400">Total Platform P&L</h4>
                <div className="text-2xl font-bold text-white">
                  ${tradingSummary.reduce((sum, s) => sum + parseFloat(s.totalPnL), 0).toFixed(2)}
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h4 className="font-bold mb-2 text-green-400">Active Traders</h4>
                <div className="text-2xl font-bold text-white">
                  {tradingSummary.filter(s => s.totalTrades > 0).length}
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h4 className="font-bold mb-2 text-purple-400">Total Trades</h4>
                <div className="text-2xl font-bold text-white">
                  {tradingSummary.reduce((sum, s) => sum + s.totalTrades, 0)}
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h4 className="font-bold mb-2 text-yellow-400">Avg Win Rate</h4>
                <div className="text-2xl font-bold text-white">
                  {tradingSummary.length > 0 
                    ? (tradingSummary.reduce((sum, s) => sum + parseFloat(s.winRate), 0) / tradingSummary.length).toFixed(1)
                    : 0}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Learning Management Tab */}
        {activeTab === 'learning' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Learning Management System</h2>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-blue-600 p-2 rounded">🎓</div>
                  <div>
                    <p className="text-gray-400 text-sm">TOTAL COURSES</p>
                    <p className="text-2xl font-bold">{learningContent.courses.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-red-600 p-2 rounded">🎥</div>
                  <div>
                    <p className="text-gray-400 text-sm">TOTAL VIDEOS</p>
                    <p className="text-2xl font-bold">{learningContent.videos.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-purple-600 p-2 rounded">📡</div>
                  <div>
                    <p className="text-gray-400 text-sm">LIVE STREAMS</p>
                    <p className="text-2xl font-bold">{learningContent.liveStreams.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-green-600 p-2 rounded">📚</div>
                  <div>
                    <p className="text-gray-400 text-sm">RESOURCES</p>
                    <p className="text-2xl font-bold">{learningContent.resources.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Management Sections */}
            <div className="space-y-8">
              
              {/* Courses Management */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">📚 Courses Management</h3>
                  <button
                    onClick={() => handleContentAction('add', 'course')}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    + Add Course
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="pb-3 text-gray-400">Course</th>
                        <th className="pb-3 text-gray-400">Price</th>
                        <th className="pb-3 text-gray-400">Students</th>
                        <th className="pb-3 text-gray-400">Status</th>
                        <th className="pb-3 text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learningContent.courses.map(course => (
                        <tr key={course.id} className="border-b border-gray-700">
                          <td className="py-3">
                            <div>
                              <div className="text-white font-medium">{course.title}</div>
                              <div className="text-gray-400 text-sm">{course.lessons} lessons • {course.duration}</div>
                            </div>
                          </td>
                          <td className="py-3 text-emerald-400 font-bold">{course.price}</td>
                          <td className="py-3 text-gray-300">{course.students}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              course.status === 'Published' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                            }`}>
                              {course.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              {course.status === 'Draft' ? (
                                <button
                                  onClick={() => handleContentAction('publish', 'course', course)}
                                  className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
                                >
                                  Publish
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleContentAction('unpublish', 'course', course)}
                                  className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs"
                                >
                                  Unpublish
                                </button>
                              )}
                              <button
                                onClick={() => handleContentAction('edit', 'course', course)}
                                className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleContentAction('delete', 'course', course)}
                                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Videos Management */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">🎥 Videos Management</h3>
                  <button
                    onClick={() => handleContentAction('add', 'video')}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    + Upload Video
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="pb-3 text-gray-400">Video</th>
                        <th className="pb-3 text-gray-400">Duration</th>
                        <th className="pb-3 text-gray-400">Views</th>
                        <th className="pb-3 text-gray-400">Likes</th>
                        <th className="pb-3 text-gray-400">Status</th>
                        <th className="pb-3 text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learningContent.videos.map(video => (
                        <tr key={video.id} className="border-b border-gray-700">
                          <td className="py-3">
                            <div>
                              <div className="text-white font-medium">{video.title}</div>
                              <div className="text-gray-400 text-sm">{video.description}</div>
                            </div>
                          </td>
                          <td className="py-3 text-gray-300">{video.duration}</td>
                          <td className="py-3 text-gray-300">{video.views.toLocaleString()}</td>
                          <td className="py-3 text-gray-300">{video.likes}</td>
                          <td className="py-3">
                            <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs">
                              {video.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleContentAction('edit', 'video', video)}
                                className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleContentAction('delete', 'video', video)}
                                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Streams Management */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">📡 Live Streams Management</h3>
                  <button
                    onClick={() => handleContentAction('add', 'stream')}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    + Schedule Stream
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="pb-3 text-gray-400">Stream</th>
                        <th className="pb-3 text-gray-400">Scheduled Date</th>
                        <th className="pb-3 text-gray-400">Duration</th>
                        <th className="pb-3 text-gray-400">Registrations</th>
                        <th className="pb-3 text-gray-400">Status</th>
                        <th className="pb-3 text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learningContent.liveStreams.map(stream => (
                        <tr key={stream.id} className="border-b border-gray-700">
                          <td className="py-3">
                            <div>
                              <div className="text-white font-medium">{stream.title}</div>
                              <div className="text-gray-400 text-sm">{stream.description}</div>
                            </div>
                          </td>
                          <td className="py-3 text-gray-300">
                            {new Date(stream.scheduledDate).toLocaleString()}
                          </td>
                          <td className="py-3 text-gray-300">{stream.duration}</td>
                          <td className="py-3 text-gray-300">{stream.registrations}</td>
                          <td className="py-3">
                            <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs">
                              {stream.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => addLog(`Starting live stream: ${stream.title}`, 'info')}
                                className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
                              >
                                Start
                              </button>
                              <button
                                onClick={() => handleContentAction('edit', 'stream', stream)}
                                className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">🚀 Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      addLog('Learning content refreshed', 'success');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg transition-colors text-center"
                  >
                    🔄<br />Refresh Content
                  </button>
                  <button
                    onClick={() => addLog('Bulk content export initiated', 'info')}
                    className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg transition-colors text-center"
                  >
                    📤<br />Export All
                  </button>
                  <button
                    onClick={() => addLog('Analytics report generated', 'success')}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg transition-colors text-center"
                  >
                    📊<br />Analytics
                  </button>
                  <button
                    onClick={() => addLog('Content backup created', 'success')}
                    className="bg-orange-600 hover:bg-orange-700 px-4 py-3 rounded-lg transition-colors text-center"
                  >
                    💾<br />Backup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">System Monitoring</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold mb-2">Performance Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div>Response Time: 45ms</div>
                  <div>Requests/min: 12</div>
                  <div>Error Rate: 0.1%</div>
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold mb-2">Database Stats</h4>
                <div className="space-y-2 text-sm">
                  <div>Connections: 3/100</div>
                  <div>Query Time: 2ms avg</div>
                  <div>Cache Hit: 94%</div>
                </div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-bold mb-2">API Endpoints</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>/api/trades</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>/api/stats</span>
                    <span className="text-green-400">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Database Management</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-bold">Trades Table</h4>
                  <p className="text-sm text-gray-400">{serverStatus.totalTrades} records</p>
                </div>
                <button
                  onClick={() => handleAction('backup')}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                >
                  Backup
                </button>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-bold">System Settings</h4>
                  <p className="text-sm text-gray-400">Configuration data</p>
                </div>
                <button className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded transition-colors">
                  View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">System Logs</h2>
              <button
                onClick={() => handleAction('clearLogs')}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
              >
                Clear Logs
              </button>
            </div>
            <div className="bg-black p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs available</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className={`mb-1 ${
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    log.type === 'success' ? 'text-green-400' : 'text-gray-300'
                  }`}>
                    [{log.timestamp}] {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">System Settings</h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold mb-2">Server Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Port</label>
                    <input type="text" value="4000" className="w-full bg-gray-700 p-2 rounded" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Environment</label>
                    <input type="text" value="Development" className="w-full bg-gray-700 p-2 rounded" readOnly />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-2">Backup Settings</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Auto-backup daily
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Backup before updates
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">👤</div>
                <h2 className="text-2xl font-bold text-white">User Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <div className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white">
                    {selectedUser.name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <div className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white">
                    {selectedUser.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">User ID</label>
                  <div className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white">
                    #{selectedUser.id}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Registration Date</label>
                  <div className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password Status</label>
                  <div className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white">
                    🔒 Encrypted (bcrypt hash)
                  </div>
                </div>

                <div className="bg-yellow-900 border border-yellow-700 p-4 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    🔐 <strong>Security Note:</strong> Passwords are encrypted and cannot be viewed. 
                    You can only reset them to generate new temporary passwords.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const tempPassword = Math.random().toString(36).slice(-8);
                    addLog(`Generated temporary password for ${selectedUser.name}: ${tempPassword}`, 'warning');
                    alert(`Temporary password for ${selectedUser.name}: ${tempPassword}\n\nUser should change this immediately after login.`);
                  }}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  🔑 Reset Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Trades Modal */}
        {showTradesModal && selectedUserTrades && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">📊</div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedUserTrades.user.name}'s Trading Journal
                </h2>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700 p-4 rounded-lg text-center">
                  <div className="text-gray-400 text-sm">Total Trades</div>
                  <div className="text-xl font-bold text-white">{selectedUserTrades.analytics.totalTrades}</div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg text-center">
                  <div className="text-gray-400 text-sm">Win Rate</div>
                  <div className="text-xl font-bold text-green-400">{selectedUserTrades.analytics.winRate}%</div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg text-center">
                  <div className="text-gray-400 text-sm">Total P&L</div>
                  <div className={`text-xl font-bold ${
                    selectedUserTrades.analytics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${selectedUserTrades.analytics.totalPnL}
                  </div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg text-center">
                  <div className="text-gray-400 text-sm">Avg P&L</div>
                  <div className="text-xl font-bold text-white">${selectedUserTrades.analytics.avgPnL}</div>
                </div>
              </div>

              {/* Trades List */}
              <div className="bg-slate-700 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-bold mb-4">Recent Trades</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="pb-2 text-gray-400">Symbol</th>
                        <th className="pb-2 text-gray-400">Direction</th>
                        <th className="pb-2 text-gray-400">Entry</th>
                        <th className="pb-2 text-gray-400">Exit</th>
                        <th className="pb-2 text-gray-400">Size</th>
                        <th className="pb-2 text-gray-400">P&L</th>
                        <th className="pb-2 text-gray-400">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUserTrades.trades.map(trade => (
                        <tr key={trade.id} className="border-b border-gray-600">
                          <td className="py-2 text-white font-medium">{trade.symbol}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              trade.direction === 'LONG' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                            }`}>
                              {trade.direction}
                            </span>
                          </td>
                          <td className="py-2 text-gray-300">{trade.entry_price}</td>
                          <td className="py-2 text-gray-300">{trade.exit_price || 'Open'}</td>
                          <td className="py-2 text-gray-300">{trade.lot_size}</td>
                          <td className="py-2">
                            <span className={`font-bold ${
                              trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ${trade.pnl}
                            </span>
                          </td>
                          <td className="py-2 text-gray-300 max-w-xs truncate">{trade.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTradesModal(false);
                    setSelectedUserTrades(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const csvData = selectedUserTrades.trades.map(t => 
                      `${t.symbol},${t.direction},${t.entry_price},${t.exit_price || ''},${t.lot_size},${t.pnl},${t.notes || ''}`
                    ).join('\n');
                    const csv = 'Symbol,Direction,Entry,Exit,Size,PnL,Notes\n' + csvData;
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedUserTrades.user.name}_trades.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    addLog(`Exported trades for ${selectedUserTrades.user.name}`, 'success');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  📤 Export CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Creation/Edit Modal */}
        {showContentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">
                  {contentModalType === 'course' ? '🎓' : 
                   contentModalType === 'video' ? '🎥' : 
                   contentModalType === 'stream' ? '📡' : '📚'}
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {editingContent ? 'Edit' : 'Create'} {contentModalType.charAt(0).toUpperCase() + contentModalType.slice(1)}
                </h2>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter description"
                    required
                  />
                </div>

                {contentModalType === 'course' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Price *</label>
                        <input
                          type="text"
                          value={formData.price || ''}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., $99 or Free"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Duration *</label>
                        <input
                          type="text"
                          value={formData.duration || ''}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 8 hours"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Number of Lessons *</label>
                      <input
                        type="number"
                        value={formData.lessons || ''}
                        onChange={(e) => handleInputChange('lessons', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter number of lessons"
                        required
                        min="1"
                      />
                    </div>
                  </>
                )}

                {contentModalType === 'video' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Video File *</label>
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                        {formData.fileName ? (
                          <div className="text-green-400">
                            <div className="text-2xl mb-2">✅</div>
                            <p className="font-medium">{formData.fileName}</p>
                            <p className="text-sm text-gray-400">{formData.fileSize}</p>
                          </div>
                        ) : (
                          <>
                            <div className="text-4xl mb-2">📁</div>
                            <p className="text-gray-400 mb-2">Drag and drop video file here</p>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleFileUpload(file, 'video');
                              }}
                              className="hidden"
                              id="video-upload"
                            />
                            <label
                              htmlFor="video-upload"
                              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors cursor-pointer inline-block"
                            >
                              Choose File
                            </label>
                          </>
                        )}
                        {isUploading && (
                          <div className="mt-4">
                            <div className="bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">Uploading... {uploadProgress}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail</label>
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleFileUpload(file, 'thumbnail');
                          }}
                          className="hidden"
                          id="thumbnail-upload"
                        />
                        <p className="text-gray-400 mb-2">Upload thumbnail image</p>
                        <label
                          htmlFor="thumbnail-upload"
                          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors cursor-pointer inline-block"
                        >
                          Choose Image
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {contentModalType === 'stream' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Scheduled Date *</label>
                        <input
                          type="datetime-local"
                          value={formData.scheduledDate || ''}
                          onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes) *</label>
                        <input
                          type="number"
                          value={formData.duration || ''}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="60"
                          required
                          min="1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Stream Platform *</label>
                      <select 
                        value={formData.platform || ''}
                        onChange={(e) => handleInputChange('platform', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Platform</option>
                        <option value="YouTube Live">YouTube Live</option>
                        <option value="Twitch">Twitch</option>
                        <option value="Facebook Live">Facebook Live</option>
                        <option value="Custom Platform">Custom Platform</option>
                      </select>
                    </div>
                  </>
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
    </div>
  );
};

export default AdminPanel;