import React, { useContext, useState } from "react";
import GlobalContext from "../context/GlobalContext";
import "./ViewSwitcherDrodown.css"; 

export default function ViewSwitcherDropdown() {
  const { viewMode, setViewMode } = useContext(GlobalContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleViewChange = (mode) => {
    setViewMode(mode.toLowerCase());
    setIsOpen(false);
  };

  const viewOptions = [
    { label: "Month", value: "month" },
    { label: "Week", value: "week" },
    { label: "Day", value: "day" },
    { label: "Venues", value: "venues" },
    {label : "Agenda", value: "agenda"},
    { label: "Year", value: "year" },
  ];

  return (
    <div className="relative outlined">
      <button
        type="button"
        className="bg-white-500 text-white-200 py-3 px-6 mr-5 hover:bg-gray-200 boder-gray-200 rounded-full shadow-md"
        onClick={toggleDropdown}
      >
        <span className="text-gray-700">{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View</span>
        <span className="material-icons-outlined text-gray-600">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-gray-100 font-semibold rounded-md shadow-lg z-50">
          {viewOptions.map((option) => (
            <button
              key={option.value}
              className={`
                w-full px-4 py-2 text-sm text-left hover:bg-gray-100
                ${viewMode === option.value ? 'bg-gray-50 text-gray-600' : 'text-gray-700'}
              `}
              onClick={() => handleViewChange(option.value)}
            >
              {option.label} View
            </button>
          ))}
        </div>
      )}
    </div>
  );
}