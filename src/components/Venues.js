import React, { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import GlobalContext from '../context/GlobalContext';
import VenueModal from './VenueModal';
import '../assets/styles.css'; // <-- import your styles
import { venuesApi } from '../services/api'; // <-- import the API

export default function Venues() {
  const { 
    savedVenues,
    daySelected, 
    setShowVenueModal,
    setSelectedVenue,
    showVenueModal,
  } = useContext(GlobalContext);

  const [venues, setVenues] = useState([]);

  // Fetch venues from backend
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await venuesApi.getAll();
        setVenues(response.data);
      } catch (error) {
        console.error("Failed to fetch venues", error);
      }
    };
    fetchVenues();
  }, []);

  // Get bookings for a specific venue on the selected day
  const getVenueBookings = (venueId) => {
    return savedVenues.filter(booking => 
      booking.venueId === venueId && 
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
      day: daySelected.format("YYYY-MM-DD"),
      venueId: venue.venueId,     
      venueName: venue.name,        
      capacity: venue.capacity,    
      label: 'green',
      type: 'venue-booking'
    });
    setShowVenueModal(true);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gray-50">
      <div className="p-4 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="material-icons-outlined text-blue-500">meeting_room</span>
            Venue Availability
          </h2>
          <div className="text-sm text-gray-500">
            {daySelected.format('dddd, MMMM D, YYYY')}
          </div>
        </div>
        {venues.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <span className="material-icons-outlined text-5xl mb-2">event_busy</span>
            <div>No venues found.</div>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          {venues.map(venue => {
            const bookings = getVenueBookings(venue.venueId);
            const available = isVenueAvailable(bookings);
            return (
              <div key={venue.venueId}
                className="border rounded-lg p-5 bg-white shadow-sm hover:shadow-lg transition-shadow flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                      <span className="material-icons-outlined text-gray-400">location_on</span>
                      {venue.name}
                    </h3>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><span className="material-icons-outlined text-base">people</span>Capacity: {venue.capacity}</span>
                      <span className="flex items-center gap-1"><span className="material-icons-outlined text-base">layers</span>Floor: {venue.floor}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      title={available ? 'Venue is available' : 'Venue is occupied'}>
                      <span className="material-icons-outlined text-base">
                        {available ? 'check_circle' : 'cancel'}
                      </span>
                      {available ? 'Available' : 'Occupied'}
                    </span>
                    <button
                      onClick={() => handleBookVenue(venue)}
                      className={`text-xs px-3 py-1 mt-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center gap-1 ${!available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!available}
                      title={available ? 'Book this venue' : 'Cannot book while occupied'}
                    >
                      <span className="material-icons-outlined text-sm">event_available</span>
                      Book
                    </button>
                  </div>
                </div>
                {bookings.length > 0 ? (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <span className="material-icons-outlined text-base text-green-400">event_note</span>
                      Today's Bookings
                    </h4>
                    <div className="space-y-2">
                      {bookings.map((booking, idx) => (
                        <div key={idx}
                          className="text-xs font-semibold bg-green-50 p-2 rounded border border-green-100 flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-700">{booking.title}</div>
                            <div className="text-xs text-gray-500">
                              {dayjs(booking.startTime).format('HH:mm')} - {dayjs(booking.endTime).format('HH:mm')}
                            </div>
                          </div>
                          <span className="material-icons-outlined text-green-400 text-base ml-2">schedule</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-gray-400 italic flex items-center gap-1">
                    <span className="material-icons-outlined text-base">event_available</span>
                    No bookings for today.
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>
      {showVenueModal && <VenueModal />}
    </div>
  );
}