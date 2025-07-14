import React, { useState, useContext, useEffect } from 'react';
import ProfilePopup from './ProfilePopup';
import UserContext from '../context/UserContext';
import { usersApi } from '../services/api';

export default function ProfileView() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, login, logout } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch user profile if user is logged in (has token or session)
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await usersApi.getProfile();
        if (res.data) {
          login(res.data);
          if (res.data.profileImage) setProfileImage(res.data.profileImage);
        }
      } catch (err) {
        // Not logged in or error
      } finally {
        setLoading(false);
      }
    };
    if (!user) fetchProfile();
  }, [user, login]);

  const handleMouseEnter = () => setIsProfileOpen(true);
  const handleMouseLeave = () => setIsProfileOpen(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await usersApi.login({ email, password });
      // Map ASP.NET Core PascalCase response to camelCase
      const userData = {
        userId: res.data.userId,
        email: res.data.email,
        profileImage: res.data.profileImage
      };
      login(userData);
      if (userData.profileImage) setProfileImage(userData.profileImage);
      setShowAuth(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Please fill all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await usersApi.register({ email, password, name, profileImage });
      // Registration successful, do not auto-login
      setSuccessMessage('Registration successful, please sign in.');
      setIsRegister(false);
      setEmail('');
      setPassword('');
      setName('');
      setProfileImage(null);
      setShowAuth(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await usersApi.logout();
      logout();
      setIsProfileOpen(false);
    } catch (err) {
      // ignore
      logout();
      setIsProfileOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="flex items-center space-x-2 cursor-pointer group">
        <img
          src={profileImage || require('../assets/profile.jpg')}
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-blue-400 group-hover:shadow-lg transition"
        />
      </div>
      <ProfilePopup isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-4">Loading...</div>
        ) : !user ? (
          <div className="flex flex-col items-center">
            <span className="material-icons-outlined text-5xl text-blue-400 mb-2">account_circle</span>
            <div className="text-lg font-semibold mb-2">Welcome!</div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-full shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
              onClick={() => setShowAuth((v) => !v)}
            >
              Sign In / Register
            </button>
            <div className="w-full flex flex-col items-center gap-2 mt-2">
              {error && <div className="text-red-500 text-xs">{error}</div>}
              {successMessage && <div className="text-green-600 text-xs">{successMessage}</div>}
            </div>
            {showAuth && (
              <form className="mt-2 w-full flex flex-col gap-3" onSubmit={isRegister ? handleRegister : handleSignIn}>
                {isRegister && (
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
                <label className="text-sm font-medium text-gray-700">Upload Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {profileImage && (
                  <img src={profileImage} alt="Preview" className="w-16 h-16 rounded-full mx-auto mt-2 border-2 border-blue-300" />
                )}
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-full shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400">
                  {isRegister ? 'Register' : 'Sign In'}
                </button>
                <button
                  type="button"
                  className="text-blue-500 underline text-xs mt-1"
                  onClick={() => setIsRegister((v) => !v)}
                >
                  {isRegister ? 'Already have an account? Sign In' : 'New user? Register'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <img
              src={profileImage || require('../assets/profile.jpg')}
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-blue-300 shadow mb-2"
            />
            <div className="text-lg font-semibold mb-1">{user.email?.split('@')[0]}</div>
            <div className="text-sm text-gray-500 mb-3">{user.email}</div>
            <div className="flex gap-2 w-full">
              <button
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-full shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled
              >
                Edit Profile
              </button>
              <button
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-full shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </ProfilePopup>
    </div>
  );
}