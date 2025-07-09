import React, { useContext, useState } from "react";
import GlobalContext from "../context/GlobalContext";
import { venueBookingsApi } from "../services/api";
import dayjs from "dayjs";

export default function VenueModal() {
  const { dispatchCalVenue, setShowVenueModal, selectedVenue, savedVenues } = useContext(GlobalContext);
  const [title, setTitle] = useState(selectedVenue.title || "");
  const [startTime, setStartTime] = useState(selectedVenue.startTime ? dayjs(selectedVenue.startTime).format("HH:mm") : "");
  const [endTime, setEndTime] = useState(selectedVenue.endTime ? dayjs(selectedVenue.endTime).format("HH:mm") : "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isTimeSlotAvailable = () => {
    const newStart = dayjs(`${selectedVenue.day}T${startTime}`);
    const newEnd = dayjs(`${selectedVenue.day}T${endTime}`);
    const overlapping = savedVenues.some(booking => {
      if (booking.venueId !== selectedVenue.venueId) return false;
      const existingStart = dayjs(booking.startTime || booking.StartTime);
      const existingEnd = dayjs(booking.endTime || booking.EndTime);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    if (!title.trim()) {
      setError("Please enter a booking title");
      setSubmitting(false);
      return;
    }
    if (!startTime || !endTime) {
      setError("Please select booking times");
      setSubmitting(false);
      return;
    }
    if (endTime <= startTime) {
      setError("End time must be after start time");
      setSubmitting(false);
      return;
    }
    if (!isTimeSlotAvailable()) {
      setError("This time slot is already booked for the selected venue.");
      setSubmitting(false);
      return;
    }
    setError("");

    const newBooking = {
      title: title,
      day: dayjs(selectedVenue.day).format("YYYY-MM-DD"),
      startTime: dayjs(`${selectedVenue.day}T${startTime}`).format("YYYY-MM-DDTHH:mm"),
      endTime: dayjs(`${selectedVenue.day}T${endTime}`).format("YYYY-MM-DDTHH:mm"),
      venueId: Number(selectedVenue.venueId), // <-- ENSURE THIS IS A NUMBER
    };

    try {
      console.log("Booking payload:", newBooking, typeof newBooking.venueId);
      const result = await venueBookingsApi.create(newBooking);
      console.log("Booking result:", result);
      const response = await venueBookingsApi.getAll();
      console.log("Fetched bookings after create:", response.data);
      dispatchCalVenue({ type: "set", payload: response.data });
      setShowVenueModal(false);
    } catch (error) {
      console.error("Error creating venue booking:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  console.log("selectedVenue:", selectedVenue);

  return (
    <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
      <form className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto" onSubmit={handleSubmit}>
        <header className="bg-gray-100 px-4 py-2 flex justify-between items-center rounded-t-lg">
          <span className="material-icons-outlined text-gray-400">drag_handle</span>
          <button type="button" onClick={() => setShowVenueModal(false)} aria-label="Close modal">
            <span className="material-icons-outlined text-gray-400">close</span>
          </button>
        </header>
        <div className="p-5 space-y-6">
          <h2 className="text-lg font-bold text-gray-700 mb-2">Book Venue</h2>
          <div className="space-y-3">
            <label htmlFor="venue-title" className="block text-sm font-medium text-gray-600">Booking Title</label>
            <input
              id="venue-title"
              type="text"
              name="title"
              placeholder="Add booking title"
              value={title}
              required
              className="pt-3 border-0 text-gray-600 text-lg font-semibold pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500 bg-gray-50 rounded"
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-gray-400">event</span>
            <span className="text-gray-700 text-base">{dayjs(selectedVenue.day).format("dddd, MMMM DD")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-gray-400">access_time</span>
            <label htmlFor="venue-start" className="text-sm text-gray-600 mr-1">Start</label>
            <input
              id="venue-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border-0 text-gray-600 pb-2 w-28 border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500 bg-gray-50 rounded"
            />
            <span className="text-gray-400">to</span>
            <label htmlFor="venue-end" className="text-sm text-gray-600 mr-1">End</label>
            <input
              id="venue-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border-0 text-gray-600 pb-2 w-28 border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500 bg-gray-50 rounded"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span className="material-icons-outlined text-base">error_outline</span>
              {error}
            </div>
          )}
        </div>
        <footer className="flex justify-end border-t p-4 bg-gray-50 rounded-b-lg mt-2">
          <button
            type="button"
            onClick={() => setShowVenueModal(false)}
            className="bg-gray-500 hover:bg-gray-600 px-6 py-2 rounded text-white mr-2 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded text-white transition-colors duration-150 ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </footer>
      </form>
    </div>
  );
}