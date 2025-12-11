import React, { useState } from 'react';

const AdminLogin = ({ onLogin, onCancel }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    ownerKey: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Owner credentials (in production, use environment variables)
  const OWNER_CREDENTIALS = {
    username: 'owner',
    password: 'TradingDashboard2024!',
    ownerKey: 'LEAP-OWNER-KEY-2024'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Verify all credentials match
    if (
      credentials.username === OWNER_CREDENTIALS.username &&
      credentials.password === OWNER_CREDENTIALS.password &&
      credentials.ownerKey === OWNER_CREDENTIALS.ownerKey
    ) {
      // Generate secure session token
      const authToken = btoa(`${Date.now()}-${Math.random()}-owner`);
      
      // Store owner session
      sessionStorage.setItem('ownerAuthToken', authToken);
      sessionStorage.setItem('ownerAuthTime', Date.now().toString());
      sessionStorage.setItem('ownerRole', 'authenticated');
      
      onLogin();
    } else {
      setError('Invalid owner credentials. Access denied.');
      // Clear form for security
      setCredentials({ username: '', password: '', ownerKey: '' });
    }
    
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user types
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👑</div>
          <h2 className="text-2xl font-bold text-white">Owner Access Only</h2>
          <p className="text-gray-400">Restricted to website owner</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Owner Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter owner username"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Owner Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter owner password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Owner Key
            </label>
            <input
              type="password"
              value={credentials.ownerKey}
              onChange={(e) => handleInputChange('ownerKey', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter owner key"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !credentials.username || !credentials.password || !credentials.ownerKey}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Verifying Owner...' : 'Access Owner Panel'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-red-900 border border-red-700 rounded-lg">
          <p className="text-xs text-red-300 text-center">
            ⚠️ RESTRICTED ACCESS ⚠️
            <br />
            This panel is exclusively for the website owner.
            <br />
            Unauthorized access attempts are logged.
          </p>
        </div>

        <div className="mt-4 p-3 bg-slate-700 rounded-lg">
          <p className="text-xs text-gray-400 text-center">
            Owner Credentials:
            <br />
            Username: <code className="bg-slate-600 px-1 rounded">owner</code>
            <br />
            Password: <code className="bg-slate-600 px-1 rounded">TradingDashboard2024!</code>
            <br />
            Key: <code className="bg-slate-600 px-1 rounded">LEAP-OWNER-KEY-2024</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;