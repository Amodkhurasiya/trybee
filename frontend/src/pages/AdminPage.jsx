import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import formatINR from '../utils/currency';
import { getFirstProductImage, handleImageError } from '../utils/imageUtils';
import { uploadAPI } from '../utils/axios';
import {
  fetchAdminStatsAsync,
  fetchAllUsersAsync,
  fetchAllOrdersAsync,
  fetchAllProductsAsync,
  createProductAsync,
  updateProductAsync,
  deleteProductAsync,
  updateUserAsync,
  updateOrderStatusAsync,
  selectAdminStats,
  selectAdminUsers,
  selectUsersTotal,
  selectAdminOrders,
  selectOrdersTotal,
  selectAdminProducts,
  selectProductsTotal,
  selectAdminLoading,
  selectAdminError
} from '../store/adminSlice';

const AdminPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const qp = new URLSearchParams(window.location.search);
    return qp.get('tab') || 'dashboard';
  });
  
  const stats = useSelector(selectAdminStats);
  const users = useSelector(selectAdminUsers);
  const usersTotal = useSelector(selectUsersTotal);
  const orders = useSelector(selectAdminOrders);
  const ordersTotal = useSelector(selectOrdersTotal);
  const products = useSelector(selectAdminProducts);
  const productsTotal = useSelector(selectProductsTotal);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);

  // Pagination state for tabs
  const USERS_LIMIT = 25;
  const ORDERS_LIMIT = 25;
  const PRODUCTS_LIMIT = 25;
  const [usersPage, setUsersPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);

  // Local state for creating a product
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'jewelry',
    stock: 0,
    tags: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit product state
  const [editingProductId, setEditingProductId] = useState(null);
  const editingProduct = useMemo(() => products.find(p => (p._id || p.id) === editingProductId), [products, editingProductId]);
  const [editForm, setEditForm] = useState({ name: '', price: 0, stock: 0, category: 'jewelry', isActive: true });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const q = productSearchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => {
      const inName = (p.name || '').toLowerCase().includes(q);
      const inCategory = (p.category || '').toLowerCase().includes(q);
      const inTags = Array.isArray(p.tags) && p.tags.some(t => (t || '').toLowerCase().includes(q));
      const inId = (p._id || p.id || '').toString().toLowerCase().includes(q);
      return inName || inCategory || inTags || inId;
    });
  }, [products, productSearchQuery]);

  useEffect(() => {
    // Keep activeTab in sync if query param changes (e.g., when navigating back)
    const qp = new URLSearchParams(location.search);
    const tab = qp.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    // Load initial data based on active tab
    switch (activeTab) {
      case 'dashboard':
        dispatch(fetchAdminStatsAsync());
        break;
      case 'users':
        dispatch(fetchAllUsersAsync({ page: usersPage, limit: USERS_LIMIT }));
        break;
      case 'orders':
  dispatch(fetchAllOrdersAsync({ page: ordersPage, limit: ORDERS_LIMIT }));
        break;
    case 'products':
  dispatch(fetchAllProductsAsync({ isActive: 'all', page: productsPage, limit: PRODUCTS_LIMIT }));
    break;
  default:
        break;
    }
  }, [dispatch, activeTab, usersPage, ordersPage, productsPage]);

  // Reset pages when switching tabs
  useEffect(() => {
    if (activeTab === 'users') setUsersPage(1);
  if (activeTab === 'orders') setOrdersPage(1);
    if (activeTab === 'products') setProductsPage(1);
  }, [activeTab]);

  const renderContent = () => {
  if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': {
        const overview = stats?.overview || {};
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
              <p className="text-3xl font-bold text-indigo-600">{overview.totalUsers || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Total Products</h3>
              <p className="text-3xl font-bold text-green-600">{overview.totalProducts || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
              <p className="text-3xl font-bold text-blue-600">{overview.totalOrders || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
              <p className="text-3xl font-bold text-yellow-600">{formatINR(overview.totalRevenue || 0)}</p>
            </div>
          </div>
        );
      }
      
      case 'users':
        return (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Users Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const uid = user._id || user.id;
                    return (
                    <tr key={uid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.isAdmin ? 'Admin' : 'User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            title={user.isAdmin ? 'Revoke admin privileges' : 'Grant admin privileges'}
                            onClick={() => dispatch(updateUserAsync({ userId: uid, updateData: { isAdmin: !user.isAdmin } }))}
                            className="text-xs px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
                          >{user.isAdmin ? 'Revoke Admin' : 'Grant Admin'}</button>
                          <button
                            title={user.isActive ? 'Prevent this user from logging in' : 'Allow this user to log in'}
                            onClick={() => dispatch(updateUserAsync({ userId: uid, updateData: { isActive: !user.isActive } }))}
                            className="text-xs px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
                          >{user.isActive ? 'Disable Login' : 'Enable Login'}</button>
                          <button
                            title={user.isVerified ? 'Mark this user as unverified' : 'Mark this user as verified'}
                            onClick={() => dispatch(updateUserAsync({ userId: uid, updateData: { isVerified: !user.isVerified } }))}
                            className="text-xs px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
                          >{user.isVerified ? 'Mark Unverified' : 'Mark Verified'}</button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
            {/* Users pagination */}
            {(() => {
              const total = usersTotal || users.length || 0;
              const totalPages = Math.max(1, Math.ceil(total / USERS_LIMIT));
              if (totalPages <= 1) return null;
              const maxButtons = 6;
              const pagesToShow = Array.from({ length: Math.min(totalPages, maxButtons) }, (_, i) => i + 1);
              return (
                <div className="px-6 py-4 flex items-center justify-center gap-2">
                  <button
                    className="px-3 py-2 border rounded disabled:opacity-50"
                    disabled={usersPage <= 1 || loading}
                    onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                  >Prev</button>
                  {pagesToShow.map(p => (
                    <button
                      key={p}
                      className={`px-3 py-2 border rounded ${p === usersPage ? 'bg-indigo-600 text-white' : ''}`}
                      disabled={loading}
                      onClick={() => setUsersPage(p)}
                    >{p}</button>
                  ))}
                  <button
                    className="px-3 py-2 border rounded disabled:opacity-50"
                    disabled={usersPage >= totalPages || loading}
                    onClick={() => setUsersPage(p => Math.min(totalPages, p + 1))}
                  >Next</button>
                </div>
              );
            })()}
          </div>
        );
      
      case 'orders':
        return (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Orders Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => {
                    const items = order.items || [];
                    const shown = items.slice(0, 3);
                    const extra = Math.max(0, items.length - shown.length);
                    const finalAmount = (order.finalAmount != null)
                      ? order.finalAmount
                      : (Number(order.totalAmount || 0) + Number(order.shippingFee || 0) + Number(order.taxAmount || 0));
                    return (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link
                            to={`/orders/${order._id}?admin=1`}
                            className="text-indigo-600 hover:underline"
                            title="View order details"
                          >
                            #{order._id.slice(-8)}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.userId?.firstName} {order.userId?.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatINR(finalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.orderStatus}
                            </span>
                            <select
                              className="text-xs border rounded px-2 py-1"
                              value={order.orderStatus}
                              onChange={(e)=>dispatch(updateOrderStatusAsync({ orderId: order._id, status: e.target.value }))}
                            >
                              {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s=> (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Orders pagination */}
            {(() => {
              const total = ordersTotal || orders.length || 0;
              const totalPages = Math.max(1, Math.ceil(total / ORDERS_LIMIT));
              if (totalPages <= 1) return null;
              const maxButtons = 6;
              const pagesToShow = Array.from({ length: Math.min(totalPages, maxButtons) }, (_, i) => i + 1);
              return (
                <div className="px-6 py-4 flex items-center justify-center gap-2">
                  <button
                    className="px-3 py-2 border rounded disabled:opacity-50"
                    disabled={ordersPage <= 1 || loading}
                    onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                  >Prev</button>
                  {pagesToShow.map(p => (
                    <button
                      key={p}
                      className={`px-3 py-2 border rounded ${p === ordersPage ? 'bg-indigo-600 text-white' : ''}`}
                      disabled={loading}
                      onClick={() => setOrdersPage(p)}
                    >{p}</button>
                  ))}
                  <button
                    className="px-3 py-2 border rounded disabled:opacity-50"
                    disabled={ordersPage >= totalPages || loading}
                    onClick={() => setOrdersPage(p => Math.min(totalPages, p + 1))}
                  >Next</button>
                </div>
              );
            })()}
          </div>
        );
      
      case 'products':
        return (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Products Management</h3>
                <button
                  onClick={() => setShowAddForm(v=>!v)}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium border ${showAddForm ? 'text-red-600 border-red-300 hover:bg-red-50' : 'text-indigo-700 border-indigo-300 hover:bg-indigo-50'}`}
                >
                  {showAddForm ? 'Close Add Product' : '+ Add Product'}
                </button>
              </div>
            </div>
            {/* Category Summary */}
            <div className="px-6 pt-6">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-900">Categories:</span>
                {(() => {
                  const allowed = ['jewelry','crafts','clothing','textiles'];
                  const counts = allowed.map(name => ({
                    name,
                    displayName: name.charAt(0).toUpperCase() + name.slice(1),
                    count: (products || []).filter(p => (p.category === name)).length
                  }));
                  return counts.map(cat => (
                    <span key={cat.name} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100">
                      <span>{cat.displayName}</span>
                      <span className="text-xs text-gray-500">{cat.count}</span>
                    </span>
                  ));
                })()}
              </div>
            </div>
            {/* Search Bar */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  className="w-full md:w-1/2 border rounded px-3 py-2"
                  placeholder="Search products by name, category, tag, or ID..."
                  value={productSearchQuery}
                  onChange={(e)=>setProductSearchQuery(e.target.value)}
                />
                <span className="text-sm text-gray-500">{filteredProducts.length} / {products.length} shown</span>
              </div>
            </div>
            {/* Add Product Form */}
            {showAddForm && (
              <div className="px-6 pt-6">
                <h4 className="font-medium text-gray-900 mb-3">Add New Product</h4>
                {createError && (
                  <div className="mb-3 text-sm text-red-600">{createError}</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-700">Name</span>
                    <input className="border rounded px-3 py-2" value={newProduct.name} onChange={(e)=>setNewProduct(p=>({...p,name:e.target.value}))}/>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-700">Price (INR)</span>
                    <input className="border rounded px-3 py-2" type="number" min="0" value={newProduct.price} onChange={(e)=>setNewProduct(p=>({...p,price:e.target.value}))}/>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-700">Category</span>
                    <select className="border rounded px-3 py-2" value={newProduct.category} onChange={(e)=>setNewProduct(p=>({...p,category:e.target.value}))}>
                    {[
                      { name: 'jewelry', displayName: 'Jewelry' },
                      { name: 'crafts', displayName: 'Crafts' },
                      { name: 'clothing', displayName: 'Clothing' },
                      { name: 'textiles', displayName: 'Textiles' },
                    ].map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.displayName}</option>
                    ))}
                  </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-700">Stock</span>
                    <input className="border rounded px-3 py-2" type="number" min="0" value={newProduct.stock} onChange={(e)=>setNewProduct(p=>({...p,stock:Number(e.target.value)||0}))}/>
                  </label>
                  <label className="md:col-span-2 flex flex-col gap-1">
                    <span className="text-sm text-gray-700">Description</span>
                    <textarea className="border rounded px-3 py-2" rows={3} value={newProduct.description} onChange={(e)=>setNewProduct(p=>({...p,description:e.target.value}))}/>
                  </label>
                  <label className="md:col-span-2 flex flex-col gap-1">
                    <span className="text-sm text-gray-700">Tags (comma separated)</span>
                    <input className="border rounded px-3 py-2" value={newProduct.tags} onChange={(e)=>setNewProduct(p=>({...p,tags:e.target.value}))}/>
                  </label>
                  <label className="md:col-span-2 flex flex-col gap-1">
                    <span className="text-sm text-gray-700">Images</span>
                    <input className="border rounded px-3 py-2" type="file" accept="image/*" multiple onChange={(e)=>setImageFiles(Array.from(e.target.files||[]))} />
                  </label>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    disabled={creating}
                    onClick={async ()=>{
                      try{
                        setCreating(true); setCreateError('');
                        let images = [];
                        if(imageFiles.length){
                          const fd = new FormData();
                          imageFiles.forEach(f=>fd.append('images', f));
                          const uploadRes = await uploadAPI.uploadProductImages(fd);
                          images = uploadRes?.data?.data?.images || [];
                        }
                        const payload = {
                          name: newProduct.name,
                          description: newProduct.description,
                          price: Number(newProduct.price),
                          category: newProduct.category,
                          stock: Number(newProduct.stock)||0,
                          images,
                          tags: newProduct.tags.split(',').map(t=>t.trim()).filter(Boolean)
                        };
                        await dispatch(createProductAsync(payload)).unwrap();
                        await dispatch(fetchAllProductsAsync({ isActive: 'all', page: productsPage, limit: PRODUCTS_LIMIT })).unwrap();
                        setNewProduct({ name:'', description:'', price:'', category:'jewelry', stock:0, tags:'' });
                        setImageFiles([]);
                        setShowAddForm(false);
                      }catch(err){
                        setCreateError(err?.message || 'Failed to create product');
                      }finally{
                        setCreating(false);
                      }
                    }}
                    className={`px-4 py-2 rounded-md text-white ${creating?'bg-indigo-400':'bg-indigo-600 hover:bg-indigo-700'}`}
                  >{creating?'Creating...':'Create Product'}</button>
                  <button className="px-4 py-2 rounded-md border" onClick={()=>{ setShowAddForm(false); setCreateError(''); }}>Cancel</button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const pid = product._id || product.id;
                    return (
                    <tr key={pid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <img src={getFirstProductImage(product.images)} alt={product.name} className="w-10 h-10 rounded object-cover border" onError={handleImageError} />
                          <div className="flex flex-col">
                            <span className="text-gray-900">{product.name}</span>
                            {product.tags && product.tags.length > 0 && (
                              <span className="text-xs text-gray-500">{product.tags.slice(0,3).join(', ')}{product.tags.length>3?'…':''}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatINR(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                            {product.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            className="text-xs px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
                            onClick={() => dispatch(updateProductAsync({ productId: pid, productData: { isActive: !(product.isActive !== false) } }))}
                          >{product.isActive !== false ? 'Disable' : 'Enable'}</button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Link to={`/products/${pid}`} className="text-indigo-600 hover:underline">View</Link>
                          <button
                            className="text-yellow-600 hover:underline"
                            onClick={() => {
                              setEditingProductId(pid);
                              setEditForm({
                                name: product.name || '',
                                price: Number(product.price) || 0,
                                stock: Number(product.stock) || 0,
                                category: product.category || 'jewelry',
                                isActive: product.isActive !== false
                              });
                              setEditError('');
                              setShowEditModal(true);
                            }}
                          >Edit</button>
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => dispatch(deleteProductAsync(pid))}
                          >Delete</button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
            {/* Edit Product Modal */}
            {editingProduct && showEditModal && (
              <div className="fixed inset-0 z-40 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={()=>{ setShowEditModal(false); setEditingProductId(null); }} />
                <div className="relative z-50 w-full max-w-2xl bg-white rounded-lg shadow-lg">
                  <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h4 className="font-semibold text-gray-900">Edit Product</h4>
                    <button className="text-gray-500 hover:text-gray-700" onClick={()=>{ setShowEditModal(false); setEditingProductId(null); }}>✕</button>
                  </div>
                  <div className="p-6">
                    {editError && <div className="mb-3 text-sm text-red-600">{editError}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex flex-col gap-1">
                        <span className="text-sm text-gray-700">Name</span>
                        <input className="border rounded px-3 py-2" value={editForm.name} onChange={(e)=>setEditForm(f=>({...f,name:e.target.value}))}/>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm text-gray-700">Price (INR)</span>
                        <input className="border rounded px-3 py-2" type="number" min="0" value={editForm.price} onChange={(e)=>setEditForm(f=>({...f,price:Number(e.target.value)||0}))}/>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm text-gray-700">Category</span>
                        <select className="border rounded px-3 py-2" value={editForm.category} onChange={(e)=>setEditForm(f=>({...f,category:e.target.value}))}>
                          <option value="jewelry">Jewelry</option>
                          <option value="crafts">Crafts</option>
                          <option value="clothing">Clothing</option>
                          <option value="textiles">Textiles</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm text-gray-700">Stock</span>
                        <input className="border rounded px-3 py-2" type="number" min="0" value={editForm.stock} onChange={(e)=>setEditForm(f=>({...f,stock:Number(e.target.value)||0}))}/>
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
                        <input type="checkbox" checked={editForm.isActive} onChange={(e)=>setEditForm(f=>({...f,isActive:e.target.checked}))} />
                        Active
                      </label>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t flex items-center gap-2 justify-end">
                    <button className="px-4 py-2 rounded-md border" onClick={()=>{ setShowEditModal(false); setEditingProductId(null); }}>Cancel</button>
                    <button
                      disabled={savingEdit}
                      onClick={async ()=>{
                        try{
                          setSavingEdit(true); setEditError('');
                          const pid = editingProductId;
                          const payload = { ...editForm };
                          await dispatch(updateProductAsync({ productId: pid, productData: payload })).unwrap();
                          setEditingProductId(null);
                          setShowEditModal(false);
                        }catch(err){
                          setEditError(err?.message || 'Failed to update product');
                        }finally{
                          setSavingEdit(false);
                        }
                      }}
                      className={`px-4 py-2 rounded-md text-white ${savingEdit?'bg-indigo-400':'bg-indigo-600 hover:bg-indigo-700'}`}
                    >{savingEdit?'Saving...':'Save Changes'}</button>
                  </div>
                </div>
              </div>
            )}
            {/* Products pagination */}
            {(() => {
              const total = productsTotal || products.length || 0;
              const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_LIMIT));
              if (totalPages <= 1) return null;
              const maxButtons = 6;
              const pagesToShow = Array.from({ length: Math.min(totalPages, maxButtons) }, (_, i) => i + 1);
              return (
                <div className="px-6 py-4 flex items-center justify-center gap-2">
                  <button
                    className="px-3 py-2 border rounded disabled:opacity-50"
                    disabled={productsPage <= 1 || loading}
                    onClick={() => setProductsPage(p => Math.max(1, p - 1))}
                  >Prev</button>
                  {pagesToShow.map(p => (
                    <button
                      key={p}
                      className={`px-3 py-2 border rounded ${p === productsPage ? 'bg-indigo-600 text-white' : ''}`}
                      disabled={loading}
                      onClick={() => setProductsPage(p)}
                    >{p}</button>
                  ))}
                  <button
                    className="px-3 py-2 border rounded disabled:opacity-50"
                    disabled={productsPage >= totalPages || loading}
                    onClick={() => setProductsPage(p => Math.min(totalPages, p + 1))}
                  >Next</button>
                </div>
              );
            })()}
          </div>
        );
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'users'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'orders'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'products'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Products
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPage;