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
    create: (venue) => 
        api.post('/venues', venue),
};

export const venueBookingsApi = {
    getAll: () => 
        api.get('/venuebookings'),
    create: (booking) => 
        api.post('/venuebookings', booking),
    // Add update/delete if you implement them in backend
};

export default api;