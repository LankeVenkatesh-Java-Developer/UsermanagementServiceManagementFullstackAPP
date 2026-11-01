import api from '../utils/api';

export const adminService = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  deleteUser: async (id) => {
    await api.delete(`/admin/users/${id}`);
  },

  getAllOrders: async () => {
    const response = await api.get('/admin/orders');
    return response.data;
  }
};
