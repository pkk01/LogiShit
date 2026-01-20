// Central place to resolve API base URL for both hosted and local envs
const resolvedBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://logishift.onrender.com/api')

export const API_BASE_URL = resolvedBaseUrl

export const apiUrl = (path = ''): string => {
  if (!path) return API_BASE_URL
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalized}`
}
