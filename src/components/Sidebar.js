import React, { useState } from "react";
import CreateEventButton from "./CreateEventButton";
import SmallCalendar from "./SmallCalendar";
import Labels from "./Labels";

export default function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchChange(e) {
    setSearchQuery(e.target.value);
    //will implement search functionality here
  }

  return (
    <aside className="border-rounded p-6 w-80 shadow-md bg-green-50 border-b min-h-screen flex flex-col gap-6">
      
      <CreateEventButton />
      <div className="mt-2 mb-4">
        <SmallCalendar />
      </div>
      <div className="relative mb-4">
        <span className="material-icons-outlined absolute left-2 top-2 text-gray-400">search</span>
        <input
          type="text"
          className="border pl-9 pr-2 py-2 w-full bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-green-300 transition-shadow shadow-sm"
          placeholder="Search events, tasks..."
          value={searchQuery}
          onChange={handleSearchChange}
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