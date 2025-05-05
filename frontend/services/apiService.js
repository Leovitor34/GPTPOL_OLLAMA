import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // Certifique-se de que esta URL está correta
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient; 