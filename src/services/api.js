import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/'; // Update this with your ASP.NET Core API URL


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Events API
export const eventsApi = {
    getAll: (startDate, endDate) => 
        api.get('/Event', { params: { startDate, endDate } }),
    getById: (id) => 
        api.get(`/Event/${id}`),
    create: (event) => 
        api.post('/Event', event),
    update: (id, event) => 
        api.put(`/Event/${id}`, event),
    delete: (id) => 
        api.delete(`/Event/${id}`),
};

// Tasks API
export const tasksApi = {
    getAll: () => 
        api.get('/Task'),
    getById: (id) => 
        api.get(`/Task/${id}`),
    create: (task) => 
        api.post(`/Task`, task),
    update: (id, task) => 
        api.put(`/Task/${id}`, task),
    delete: (id) => 
        api.delete(`/Task/${id}`),
};

// Venues API
export const venuesApi = {
    getAll: () => 
        api.get('/venues'),
    getById: (id) => 
        api.get(`/venues/${id}`),
    getBookings: (id, date) => 
        api.get(`/venues/${id}/bookings`, { params: { date } }),
    createBooking: (id, booking) => 
        api.post(`/venues/${id}/bookings`, booking),
    updateBooking: (id, bookingId, booking) => 
        api.put(`/venues/${id}/bookings/${bookingId}`, booking),
    deleteBooking: (id, bookingId) => 
        api.delete(`/venues/${id}/bookings/${bookingId}`),
};

export default api; 