import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [token, setToken] = useState('');

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setMessage({ 
        type: 'error', 
        text: 'Invalid reset link. Please request a new password reset.' 
      });
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPassword(token, formData.newPassword);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Password reset successful! Redirecting to login...' 
        });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Password reset failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔑</div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-400">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          {token ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Enter your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Confirm Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your new password"
                  required
                />
              </div>

              {/* Password Requirements */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Password Requirements:</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li className={`flex items-center ${formData.newPassword.length >= 6 ? 'text-green-400' : ''}`}>
                    {formData.newPassword.length >= 6 ? '✅' : '⭕'} At least 6 characters
                  </li>
                  <li className={`flex items-center ${formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'text-green-400' : ''}`}>
                    {formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? '✅' : '⭕'} Passwords match
                  </li>
                </ul>
              </div>

              {/* Message */}
              {message.text && (
                <div className={`p-4 rounded-lg ${
                  message.type === 'error'
                    ? 'bg-red-900 border border-red-700 text-red-300'
                    : 'bg-green-900 border border-green-700 text-green-300'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || formData.newPassword.length < 6 || formData.newPassword !== formData.confirmPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="text-red-400 mb-4">
                {message.text || 'Invalid reset link'}
              </div>
              <Link
                to="/forgot-password"
                className="text-blue-400 hover:text-blue-300"
              >
                Request a new password reset
              </Link>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-slate-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">🔒 Security Notice</h3>
          <div className="text-gray-300 text-sm space-y-1">
            <p>• Choose a strong, unique password</p>
            <p>• Don't reuse passwords from other accounts</p>
            <p>• This reset link expires in 1 hour</p>
            <p>• You'll be automatically signed in after reset</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;