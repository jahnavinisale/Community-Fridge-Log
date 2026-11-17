import { request } from './client.js';

export const authApi = {
  login: async (credentials) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await request('/auth/me');
    return res.data.user;
  },

  register: async (userData) => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res.data;
  },
};
