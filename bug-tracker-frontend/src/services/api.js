import axios from 'axios';

// Direct connection to backend API
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

export default api;


