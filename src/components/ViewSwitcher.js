import React, { useContext, useState } from "react";
import GlobalContext from "../context/GlobalContext";
import "./ViewSwitcherDrodown.css"; 

export default function ViewSwitcherDropdown() {
  const { viewMode, setViewMode } = useContext(GlobalContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleViewChange = (mode) => {
    setViewMode(mode);
    setIsOpen(false);
  };

  return (
    <div className=" relative inline-block text-left">
      <div>
        <button
          type="button"
          className="dropdown-button"
          onClick={toggleDropdown}
        >
          <span>{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View</span>
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              className={`block px-4 py-2 text-sm text-gray-700 w-full text-left ${viewMode === "month" ? "active" : ""}`}
              onClick={() => handleViewChange("month")}
            >
              Month View
            </button>
            <button
              className={`block px-4 py-2 text-sm text-gray-700 w-full text-left ${viewMode === "week" ? "active" : ""}`}
              onClick={() => handleViewChange("week")}
            >
              Week View
            </button>
            <button
              className={`block px-4 py-2 text-sm text-gray-700 w-full text-left ${viewMode === "day" ? "active" : ""}`}
              onClick={() => handleViewChange("day")}
            >
              Day View
            </button>
            <button
              className={`block px-4 py-2 text-sm text-gray-700 w-full text-left ${viewMode === "year" ? "active" : ""}`}
              onClick={() => handleViewChange("day")}
            >
              Year View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}