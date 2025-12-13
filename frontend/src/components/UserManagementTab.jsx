import React, { useState, useEffect } from 'react';

const UserManagementTab = ({ getUsers, updateUser, deleteUser, resetUserPassword, addLog, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
    isVerified: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await getUsers();
      if (result.success) {
        setUsers(result.data);
        addLog(`✅ Loaded ${result.data.length} users`, 'success');
      } else {
        addLog(`❌ Failed to load users: ${result.message}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error loading users: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });
    setShowUserModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      const result = await updateUser(selectedUser.id, editForm);
      if (result.success) {
        addLog(`✅ Updated user: ${editForm.name}`, 'success');
        setShowUserModal(false);
        loadUsers();
      } else {
        addLog(`❌ Failed to update user: ${result.message}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error updating user: ${error.message}`, 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser.id) {
      addLog(`❌ Cannot delete your own account`, 'error');
      return;
    }

    if (confirm(`Delete user "${user.name}"? This action cannot be undone.`)) {
      try {
        const result = await deleteUser(user.id);
        if (result.success) {
          addLog(`✅ Deleted user: ${user.name}`, 'success');
          loadUsers();
        } else {
          addLog(`❌ Failed to delete user: ${result.message}`, 'error');
        }
      } catch (error) {
        addLog(`❌ Error deleting user: ${error.message}`, 'error');
      }
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      addLog(`❌ Password must be at least 6 characters long`, 'error');
      return;
    }

    try {
      const result = await resetUserPassword(selectedUser.id, newPassword);
      if (result.success) {
        addLog(`✅ Password reset for: ${selectedUser.name}`, 'success');
        setShowPasswordModal(false);
        setNewPassword('');
        setSelectedUser(null);
      } else {
        addLog(`❌ Failed to reset password: ${result.message}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error resetting password: ${error.message}`, 'error');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-900 text-red-300',
      user: 'bg-blue-900 text-blue-300'
    };
    return colors[role] || 'bg-gray-900 text-gray-300';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      
      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-600 p-2 rounded">👥</div>
            <div>
              <p className="text-gray-400 text-sm">TOTAL USERS</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-600 p-2 rounded">👑</div>
            <div>
              <p className="text-gray-400 text-sm">ADMINS</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-600 p-2 rounded">✅</div>
            <div>
              <p className="text-gray-400 text-sm">VERIFIED</p>
              <p className="text-2xl font-bold">{users.filter(u => u.isVerified).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-purple-600 p-2 rounded">📅</div>
            <div>
              <p className="text-gray-400 text-sm">NEW TODAY</p>
              <p className="text-2xl font-bold">
                {users.filter(u => 
                  new Date(u.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Registered Users ({users.length})</h3>
          <button
            onClick={loadUsers}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
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
                  <th className="pb-3 text-gray-400">Role</th>
                  <th className="pb-3 text-gray-400">Status</th>
                  <th className="pb-3 text-gray-400">Registered</th>
                  <th className="pb-3 text-gray-400">Last Login</th>
                  <th className="pb-3 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-700">
                    <td className="py-3 text-gray-300">#{user.id}</td>
                    <td className="py-3 text-white font-medium">
                      {user.name}
                      {user.id === currentUser.id && (
                        <span className="ml-2 text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-gray-300">{user.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${getRoleBadge(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.isVerified 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-gray-300">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-colors"
                          title="Edit User"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPasswordModal(true);
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs transition-colors"
                          title="Reset Password"
                        >
                          🔑
                        </button>
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs transition-colors"
                            title="Delete User"
                          >
                            🗑️
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

      {/* Edit User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✏️</div>
              <h2 className="text-2xl font-bold text-white">Edit User</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={editForm.isVerified}
                  onChange={(e) => setEditForm({...editForm, isVerified: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isVerified" className="text-sm text-gray-300">
                  Verified Account
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🔑</div>
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
              <p className="text-gray-400">for {selectedUser.name}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div className="bg-yellow-900 border border-yellow-700 p-4 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  ⚠️ This will immediately change the user's password. 
                  Make sure to communicate the new password securely.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setSelectedUser(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTab;