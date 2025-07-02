import React, { useState, useContext } from 'react';
import ProfilePopup from './ProfilePopup';
import UserContext from '../context/UserContext'; // <-- import your UserContext

export default function ProfileView() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, login, logout } = useContext(UserContext);

  const handleMouseEnter = () => {
    setIsProfileOpen(true);
  };

  const handleMouseLeave = () => {
    setIsProfileOpen(false);
  };

  // Simple auth form for demonstration
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e) => {
    e.preventDefault();
    // Replace with your real authentication logic/API call
    login({ id: 1, email }); // Example: set user context
    setShowAuth(false);
  };

  const handleSignOut = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="flex items-center space-x-2 cursor-pointer ">
        <img
          src={require('../assets/profile.jpg')}  
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
        
      </div>
      <ProfilePopup isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}>
        {!user ? (
          <div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setShowAuth(true)}
            >
              Sign In / Register
            </button>
            {showAuth && (
              <form className="mt-4 flex flex-col gap-2" onSubmit={handleSignIn}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="border px-2 py-1 rounded"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="border px-2 py-1 rounded"
                  required
                />
                <button type="submit" className="bg-green-500 text-white px-4 py-1 rounded">
                  Sign In / Register
                </button>
              </form>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-2">Signed in as <b>{user.email}</b></div>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        )}
      </ProfilePopup>
    </div>
  );
}