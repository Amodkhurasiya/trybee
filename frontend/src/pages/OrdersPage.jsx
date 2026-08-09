import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchUserOrdersAsync,
  cancelOrderAsync,
  selectOrderHistory,
  selectOrdersLoading,
  selectOrdersError,
} from '../store/orderSlice';
import { selectIsAuthenticated } from '../store/authSlice';
import { showSuccessToast, showErrorToast } from '../store/toastSlice';
import { getProductImageUrl } from '../utils/imageUtils';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const rawOrders = useSelector(selectOrderHistory);
  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);

  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [cancellingOrder, setCancellingOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent('/orders'));
      return;
    }

    // Fetch user orders
    dispatch(fetchUserOrdersAsync({ page, limit: 10, status: filterStatus === 'all' ? '' : filterStatus }));
  }, [dispatch, isAuthenticated, navigate, page, filterStatus]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancellingOrder(orderId);
    try {
      await dispatch(cancelOrderAsync(orderId)).unwrap();
      dispatch(showSuccessToast('Order cancelled successfully'));
      // Force a complete page reload to ensure fresh data
      window.location.reload();
    } catch (error) {
      // Convert error to string to avoid serialization issues
      const errorMessage = typeof error === 'string' ? error : 
                          error?.message || 
                          'Failed to cancel order';
      dispatch(showErrorToast(errorMessage));
      setCancellingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const canCancelOrder = (order) => {
    return order && order.orderStatus && ['pending', 'confirmed'].includes(order.orderStatus);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders.filter(order => order && order._id) // Filter out undefined/null orders
    : orders.filter(order => order && order._id && order.orderStatus === filterStatus);

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="mt-2 text-gray-600">Track and manage your orders</p>
          </div>
          
          {/* Filter */}
          <div className="mt-4 sm:mt-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ebb665] focus:border-[#ebb665]"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {filterStatus === 'all' ? 'No orders yet' : `No ${filterStatus} orders`}
            </h2>
            <p className="text-gray-600 mb-8">
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                : `You don't have any ${filterStatus} orders at the moment.`
              }
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-[#ebb665] text-white font-medium rounded-lg hover:bg-[#d2a45b] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              // Additional safety check
              if (!order || !order._id) return null;
              
              return (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order.orderNumber || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{((order.totalAmount || 0) + (order.shippingFee || 0) + (order.taxAmount || 0)).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.totalItems || 0} {(order.totalItems || 0) === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-[#b17e1a] hover:text-[#9a6c16] text-sm font-medium"
                        >
                          View Details
                        </Link>
                        
                        {canCancelOrder(order) && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={cancellingOrder === order._id}
                            className="text-red-600 hover:text-red-500 text-sm font-medium disabled:opacity-50"
                          >
                            {cancellingOrder === order._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {(order.items || []).slice(0, 3).map((item, index) => {
                      if (!item) return null;
                      return (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src={getProductImageUrl(item.productId?.images?.[0])}
                            alt={item.name || 'Product'}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name || 'Unknown Product'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity || 0} × ₹{item.price || 0}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ₹{(item.totalPrice || 0).toFixed(2)}
                        </div>
                      </div>
                      );
                    })}
                    
                    {(order.items || []).length > 3 && (
                      <div className="text-center">
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-[#b17e1a] hover:text-[#9a6c16] text-sm font-medium"
                        >
                          +{(order.items || []).length - 3} more items
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {(order.paymentMethod || 'N/A').toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {order.orderStatus === 'delivered' && (
                        <button className="text-[#b17e1a] hover:text-[#9a6c16] text-sm font-medium">
                          Rate & Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
            
            {/* Pagination */}
            {orders.length > 0 && (
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                    Page {page}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={orders.length < 10}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
