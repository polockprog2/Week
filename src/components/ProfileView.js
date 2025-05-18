import React, { useState } from 'react';
import ProfilePopup from './ProfilePopup';

export default function ProfileView() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsProfileOpen(true);
  };

  const handleMouseLeave = () => {
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
      <ProfilePopup isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}