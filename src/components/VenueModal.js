import React, { useContext, useState } from "react";
import GlobalContext from "../context/GlobalContext";
import dayjs from "dayjs";

const venues = [
  { id: 1, name: 'Conference Room A', capacity: 20, floor: '1st Floor' },
  { id: 2, name: 'Meeting Room 1', capacity: 10, floor: '2nd Floor' },
  { id: 3, name: 'Board Room', capacity: 15, floor: '3rd Floor' },
  { id: 4, name: 'Training Room', capacity: 30, floor: '2nd Floor' },
  { id: 5, name: 'Auditorium', capacity: 100, floor: 'Ground Floor' }
];

export default function VenueModal() {
  const {
    setShowVenueModal,
    daySelected,
    dispatchVenue,
    selectedVenue,
    savedVenues,
  } = useContext(GlobalContext);

  const [title, setTitle] = useState(selectedVenue ? selectedVenue.title : "");
  const [startTime, setStartTime] = useState(selectedVenue ? selectedVenue.startTime : "");
  const [endTime, setEndTime] = useState(selectedVenue ? selectedVenue.endTime : "");
  const [description, setDescription] = useState(selectedVenue ? selectedVenue.description : "");
  const [attendees, setAttendees] = useState(selectedVenue ? selectedVenue.attendees : "");
  const [selectedVenueId, setSelectedVenueId] = useState(selectedVenue ? selectedVenue.venueId : "");

  // Check for overlapping bookings
  const isTimeSlotAvailable = () => {
    const newStart = dayjs(`${daySelected.format('YYYY-MM-DD')} ${startTime}`);
    const newEnd = dayjs(`${daySelected.format('YYYY-MM-DD')} ${endTime}`);

    if (newStart.isAfter(newEnd)) {
      alert("End time must be after start time.");
      return false;
    }

    const overlapping = savedVenues.some(booking => {
      if (booking.venueId !== selectedVenueId) return false;
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

  function handleSubmit(e) {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Please enter a booking title");
      return;
    }

    if (!startTime || !endTime) {
      alert("Please select booking times");
      return;
    }

    if (!selectedVenueId) {
      alert("Please select a venue");
      return;
    }

    if (!isTimeSlotAvailable()) return;

    const venue = venues.find(v => v.id === parseInt(selectedVenueId));
    if (attendees > venue.capacity) {
      alert(`Warning: Number of attendees (${attendees}) exceeds venue capacity (${venue.capacity})`);
      return;
    }

    const venueBooking = {
      title: title.trim(),
      description,
      attendees: parseInt(attendees),
      type: 'venue-booking',
      label: 'blue',
      day: daySelected.valueOf(),
      id: selectedVenue ? selectedVenue.id : Date.now(),
      startTime,
      endTime,
      venueId: selectedVenueId,
      venueName: venue.name,
      startTimestamp: dayjs(`${daySelected.format('YYYY-MM-DD')} ${startTime}`).valueOf(),
      endTimestamp: dayjs(`${daySelected.format('YYYY-MM-DD')} ${endTime}`).valueOf(),
    };

    dispatchVenue({ 
      type: selectedVenue ? "update" : "push", 
      payload: venueBooking 
    });

    setShowVenueModal(false);
  }

  return (
    <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center">
      <form className="bg-white rounded-lg shadow-2xl w-1/3">
        <header className="bg-gray-100 px-4 py-2 flex justify-between items-center">
          <h2 className="text-gray-800">Book Venue</h2>
          <button onClick={() => setShowVenueModal(false)}>
            <span className="material-icons-outlined text-gray-400">close</span>
          </button>
        </header>
        <div className="p-3">
          <div className="grid grid-cols-1/5 items-end gap-y-7">
            <select
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              required
              className="pt-3 border-0 text-gray-600 text-xl font-semibold pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
            >
              <option value="">Select Venue</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} (Capacity: {venue.capacity})
                </option>
              ))}
            </select>

            <input
              type="text"
              name="title"
              placeholder="Booking Title"
              value={title}
              required
              className="pt-3 border-0 text-gray-600 text-xl font-semibold pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <div className="flex gap-x-2">
              <input
                type="time"
                name="startTime"
                value={startTime}
                required
                className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
                onChange={(e) => setStartTime(e.target.value)}
              />
              <input
                type="time"
                name="endTime"
                value={endTime}
                required
                className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <textarea
              name="description"
              placeholder="Booking Description"
              value={description}
              className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="number"
              name="attendees"
              placeholder="Number of Attendees"
              value={attendees}
              className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setAttendees(e.target.value)}
            />
          </div>
        </div>
        <footer className="flex justify-end border-t p-3 mt-5">
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded text-white"
          >
            Book Venue
          </button>
        </footer>
      </form>
    </div>
  );
}