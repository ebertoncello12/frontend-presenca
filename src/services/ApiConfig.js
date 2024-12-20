import axios from 'axios';

const ApiConfig = axios.create({
  baseURL: 'http://localhost:3080/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

ApiConfig.interceptors.request.use(
  config => {
    const token = localStorage.getItem('AUTH');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default ApiConfig;
