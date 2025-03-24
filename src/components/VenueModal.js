import React, { useCallback, useContext, useState } from "react";
import GlobalContext from "../context/GlobalContext";
import dayjs from "dayjs";

export default function VenueModal() {
  const { dispatchCalVenue, setShowVenueModal, selectedVenue, savedVenues } = useContext(GlobalContext);
  const [title, setTitle] = useState(selectedVenue.title);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const isTimeSlotAvailable = () => {
    const newStart = dayjs(startTime);
    const newEnd = dayjs(endTime);
    const overlapping = savedVenues.some(booking => {
      if (booking.venueId !== selectedVenue.venueId) return false;
      const existingStart = dayjs(booking.startTime);
      const existingEnd = dayjs(booking.endTime);
      return (
        (newStart.isAfter(existingStart) && newStart.isBefore(existingEnd)) ||
        (newEnd.isAfter(existingStart) && newEnd.isBefore(existingEnd)) ||
        (newStart.isBefore(existingStart) && newEnd.isAfter(existingEnd))
      );
    });


    if (overlapping) {
      alert("This time slot is already booked for the selected venue.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a booking title");
      return;
    }

    if (!startTime || !endTime) {
      alert("Please select booking times");
      return;
    }

    if (!isTimeSlotAvailable()) {
      return;
    }

    const newBooking = {
      id: Date.now(),
      title,
      startTime,
      endTime,
      venueId: selectedVenue.venueId,
      venueName: selectedVenue.venueName,
      day: selectedVenue.day,
    };

    dispatchCalVenue({ type: "push", payload: newBooking });
    setShowVenueModal(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-xl overflow-hidden w-1/4 min-w-[300px] max-w-[500px]">
      <div className="p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Book Venue</h2>
          <button
            onClick={() => setShowVenueModal(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <span className="material-icons-outlined text-2xl inset bg-blue-100">close</span>
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Title Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border bg-blue-50 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter event title"
              required
            />
          </div>
  
          {/* Start Time Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-blue-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
  
          {/* End Time Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border bg-blue-50 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
  
          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowVenueModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              Book
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}