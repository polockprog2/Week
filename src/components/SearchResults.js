import React from "react";

export default function SearchResults({ results, onSelectUser, visible }) {
  if (!visible || !results || results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
      {results.map((user) => (
        <div
          key={user.userId}
          className="search-result-item flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
          onClick={() => onSelectUser(user)}
        >
          <div className="flex-shrink-0 mr-3">
            {user.profileImage ? (
              <img
                src={`/api/images/${user.profileImage}`}
                alt={user.email}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/40x40/6B7280/FFFFFF?text=" + user.email.charAt(0).toUpperCase();
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                {user.email.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user.email}
            </div>
            <div className="text-xs text-gray-500">
              User ID: {user.userId}
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <span className="material-icons-outlined text-gray-400 text-sm">
              person_add
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 