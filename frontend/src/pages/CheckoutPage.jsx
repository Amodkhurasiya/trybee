import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchCart,
  clearCartAsync,
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalAmount,
  selectCartLoading,
} from '../store/cartSlice';
import { selectIsAuthenticated, selectUser } from '../store/authSlice';
import { createOrderAsync, selectOrderLoading } from '../store/orderSlice';
import { showSuccessToast, showErrorToast } from '../store/toastSlice';
import { getProductImageUrl } from '../utils/imageUtils';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const cartItems = useSelector(selectCartItems);
  const totalItems = useSelector(selectCartTotalItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const cartLoading = useSelector(selectCartLoading);
  const orderLoading = useSelector(selectOrderLoading);

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Calculate totals
  const subtotal = totalAmount;
  const shippingFee = subtotal > 500 ? 0 : 50;
  const taxAmount = Math.round(subtotal * 0.1); // 10% tax
  const finalTotal = subtotal + shippingFee + taxAmount;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent('/checkout'));
    }
  }, [isAuthenticated, navigate, dispatch, cartItems.length]);

  useEffect(() => {
    // If cart is empty after loading, redirect to cart page
    if (!cartLoading && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartLoading, cartItems.length, navigate]);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.email.trim()) newErrors.email = 'Email is required';
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
    if (!shippingInfo.state.trim()) newErrors.state = 'State is required';
    if (!shippingInfo.postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (shippingInfo.email && !emailRegex.test(shippingInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation - accept 10-digit or +91 with optional spaces
    const phoneRaw = shippingInfo.phone.trim();
    const phoneNormalized = phoneRaw.replace(/[^\d]/g, ''); // keep digits
    const isValidPhone = (
      // 10 digits
      /^[6-9]\d{9}$/.test(phoneNormalized) ||
      // 12 digits with 91 country code -> must start with 91 then 10 digits starting 6-9
      /^(?:91)([6-9]\d{9})$/.test(phoneNormalized)
    );
    if (phoneRaw && !isValidPhone) {
      newErrors.phone = 'Enter 10-digit or +91 format phone number';
    }

    // Postal code validation
    const postalCodeRegex = /^[1-9][0-9]{5}$/;
    if (shippingInfo.postalCode && !postalCodeRegex.test(shippingInfo.postalCode)) {
      newErrors.postalCode = 'Please enter a valid 6-digit postal code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      dispatch(showErrorToast('Please fix the errors in the form'));
      return;
    }

    if (cartItems.length === 0) {
      dispatch(showErrorToast('Your cart is empty'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Normalize phone to 10 digits for backend
      const phoneRaw = shippingInfo.phone.trim();
      const digits = phoneRaw.replace(/[^\d]/g, '');
      const normalizedPhone = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;

      const orderData = {
        shippingAddress: {
          title: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.postalCode,
          country: shippingInfo.country,
          phone: normalizedPhone
        },
        paymentMethod,
        notes: notes.trim()
      };

      const result = await dispatch(createOrderAsync(orderData));
      
      if (result.type === 'orders/createOrder/fulfilled') {
        // Clear cart after successful order
        await dispatch(clearCartAsync());
        
        dispatch(showSuccessToast('Order placed successfully!'));
        
        // Redirect to order confirmation or orders page
        navigate(`/orders/${result.payload.data._id}`, { 
          state: { orderPlaced: true } 
        });
      } else {
        throw new Error(result.payload || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      dispatch(showErrorToast(error.message || 'Failed to place order. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null; // Will redirect to cart
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Complete your order details below</p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-8">
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g. 9876543210 or +91 98765 43210"
                      inputMode="tel"
                      maxLength={16}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="mt-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full address with landmarks"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter state"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter 6-digit postal code"
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
                
                <div className="space-y-4">
                  {/* Cash on Delivery */}
                  <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="cod" className="ml-3 flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Cash on Delivery</p>
                          <p className="text-sm text-gray-500">Pay when your order is delivered</p>
                        </div>
                        <div className="text-green-600 font-medium">Free</div>
                      </div>
                    </label>
                  </div>

                  {/* UPI (Coming Soon) */}
                  <div className="flex items-center p-4 border border-gray-200 rounded-lg opacity-50">
                    <input
                      type="radio"
                      id="upi"
                      name="paymentMethod"
                      value="upi"
                      disabled
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="upi" className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">UPI Payment</p>
                          <p className="text-sm text-gray-500">Pay using UPI (Coming Soon)</p>
                        </div>
                        <div className="text-gray-400 text-sm">Coming Soon</div>
                      </div>
                    </label>
                  </div>

                  {/* Credit/Debit Card (Coming Soon) */}
                  <div className="flex items-center p-4 border border-gray-200 rounded-lg opacity-50">
                    <input
                      type="radio"
                      id="card"
                      name="paymentMethod"
                      value="card"
                      disabled
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="card" className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Credit/Debit Card</p>
                          <p className="text-sm text-gray-500">Pay using your card (Coming Soon)</p>
                        </div>
                        <div className="text-gray-400 text-sm">Coming Soon</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Notes (Optional)</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add any special instructions for your order..."
                />
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.productId._id} className="flex items-center space-x-3">
                    <img
                      src={getProductImageUrl(item.productId.images?.[0])}
                      alt={item.productId.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.productId.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × ₹{item.productId.price}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{(item.productId.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className={`font-medium ${shippingFee === 0 ? 'text-green-600' : ''}`}>
                    {shippingFee === 0 ? 'Free' : `₹${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || orderLoading}
                className="w-full mt-6 bg-[#ebb665] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#d2a45b] focus:ring-2 focus:ring-[#ebb665] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting || orderLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Order...
                  </div>
                ) : (
                  `Place Order - ₹${finalTotal.toFixed(2)}`
                )}
              </button>
              
              <p className="mt-4 text-xs text-gray-500 text-center">
                By placing your order, you agree to our Terms & Conditions and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
