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

const syncToken = (headers: any) => {
    const token = headers['x-csrf-token'];
    if (token) {
        csrfToken = token;
        // console.log('🛡️ CSRF Token synchronized via header');
    }
};

api.interceptors.response.use(
    (response) => {
        syncToken(response.headers);
        return response;
    },
    (error) => {
        if (error.response) {
            syncToken(error.response.headers);
        }
        return Promise.reject(error);
    }
);

api.interceptors.request.use((config) => {
    if (csrfToken && config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    return config;
});

export default api;
