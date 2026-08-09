import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setVerificationStatus('error');
        setMessage('Verification token is missing');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post('/auth/verify-email', { token });
        
        if (response.data.success) {
          setVerificationStatus('success');
          setMessage('Email verified successfully! You can now login to your account.');
        } else {
          setVerificationStatus('error');
          setMessage(response.data.message || 'Email verification failed');
        }
      } catch (error) {
        setVerificationStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleRedirectToLogin = () => {
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-gilroy">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ebb665] mx-auto"></div>
              <h2 className="mt-4 text-xl font-medium text-gray-900">Verifying your email...</h2>
              <p className="mt-2 text-sm text-gray-600">Please wait while we verify your email address.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-gilroy">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link to="/" className="block">
            <img src="/Trybee-Logo.svg" alt="Trybee logo" className="h-16 w-auto" />
          </Link>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {verificationStatus === 'success' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Email Verified Successfully!</h3>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleRedirectToLogin}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ebb665] hover:bg-[#d2a45b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ebb665]"
                  >
                    Go to Login
                  </button>
                  <Link
                    to="/"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ebb665]"
                  >
                    Back to Home
                  </Link>
                </div>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Verification Failed</h3>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
                <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-700">
                    <strong>Need help?</strong> If your verification link expired, you can register again with the same email to get a new verification link.
                  </p>
                </div>
                <div className="mt-6 space-y-3">
                  <Link
                    to="/register"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ebb665] hover:bg-[#d2a45b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ebb665]"
                  >
                    Get New Verification Link
                  </Link>
                  <Link
                    to="/login"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ebb665]"
                  >
                    Try Login Instead
                  </Link>
                  <Link
                    to="/"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ebb665]"
                  >
                    Back to Home
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
