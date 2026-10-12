import axios from 'axios';

// Keep the API base URL in one place so components never hardcode server URLs.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
