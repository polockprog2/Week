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
    <aside className="border-rounded p-6 w-80 shadow-md bg-white">
      <CreateEventButton />
      <SmallCalendar />
      <input
        type="text"
        className="border p-1 w-3/4 mb-4 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <Labels />
    </aside>
  );
}