// Small API client. The API address comes from the VITE_API_URL environment variable.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

const TOKEN_KEY = 'workflowhub_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Turns Django REST Framework error bodies into one readable sentence.
export function errorMessage(data, fallback = 'Something went wrong') {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  const parts = Object.entries(data).map(([field, msgs]) => {
    const text = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
    return field === 'non_field_errors' ? text : `${field}: ${text}`;
  });
  return parts.join(' ') || fallback;
}

export async function request(path, { method = 'GET', body, token = tokenStore.get() } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Token ${token}`;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  if (response.status === 401 && token && !path.startsWith('/auth/')) {
    // The saved login is no longer valid: let the app sign the user out and explain why.
    window.dispatchEvent(new Event('workflowhub:session-expired'));
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(errorMessage(data));
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  register: (body) => request('/auth/register/', { method: 'POST', body, token: null }),
  login: (body) => request('/auth/login/', { method: 'POST', body, token: null }),
  logout: () => request('/auth/logout/', { method: 'POST' }),
  me: () => request('/auth/me/'),
  listItems: () => request('/items/'),
  createItem: (body) => request('/items/', { method: 'POST', body }),
  updateItem: (id, body) => request(`/items/${id}/`, { method: 'PATCH', body }),
  deleteItem: (id) => request(`/items/${id}/`, { method: 'DELETE' }),
};
