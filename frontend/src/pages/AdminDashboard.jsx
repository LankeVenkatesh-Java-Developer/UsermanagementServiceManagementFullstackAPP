import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Users, ShoppingCart, Trash2, Shield, Mail, User as UserIcon, Calendar, CheckCircle, Clock, Package, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const data = await adminService.getAllUsers();
        setUsers(data);
      } else {
        const data = await adminService.getAllOrders();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      COMPLETED: { color: 'badge-success', icon: CheckCircle },
      PENDING: { color: 'badge-warning', icon: Clock },
      PROCESSING: { color: 'badge-primary', icon: Package },
    };
    const config = statusConfig[status] || { color: 'badge-secondary', icon: Clock };
    const Icon = config.icon;
    
    return (
      <span className={`${config.color} flex items-center space-x-1`}>
        <Icon className="w-4 h-4" />
        <span>{status}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage users and orders</p>
          </div>
        </div>
        
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'users'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>All Orders</span>
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="table-container animate-fade-in">
          <div className="table-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total users: {users.length}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className="table-row animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-secondary' : 'badge-primary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={user.enabled ? 'badge-success' : 'badge-danger'}>
                        {user.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No users found</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Management</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total orders: {orders.length}</p>
            </div>
          </div>
          
          {orders.map((order, index) => (
            <div 
              key={order.id} 
              className="card p-6 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/50 dark:to-pink-800/50 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order #{order.id}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Mail className="w-4 h-4" />
                      <span>{order.user?.email || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Products
                </h4>
                <div className="flex flex-wrap gap-2">
                  {order.products?.map((product) => (
                    <span 
                      key={product.id} 
                      className="badge-primary flex items-center space-x-1"
                    >
                      <span>{product.name}</span>
                      <span className="text-blue-400 dark:text-blue-500">•</span>
                      <span className="font-semibold">${product.price.toFixed(2)}</span>
                    </span>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Order Notes</h4>
                  <p className="text-gray-600 dark:text-gray-400">{order.notes}</p>
                </div>
              )}
            </div>
          ))}
          
          {orders.length === 0 && (
            <div className="card p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Orders Found</h3>
              <p className="text-gray-500 dark:text-gray-400">There are no orders in the system yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
