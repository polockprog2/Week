import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Update this with your ASP.NET Core API URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Events API
export const eventsApi = {
    getAll: (startDate, endDate) => 
        api.get('/events', { params: { startDate, endDate } }),
    getById: (id) => 
        api.get(`/events/${id}`),
    create: (event) => 
        api.post('/events', event),
    update: (id, event) => 
        api.put(`/events/${id}`, event),
    delete: (id) => 
        api.delete(`/events/${id}`),
};

// Tasks API
export const tasksApi = {
    getAll: (startDate, endDate) => 
        api.get('/tasks', { params: { startDate, endDate } }),
    getById: (id) => 
        api.get(`/tasks/${id}`),
    create: (task) => 
        api.post('/tasks', task),
    update: (id, task) => 
        api.put(`/tasks/${id}`, task),
    delete: (id) => 
        api.delete(`/tasks/${id}`),
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