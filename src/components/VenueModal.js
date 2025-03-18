import React, { useContext, useState } from "react";
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-1/3">
        <div className="p-4">
          <button onClick={() => setShowVenueModal(false)} className="absolute top-0 right-0 p-2">
            <span className="material-icons-outlined">close</span>
          </button>
          <h2 className="text-xl font-semibold mb-4">Book Venue</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded px-2 py-1"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border rounded px-2 py-1"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded px-2 py-1"
                required
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Book
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}