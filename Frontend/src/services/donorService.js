import api from './api';

export const donorService = {
  registerDonor: async (donorData) => {
    const response = await api.post('/donor/register', donorData);
    return response.data;
  },

  getDonorProfile: async () => {
    const response = await api.get('/donor/profile');
    return response.data;
  },

  updateDonorProfile: async (donorData) => {
    const response = await api.put('/donor/profile', donorData);
    return response.data;
  },

  getDonorHistory: async () => {
    const response = await api.get('/donor/history');
    return response.data;
  },

  getAllDonors: async (filters) => {
    const response = await api.get('/donor/all', { params: filters });
    return response.data;
  },

  searchDonors: async (searchCriteria) => {
    const response = await api.post('/donor/search', searchCriteria);
    return response.data;
  }
};
