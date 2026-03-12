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

api.interceptors.response.use((response) => {
    const token = response.headers['x-csrf-token'];
    if (token) {
        csrfToken = token;
        if (process.env.NODE_ENV === 'development') {
            console.log('🛡️ CSRF Token synchronized via header');
        }
    }
    return response;
});

api.interceptors.request.use((config) => {
    if (csrfToken && config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    return config;
});

export default api;
