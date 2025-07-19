import React, { useState, useEffect, useRef, useContext } from "react";
import CreateEventButton from "./CreateEventButton";
import SmallCalendar from "./SmallCalendar";
import Labels from "./Labels";
import SearchResults from "./SearchResults";
import { usersApi } from "../services/api";
import GlobalContext from "../context/GlobalContext";

export default function Sidebar() {
  const { savedTasks, viewMode, setViewMode } = useContext(GlobalContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Handle search input changes with debouncing
  function handleSearchChange(e) {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(query.length > 0);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search requests
    if (query.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setSearchResults([]);
    }
  }

  // Perform the actual search
  async function performSearch(query) {
    if (query.length < 2) return;
    
    setIsLoading(true);
    try {
      const response = await usersApi.search(query);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle user selection from search results
  function handleSelectUser(user) {
    console.log("Selected user:", user);
    // You can implement what happens when a user is selected
    // For example, add them to an event, show their profile, etc.
    setSearchQuery(user.email);
    setShowResults(false);
  }

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <aside className="border-rounded p-6 w-80 shadow-md bg-green-50 border-b min-h-screen flex flex-col gap-6">
      
      <CreateEventButton />
      
      {/* Quick Navigation */}
      <div className="space-y-2">
        <button
          onClick={() => setViewMode("tasks")}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
            viewMode === "tasks" 
              ? "bg-green-100 text-green-700 border border-green-200" 
              : "bg-white hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="material-icons-outlined text-green-500">task_alt</span>
            <span className="font-medium">Task Management</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{savedTasks.length}</span>
            <span className="material-icons-outlined text-gray-400 text-sm">arrow_forward_ios</span>
          </div>
        </button>
      </div>
      
      <div className="mt-2 mb-4">
        <SmallCalendar />
      </div>
      <div className="relative mb-4" ref={searchContainerRef}>
        <span className="material-icons-outlined absolute left-2 top-2 text-gray-400">search</span>
        <input
          type="text"
          className="border pl-9 pr-8 py-2 w-full bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-green-300 transition-shadow shadow-sm"
          placeholder="Search users by email..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => searchQuery.length > 0 && setShowResults(true)}
        />
        {isLoading && (
          <span className="material-icons-outlined absolute right-2 top-2 text-gray-400 search-loading">
            refresh
          </span>
        )}
        <SearchResults
          results={searchResults}
          onSelectUser={handleSelectUser}
          visible={showResults}
        />
      </div>
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-icons-outlined text-green-400">label</span>
          <span className="font-semibold text-green-700">Labels</span>
        </div>
        <Labels />
      </div>
    </aside>
  );
}