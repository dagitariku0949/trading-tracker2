import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resetInfo, setResetInfo] = useState(null);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'If an account with that email exists, a password reset link has been sent.' 
        });
        
        // For development - show reset info
        if (result.resetToken) {
          setResetInfo({
            token: result.resetToken,
            url: result.resetUrl
          });
        }
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Password reset request failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
          <p className="text-gray-400">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
                required
              />
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

            {/* Development Reset Info */}
            {resetInfo && (
              <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
                <h3 className="text-blue-300 font-bold mb-2">🔧 Development Mode</h3>
                <div className="text-blue-200 text-sm space-y-2">
                  <p><strong>Reset Token:</strong> {resetInfo.token}</p>
                  <p><strong>Reset URL:</strong></p>
                  <a 
                    href={resetInfo.url} 
                    className="text-blue-400 hover:text-blue-300 underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resetInfo.url}
                  </a>
                  <p className="text-xs text-blue-300 mt-2">
                    In production, this would be sent via email
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

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

        {/* Instructions */}
        <div className="mt-6 bg-slate-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">📧 What happens next?</h3>
          <div className="text-gray-300 text-sm space-y-1">
            <p>• Check your email inbox for a reset link</p>
            <p>• Click the link to create a new password</p>
            <p>• The link expires in 1 hour for security</p>
            <p>• If you don't see the email, check your spam folder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;