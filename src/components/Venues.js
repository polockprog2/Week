import React, { useContext } from 'react';
import dayjs from 'dayjs';
import GlobalContext from '../context/GlobalContext';
import VenueModal from './VenueModal';

const venues = [
  { id: 1, name: 'Conference Room A', capacity: 20, floor: '1st Floor' },
  { id: 2, name: 'Meeting Room 1', capacity: 10, floor: '2nd Floor' },
  { id: 3, name: 'Board Room', capacity: 15, floor: '3rd Floor' },
  { id: 4, name: 'Training Room', capacity: 30, floor: '2nd Floor' },
  { id: 5, name: 'Auditorium', capacity: 100, floor: 'Ground Floor' }
];

export default function Venues() {
  const { 
    savedVenues,
    daySelected, 
    setShowVenueModal,
    setSelectedVenue,
    showVenueModal,
  } = useContext(GlobalContext);

  // Get bookings for a specific venue on the selected day
  const getVenueBookings = (venueId) => {
    return savedVenues.filter(booking => 
      booking.venueId === venueId.toString() && 
      dayjs(booking.day).format('YYYY-MM-DD') === daySelected.format('YYYY-MM-DD')
    );
  };

  // Check if a venue is available at the current time
  const isVenueAvailable = (bookings) => {
    if (bookings.length === 0) return true;
    const currentTime = dayjs();
    return !bookings.some(booking => {
      const startTime = dayjs(booking.startTime);
      const endTime = dayjs(booking.endTime);
      return currentTime.isAfter(startTime) && currentTime.isBefore(endTime);
    });
  };

  // Handle booking a venue
  const handleBookVenue = (venue) => {
    setSelectedVenue({
      title: '',
      day: daySelected.valueOf(),
      venueId: venue.id.toString(),
      venueName: venue.name,
      capacity: venue.capacity,
      label: 'green',
      type: 'venue-booking'
    });
    setShowVenueModal(true);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Venue Availability</h2>
          <div className="text-sm text-gray-500">
            {daySelected.format('dddd, MMMM D, YYYY')}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          {venues.map(venue => {
            const bookings = getVenueBookings(venue.id);
            const available = isVenueAvailable(bookings);

            return (
              <div key={venue.id} 
                className="border rounded-lg p-4 bg-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <h3 className=" font-semibold text-gray-800">{venue.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      available ? 'bg-green-50 text-green-400' : 'bg-red-100 text-red-800'
                    }`}>
                      {available ? 'Available' : 'Occupied'}
                    </span>
                    <button
                      onClick={() => handleBookVenue(venue)}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    >
                      Book
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  <div>Capacity: {venue.capacity} people</div>
                  <div>Location: {venue.floor}</div>
                </div>

                {bookings.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Today's Bookings:</h4>
                    <div className="space-y-2">
                      {bookings.map((booking, idx) => (
                        <div key={idx} 
                          className="text-xs font-semibold bg-green-50 p-2 rounded border border-gray-100">
                          <div className="text-xsfont-medium">{booking.title}</div>
                          <div className="text-xs text-gray-500">
                            {dayjs(booking.startTime).format('HH:mm')} - 
                            {dayjs(booking.endTime).format('HH:mm')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {showVenueModal && <VenueModal />}
    </div>
  );
}