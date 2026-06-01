import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global fetch interceptor to handle session timeouts and redirects
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    // If the response is redirected to the login page or returns 401 Unauthorized
    if (response.status === 401 || (response.redirected && response.url.includes('/login'))) {
        window.location.href = '/login?timeout=true';
    }
    return response;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
