import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { ShoppingCart, Plus, Package, Calendar, CheckCircle, Clock, Loader2 } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formData, setFormData] = useState({
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }

    try {
      await orderService.createOrder({
        productIds: selectedProducts,
        notes: formData.notes
      });
      setShowCreateModal(false);
      setSelectedProducts([]);
      setFormData({ notes: '' });
      fetchOrders();
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order');
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
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
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
          <p className="text-gray-500 dark:text-gray-400">Track and manage your orders</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Create Order</span>
        </button>
      </div>

      <div className="space-y-6">
        {orders.map((order, index) => (
          <div 
            key={order.id} 
            className="card p-6 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order #{order.id}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              {getStatusBadge(order.status)}
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
      </div>

      {orders.length === 0 && (
        <div className="card p-12 text-center animate-fade-in">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Orders Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start shopping to create your first order</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Order</span>
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content p-6 sm:p-8 max-w-3xl max-h-[90vh] overflow-y-auto w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Order</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedProducts([]);
                  setFormData({ notes: '' });
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateOrder} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select Products
                  <span className="text-blue-600 dark:text-blue-400 ml-2">({selectedProducts.length} selected)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => toggleProductSelection(product.id)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedProducts.includes(product.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-soft'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedProducts.includes(product.id)
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {selectedProducts.includes(product.id) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{product.name}</h4>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</p>
                        </div>
                        <span className="text-lg font-bold text-gradient">${product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  className="input-field resize-none"
                  rows="3"
                  placeholder="Add any special instructions for your order"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedProducts([]);
                    setFormData({ notes: '' });
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedProducts.length === 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
