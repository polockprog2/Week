import React from 'react';

export default function ProfilePopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-84 bg-blue-50 rounded-lg shadow-lg overflow-hidden z-50">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <div className="flex items-center space-x-4">
          <img
            src="E:\Week\src\assets\OIP.jpg" 
            alt="Profile"
            className="w-20 h-20 rounded-full"
          />
          <div>
            <div className="text-lg font-semibold">Polock</div>
            <div className="text-sm text-gray-500">samirislampolock18@gmail.com</div>
          </div>
        </div>
        <div className="mt-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}