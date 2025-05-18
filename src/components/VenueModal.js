import React, { useCallback, useContext, useState } from "react";
import GlobalContext from "../context/GlobalContext";
import { venuesApi } from "../services/api";
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

  const handleSubmit = async (e) => {
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

    try {
      const response = await venuesApi.createBooking(selectedVenue.venueId, newBooking);
      dispatchCalVenue({ type: "push", payload: response.data });
      setShowVenueModal(false);
    } catch (error) {
      console.error("Error creating venue booking:", error);
      alert("Failed to create booking. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (selectedVenue.id) {
      try {
        await venuesApi.deleteBooking(selectedVenue.venueId, selectedVenue.id);
        dispatchCalVenue({ type: "delete", payload: selectedVenue });
        setShowVenueModal(false);
      } catch (error) {
        console.error("Error deleting venue booking:", error);
        alert("Failed to delete booking. Please try again.");
      }
    }
  };

  return (
    <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center">
      <form className="bg-white rounded-lg shadow-2xl w-1/4">
        <header className="bg-gray-100 px-4 py-2 flex justify-between items-center">
          <span className="material-icons-outlined text-gray-400">
            drag_handle
          </span>
          <button onClick={() => setShowVenueModal(false)}>
            <span className="material-icons-outlined text-gray-400">close</span>
          </button>
        </header>
        <div className="p-3">
          <div className="grid grid-cols-1/5 items-end gap-y-7">
            <div></div>
            <input
              type="text"
              name="title"
              placeholder="Add booking title"
              value={title}
              required
              className="pt-3 border-0 text-gray-600 text-xl font-semibold pb-2 w-80 border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setTitle(e.target.value)}
            />
            <span className="material-icons-outlined text-gray-400">
              schedule
            </span>
            <p>{dayjs(selectedVenue.day).format("dddd, MMMM DD")}</p>
            <span className="material-icons-outlined text-gray-400">
              access_time
            </span>
            <div className="flex gap-x-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="pt-3 border-0 text-gray-600 pb-2 w-40 border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              />
              <span className="text-gray-400">to</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="pt-3 border-0 text-gray-600 pb-2 w-40 border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        <footer className="flex justify-end border-t p-3 mt-5">
          {selectedVenue.id && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded text-white mr-2"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowVenueModal(false)}
            className="bg-gray-500 hover:bg-gray-600 px-6 py-2 rounded text-white mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded text-white"
          >
            Save
          </button>
        </footer>
      </form>
    </div>
  );
}