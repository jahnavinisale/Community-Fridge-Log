import { request } from './client.js';

export const usersApi = {
  list: async () => {
    const res = await request('/users');
    return res.data;
  },

  create: async (userData) => {
    const res = await request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res;
  },

  update: async (id, data) => {
    const res = await request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res;
  },
};

export const fridgeApi = {
  get: async () => {
    const res = await request('/fridges');
    return res.data;
  },

  update: async (data) => {
    const res = await request('/fridges', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res;
  },
};
