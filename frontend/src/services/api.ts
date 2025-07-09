import axios from 'axios'

// Define and export the Event type
export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  categories: string[];
  price: string;
  url: string;
  source: string;
  registration_closes: string;
}

// Determine the API base URL based on environment or hostname
const getApiBaseUrl = () => {
  // First check for environment variable (for production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For local development, use the hostname
  const hostname = window.location.hostname;
  return `http://${hostname}:8001/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add API key to all requests
api.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_API_KEY || 'supersecretapikey'; // fallback for dev
  config.headers = config.headers || {};
  config.headers['X-API-KEY'] = apiKey;
  return config;
});

export const getEvents = async (): Promise<Event[]> => {
  const response = await api.get('/events')
  return response.data
}

export const getEventById = async (id: string): Promise<Event> => {
  const response = await api.get(`/events/${id}`)
  return response.data
}

export const getEventsBySource = async (source: string): Promise<Event[]> => {
  const response = await api.get(`/events/source/${source}`)
  return response.data
}

export default api 