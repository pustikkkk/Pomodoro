import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:3000/api/v1',
  // withCredentials is required so the browser sends the httpOnly 'token' cookie on cross-origin requests.
  withCredentials: true,
})

// Global 401 handler: redirects to /login whenever the JWT is missing or expired.
// This covers all API calls without needing per-call error handling.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
