import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectAuthLoading, selectAuthError, getCurrentUser } from '../store/authSlice';
import axios from '../utils/axios';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [avatars, setAvatars] = useState([]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(getCurrentUser());
    } else {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || ''
      });
      setShowEmailVerification(!user.isVerified);
    }
  }, [user, dispatch]);

  // Fetch available avatars once
  useEffect(() => {
    const loadAvatars = async () => {
      try {
        const res = await axios.get('/upload/avatars');
        const list = res.data?.data?.avatars || res.data?.avatars || [];
        setAvatars(list);
      } catch (e) {
        console.error('Failed to load avatars', e);
      }
    };
    loadAvatars();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateMessage('');

    try {
      const response = await axios.put('/users/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender
      });

      if (response.data.success) {
        setUpdateMessage('Profile updated successfully!');
        setIsEditing(false);
        // Refresh user data
        dispatch(getCurrentUser());
      }
    } catch (error) {
      setUpdateMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setUpdateLoading(true);
      const response = await axios.post('/auth/resend-verification');
      if (response.data.success) {
        setUpdateMessage('Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      setUpdateMessage(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAvatarUpdate = async (avatarId) => {
    try {
      setUpdateLoading(true);
      setUpdateMessage('');
      const res = await axios.put('/upload/user/avatar', { avatarId });
      if (res.data?.success) {
        setUpdateMessage('Avatar updated successfully!');
        setShowAvatarPicker(false);
        // Refresh user data to get avatarUrl
        dispatch(getCurrentUser());
      } else {
        setUpdateMessage(res.data?.message || 'Failed to update avatar');
      }
    } catch (e) {
      setUpdateMessage(e.response?.data?.message || 'Failed to update avatar');
    } finally {
      setUpdateLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      gender: user.gender || ''
    });
    setUpdateMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ebb665]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">Error loading profile: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        {/* Email Verification Alert */}
        {showEmailVerification && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Email not verified</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Please verify your email address to secure your account.
                </p>
              </div>
              <button
                onClick={handleVerifyEmail}
                disabled={updateLoading}
                className="ml-4 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 disabled:opacity-50"
              >
                {updateLoading ? 'Sending...' : 'Resend Verification'}
              </button>
            </div>
          </div>
        )}

        {/* Success/Error Message */}
        {updateMessage && (
          <div className={`mb-6 p-4 rounded-md ${updateMessage.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {updateMessage}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#ebb665] text-white px-4 py-2 rounded-md text-sm hover:bg-[#d2a45b]"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={updateLoading}
                    className="bg-[#ebb665] text-white px-4 py-2 rounded-md text-sm hover:bg-[#d2a45b] disabled:opacity-50"
                  >
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-600">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="ml-4">
                    <div className="text-sm text-gray-500">Profile Avatar</div>
                    <div className="text-sm text-gray-900">{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(true)}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Change Avatar
                </button>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ebb665] focus:border-[#ebb665] sm:text-sm ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : ''
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ebb665] focus:border-[#ebb665] sm:text-sm ${
                        !isEditing ? 'bg-gray-50 text-gray-500' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                  {user?.isVerified && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  )}
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    disabled={true}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ebb665] focus:border-[#ebb665] sm:text-sm ${
                      !isEditing ? 'bg-gray-50 text-gray-500' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ebb665] focus:border-[#ebb665] sm:text-sm ${
                      !isEditing ? 'bg-gray-50 text-gray-500' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <div className="mt-1">
                  <select
                    name="gender"
                    id="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ebb665] focus:border-[#ebb665] sm:text-sm ${
                      !isEditing ? 'bg-gray-50 text-gray-500' : ''
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-medium">Choose an Avatar</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowAvatarPicker(false)}>✕</button>
              </div>
              <div className="p-5">
                {avatars.length === 0 ? (
                  <div className="text-sm text-gray-500">No avatars available.</div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {avatars.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleAvatarUpdate(a.id)}
                        disabled={updateLoading}
                        className={`rounded-lg p-1 border hover:shadow ${user?.avatarUrl === a.url ? 'border-[#ebb665]' : 'border-gray-200'}`}
                        title={a.name}
                      >
                        <img src={a.url} alt={a.name} className="w-20 h-20 object-cover rounded-md" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t text-right">
                <button className="px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200" onClick={() => setShowAvatarPicker(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Information */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.isAdmin ? 'Administrator' : 'Customer'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
