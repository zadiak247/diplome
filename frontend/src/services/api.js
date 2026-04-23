import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
  },
  withCredentials: true
});

let logoutCallback = null;
export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

let isLoggingOut = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && logoutCallback && !isLoggingOut) {
      isLoggingOut = true;
      logoutCallback();
      setTimeout(() => { isLoggingOut = false; }, 0);
    }
    return Promise.reject(error);
  }
);

export default api;