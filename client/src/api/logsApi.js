import { request } from './client.js';

export const logsApi = {
  list: async (params = {}) => {
    const cleanParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        cleanParams.append(key, val);
      }
    });
    const query = cleanParams.toString() ? `?${cleanParams.toString()}` : '';
    const res = await request(`/logs${query}`);
    return res.data;
  },

  getStats: async () => {
    const res = await request('/logs/stats');
    return res.data;
  },
};
