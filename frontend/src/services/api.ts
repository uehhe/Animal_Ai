import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Đính kèm JWT token từ localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('petcare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý 401 token hết hạn và bóc tách error message
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: string[] }>) => {
    if (error.response?.status === 401) {
      // Hết hạn phiên đăng nhập
      localStorage.removeItem('petcare_token');
      localStorage.removeItem('petcare_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }

    const message = error.response?.data?.message || error.message || 'Đã xảy ra sự cố kết nối máy chủ.';
    const errors = error.response?.data?.errors;
    return Promise.reject({ message, errors, status: error.response?.status });
  }
);
