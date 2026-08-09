import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        setIsSuccess(true);
        setMessage('Password reset link has been sent to your email address. Please check your inbox.');
      } else {
        setMessage(response.data.message || 'Failed to send reset email');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-gilroy">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo (oversized, overlapping) */}
        <div className="relative h-[90px] overflow-visible">
          <Link to="/" className="block relative mx-auto w-44 h-full">
            <img
              src="/Trybee-Logo.svg"
              alt="Trybee logo"
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-[180px] md:h-[220px] w-auto object-contain select-none pointer-events-none"
            />
          </Link>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Forgot Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!isSuccess ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#ebb665] focus:border-[#ebb665] sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Error/Success Message */}
              {message && (
                <div className={`rounded-md p-4 ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className={`text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                    {message}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#ebb665] hover:bg-[#d2a45b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ebb665] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>

              {/* Links */}
              <div className="text-center space-y-2">
                <Link
                  to="/login"
                  className="text-sm text-[#b17e1a] hover:text-[#9a6c16]"
                >
                  Back to Login
                </Link>
                <div>
                  <span className="text-sm text-gray-600">Don't have an account? </span>
                  <Link
                    to="/register"
                    className="text-sm text-[#b17e1a] hover:text-[#9a6c16] font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Check your email</h3>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              <div className="mt-6 space-y-3">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ebb665] hover:bg-[#d2a45b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ebb665]"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
