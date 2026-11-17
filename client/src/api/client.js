const RAW_API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
// Normalize URL by removing trailing slash if present
const BASE_URL = RAW_API_URL.replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status, code, details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('cfl_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (networkErr) {
    throw new ApiError(
      'Unable to connect to the Community Fridge server. Please verify your connection.',
      0,
      'NETWORK_ERROR'
    );
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    // If unauthorized or token expired, clean up session
    if (response.status === 401) {
      if (localStorage.getItem('cfl_token')) {
        localStorage.removeItem('cfl_token');
        localStorage.removeItem('cfl_user');
        window.dispatchEvent(new Event('cfl-auth-expired'));
      }
    }

    const message = data?.error?.message || data?.message || 'Request failed';
    const code = data?.error?.code || 'API_ERROR';
    const details = data?.error?.details || [];
    throw new ApiError(message, response.status, code, details);
  }

  return data;
};
