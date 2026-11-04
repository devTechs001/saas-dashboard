import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- session refresh machinery -------------------------------------------
// A 401 on a protected route means the access token died. Instead of killing
// the session, exchange the refresh token (or the expired access token) for a
// fresh pair at POST /auth/refresh and replay the original request once.

// Endpoints that issue/manage sessions themselves — a 401 there is a real
// "invalid credentials" answer, never a reason to log out or refresh.
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/refresh'];

const isAuthPath = (url = '') => AUTH_PATHS.some((p) => url.includes(p));

const hardLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  try {
    if (typeof window !== 'undefined' && window.location && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  } catch {
    /* non-browser environments (tests) */
  }
};

const persistSession = (data) => {
  if (data?.token) localStorage.setItem('token', data.token);
  if (data?.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
  if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));
};

const requestNewTokens = async () => {
  const credential = localStorage.getItem('refreshToken') || localStorage.getItem('token');
  if (!credential) return null;
  // Goes through `api` so mock adapters / base URL / interceptors all apply.
  // '/auth/refresh' is an auth path: failures never recurse or log out.
  const res = await api.post('/auth/refresh', { refreshToken: credential });
  const data = res.data?.data;
  if (!data?.token) return null;
  persistSession(data);
  return data.token;
};

// Concurrent 401s must trigger exactly ONE refresh round-trip.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const status = error.response?.status;

    if (status === 401 && !isAuthPath(config.url)) {
      if (!config._sessionRetried) {
        refreshPromise = refreshPromise || requestNewTokens().catch(() => null);
        let newToken = null;
        try {
          newToken = await refreshPromise;
        } finally {
          refreshPromise = null;
        }
        if (newToken) {
          config._sessionRetried = true;
          config.headers = { ...(config.headers || {}), Authorization: `Bearer ${newToken}` };
          return api.request(config);
        }
      }
      // No refresh possible, or the refreshed token was rejected too
      // (replay reaches this point with _sessionRetried set) — session is dead.
      hardLogout();
    }
    return Promise.reject(error);
  }
);

export { hardLogout, persistSession };
export default api;
