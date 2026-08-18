// Central place for the backend base URL.
// In dev, falls back to localhost:3000 if VITE_API_URL isn't set.
// In prod (Vercel), set VITE_API_URL to your Render backend URL.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
