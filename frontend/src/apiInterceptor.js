import axios from "axios";

const server = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const api = axios.create({
  baseURL: server,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (
      config.method === "post" ||
      config.method === "put" ||
      config.method === "delete"
    ) {
      const csrfToken = getCookie("csrfToken");

      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshingAccessToken = false;
let accessTokenFailedQueue = [];
let isRefreshingCSRFToken = false;
let csrfFailedQueue = [];

const processAccessTokenQueue = (error) => {
  accessTokenFailedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  accessTokenFailedQueue = [];
};

const processCSRFQueue = (error) => {
  csrfFailedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  csrfFailedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshingAccessToken) {
        return new Promise((resolve, reject) => {
          accessTokenFailedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshingAccessToken = true;
      try {
        await api.post("/api/v1/refresh");
        processAccessTokenQueue(null);
        return api(originalRequest);
      } catch (err) {
        processAccessTokenQueue(err);
        return Promise.reject(err);
      } finally {
        isRefreshingAccessToken = false;
      }
    }

    if (
      error.response?.status === 403 &&
      error.response?.data?.code?.startsWith("CSRF_") &&
      !originalRequest._retryCsrf
    ) {
      if (isRefreshingCSRFToken) {
        return new Promise((resolve, reject) => {
          csrfFailedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retryCsrf = true;
      isRefreshingCSRFToken = true;
      try {
        await api.post("/api/v1/refresh-csrf");
        processCSRFQueue(null);
        return api(originalRequest);
      } catch (err) {
        processCSRFQueue(err);
        return Promise.reject(err);
      } finally {
        isRefreshingCSRFToken = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
