import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// CSRF Token Synchronization
let csrfToken: string | null = null;

const syncCsrfToken = (headers: any) => {
    const token = headers['x-csrf-token'];
    if (token) {
        csrfToken = token;
    }
};

api.interceptors.response.use(
    (response) => {
        syncCsrfToken(response.headers);
        return response;
    },
    (error) => {
        if (error.response) {
            syncCsrfToken(error.response.headers);
        }
        return Promise.reject(error);
    }
);

api.interceptors.request.use((config) => {
    // Attach CSRF token for state-changing methods
    if (csrfToken && config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    // Attach JWT Bearer token from localStorage for all requests
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return config;
});

export default api;
