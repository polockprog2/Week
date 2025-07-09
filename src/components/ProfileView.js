import React, { useState, useContext } from 'react';
import ProfilePopup from './ProfilePopup';
import UserContext from '../context/UserContext';

export default function ProfileView() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, login, logout } = useContext(UserContext);

  const handleMouseEnter = () => setIsProfileOpen(true);
  const handleMouseLeave = () => setIsProfileOpen(false);

  // Simple auth form for demonstration
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    login({ id: 1, email });
    setShowAuth(false);
  };

  const handleSignOut = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="flex items-center space-x-2 cursor-pointer group">
        <img
          src={require('../assets/profile.jpg')}
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-blue-400 group-hover:shadow-lg transition"
        />
      </div>
      <ProfilePopup isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}>
        {!user ? (
          <div className="flex flex-col items-center">
            <span className="material-icons-outlined text-5xl text-blue-400 mb-2">account_circle</span>
            <div className="text-lg font-semibold mb-2">Welcome!</div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-full shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
              onClick={() => setShowAuth((v) => !v)}
            >
              Sign In / Register
            </button>
            {showAuth && (
              <form className="mt-2 w-full flex flex-col gap-3" onSubmit={handleSignIn}>
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
                {error && <div className="text-red-500 text-xs">{error}</div>}
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-full shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400">
                  Sign In / Register
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <img
              src={require('../assets/profile.jpg')}
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-blue-300 shadow mb-2"
            />
            <div className="text-lg font-semibold mb-1">{user.email.split('@')[0]}</div>
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