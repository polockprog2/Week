import React, { useContext, useState, useRef, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";
import "./ViewSwitcherDrodown.css";

const viewOptions = [
  { label: "Month", value: "month", icon: "calendar_month" },
  { label: "Week", value: "week", icon: "view_week" },
  { label: "Day", value: "day", icon: "calendar_today" },
  { label: "Venues", value: "venues", icon: "location_on" },
  { label: "Agenda", value: "agenda", icon: "list_alt" },
  { label: "Year", value: "year", icon: "event" },
];

export default function ViewSwitcherDropdown() {
  const { viewMode, setViewMode } = useContext(GlobalContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") setIsOpen(false);
  };

  const toggleDropdown = () => setIsOpen((open) => !open);

  const handleViewChange = (mode) => {
    setViewMode(mode.toLowerCase());
    setIsOpen(false);
  };

  return (
    <div className="relative outlined" ref={dropdownRef}>
      <button
        type="button"
        className="bg-white py-2 px-5 mr-5 flex items-center gap-2 border border-gray-200 rounded-full shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Switch calendar view"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
      >
        <span className="material-icons-outlined text-blue-500">
          {viewOptions.find((o) => o.value === viewMode)?.icon || "calendar_view_month"}
        </span>
        <span className="text-gray-800 font-medium">
          {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
        </span>
        <span className="material-icons-outlined text-gray-600 ml-1">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200 animate-fadeIn"
          role="listbox"
          tabIndex={-1}
        >
          {viewOptions.map((option) => (
            <button
              key={option.value}
              className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left transition
                ${viewMode === option.value
                  ? "bg-blue-50 border-l-4 border-blue-500 text-blue-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"}
              `}
              role="option"
              aria-selected={viewMode === option.value}
              tabIndex={0}
              onClick={() => handleViewChange(option.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleViewChange(option.value);
              }}
            >
              <span className={`material-icons-outlined ${viewMode === option.value ? "text-blue-500" : "text-gray-500"}`}>{option.icon}</span>
              <span>{option.label} View</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}