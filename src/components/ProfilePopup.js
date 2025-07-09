import React from 'react';

export default function ProfilePopup({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 max-w-xs bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-200 animate-fadeIn">
      <div className="p-5 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none"
          aria-label="Close profile popup"
          onClick={onClose}
        >
          <span className="material-icons-outlined">close</span>
        </button>
        {children}
      </div>
    </div>
  );
}