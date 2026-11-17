import { request } from './client.js';

export const itemsApi = {
  list: async (params = {}) => {
    const cleanParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        cleanParams.append(key, val);
      }
    });
    const query = cleanParams.toString() ? `?${cleanParams.toString()}` : '';
    const res = await request(`/items${query}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await request(`/items/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await request('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  update: async (id, data) => {
    const res = await request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res;
  },

  collect: async (id, data) => {
    const res = await request(`/items/${id}/collect`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  dispose: async (id, data) => {
    const res = await request(`/items/${id}/dispose`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },
};
