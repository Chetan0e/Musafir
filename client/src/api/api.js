import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Attach JWT token to every request and handle FormData
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Remove Content-Type for FormData (let browser set it with boundary)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    const errorCode = error.response?.data?.error;
    
    // Handle specific error codes
    if (errorCode === 'AI_CONFIG_ERROR') {
      console.error('AI service not configured');
    }
    
    if (errorCode === 'RATE_LIMIT') {
      console.error('Rate limit exceeded');
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  updatePassword: (data) => API.put('/auth/password', data),
};

// Trip API
export const tripAPI = {
  generate: (data) => API.post('/trips/generate', data),
  save: (data) => API.post('/trips/save', data),
  getUserTrips: (params) => API.get('/trips/user', { params }),
  getTripById: (id) => API.get(`/trips/${id}`),
  updateTrip: (id, data) => API.put(`/trips/${id}`, data),
  delete: (id) => API.delete(`/trips/${id}`),
  getTrending: () => API.get('/trips/trending'),
  getStats: () => API.get('/trips/stats'),
  modifyTrip: (id, data) => API.post(`/trips/${id}/modify`, data),
};

// AI API
export const aiAPI = {
  chat: (data) => API.post('/ai/chat', data),
  clear: () => API.post('/ai/clear'),
  getSuggestions: (query) => API.get('/ai/suggestions', { params: { query } }),
};

// Places API
export const placesAPI = {
  identify: (formData) => API.post('/places/identify', formData),
  search: (query) => API.get('/places/search', { params: { q: query } }),
  getDetails: (params) => API.get('/places/details', { params }),
};

// Story API
export const storyAPI = {
  create: (data) => API.post('/stories', data),
  getAll: (params) => API.get('/stories', { params }),
  getStoryById: (id) => API.get(`/stories/${id}`),
  getMyStories: (params) => API.get('/stories/my-stories', { params }),
  like: (id) => API.post(`/stories/${id}/like`),
  addComment: (id, data) => API.post(`/stories/${id}/comments`, data),
  update: (id, data) => API.put(`/stories/${id}`, data),
  delete: (id) => API.delete(`/stories/${id}`),
};

export default API;
