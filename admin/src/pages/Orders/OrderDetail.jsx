import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Edit,
  Send,
  RefreshCw,
  Printer,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  
  // Form states
  const [newStatus, setNewStatus] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/orders/${id}`);
      setOrder(response.data.data);
      setAdminNotes(response.data.data.admin_notes || '');
      setNewStatus(response.data.data.status);
      setTrackingNumber(response.data.data.tracking_number || '');
      setTrackingUrl(response.data.data.tracking_url || '');
      setShippingMethod(response.data.data.shipping_method || '');
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${id}/status`, {
        status: newStatus,
        notifyCustomer
      });
      toast.success('Order status updated');
      setShowStatusModal(false);
      fetchOrder();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const updateTracking = async () => {
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${id}/tracking`, {
        trackingNumber,
        trackingUrl,
        shippingMethod,
        notifyCustomer
      });
      toast.success('Tracking information updated');
      setShowTrackingModal(false);
      fetchOrder();
    } catch (error) {
      toast.error('Failed to update tracking');
    } finally {
      setUpdating(false);
    }
  };

  const saveNotes = async () => {
    try {
      await api.put(`/admin/orders/${id}/notes`, { adminNotes });
      toast.success('Notes saved');
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const processRefund = async () => {
    setUpdating(true);
    try {
      await api.post(`/admin/orders/${id}/refund`, {
        amount: parseFloat(refundAmount),
        reason: refundReason
      });
      toast.success('Refund processed');
      setShowRefundModal(false);
      fetchOrder();
    } catch (error) {
      toast.error('Failed to process refund');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return `badge ${styles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getPaymentBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      partially_refunded: 'bg-orange-100 text-orange-800'
    };
    return `badge ${styles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Link to="/orders" className="btn btn-primary mt-4">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-heading font-semibold text-gray-800 font-heading">{order.order_number}</h1>
              <span className={getStatusBadge(order.status)}>
                {order.status?.replace('_', ' ')}
              </span>
              <span className={getPaymentBadge(order.payment_status)}>
                {order.payment_status?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {format(new Date(order.created_at), 'MMMM d, yyyy')} at {format(new Date(order.created_at), 'h:mm a')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-outline btn-sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button 
            onClick={() => setShowStatusModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Update Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 font-heading">
                <Package className="w-5 h-5" />
                Order Items ({order.items?.length || 0})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items?.map((item, index) => (
                <div key={index} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product_image ? (
                      <img 
                        src={item.product_image} 
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{item.product_name}</p>
                    <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">{formatCurrency(item.subtotal)}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Totals */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-800">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-800">{formatCurrency(order.shipping_cost)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount {order.discount_code && `(${order.discount_code})`}</span>
                    <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-800">{formatCurrency(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                  <span className="text-gray-800">Total</span>
                  <span className="text-gray-800">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Tracking */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 font-heading">
                <Truck className="w-5 h-5" />
                Shipping & Tracking
              </h2>
              <button 
                onClick={() => setShowTrackingModal(true)}
                className="btn btn-outline btn-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Update Tracking
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Shipping Method</p>
                <p className="text-gray-800">{order.shipping_method || 'Standard Shipping'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                {order.tracking_number ? (
                  <div className="flex items-center gap-2">
                    <p className="text-gray-800 font-mono">{order.tracking_number}</p>
                    {order.tracking_url && (
                      <a 
                        href={order.tracking_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-600"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400">Not available</p>
                )}
              </div>
              {order.shipped_at && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Shipped Date</p>
                  <p className="text-gray-800">{format(new Date(order.shipped_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
              )}
              {order.delivered_at && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Delivered Date</p>
                  <p className="text-gray-800">{format(new Date(order.delivered_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Admin Notes</h2>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Add internal notes about this order..."
              rows={4}
            />
            <button 
              onClick={saveNotes}
              className="btn btn-outline btn-sm mt-3"
            >
              Save Notes
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4 font-heading">
              <User className="w-5 h-5" />
              Customer
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {order.customer_first_name?.[0]}{order.customer_last_name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {order.customer_first_name} {order.customer_last_name}
                  </p>
                  {order.customer_id && (
                    <Link to={`/customers/${order.customer_id}`} className="text-xs text-primary-500">
                      View profile
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                {order.customer_email}
              </div>
              {order.customer_phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {order.customer_phone}
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4 font-heading">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">
                {order.shipping_first_name} {order.shipping_last_name}
              </p>
              {order.shipping_company && <p>{order.shipping_company}</p>}
              <p>{order.shipping_street}</p>
              {order.shipping_apartment && <p>{order.shipping_apartment}</p>}
              <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
              <p>{order.shipping_country}</p>
              {order.shipping_phone && <p>{order.shipping_phone}</p>}
            </div>
          </div>

          {/* Billing Address */}
          {!order.billing_same_as_shipping && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4 font-heading">
                <CreditCard className="w-5 h-5" />
                Billing Address
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-800">
                  {order.billing_first_name} {order.billing_last_name}
                </p>
                {order.billing_company && <p>{order.billing_company}</p>}
                <p>{order.billing_street}</p>
                {order.billing_apartment && <p>{order.billing_apartment}</p>}
                <p>{order.billing_city}, {order.billing_state} {order.billing_zip}</p>
                <p>{order.billing_country}</p>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4 font-heading">
              <CreditCard className="w-5 h-5" />
              Payment
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="text-gray-800 capitalize">{order.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={getPaymentBadge(order.payment_status)}>
                  {order.payment_status?.replace('_', ' ')}
                </span>
              </div>
              {order.payment_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="text-gray-800 font-mono text-xs">{order.payment_id}</span>
                </div>
              )}
            </div>
            
            {order.payment_status === 'paid' && (
              <button 
                onClick={() => {
                  setRefundAmount(order.total.toString());
                  setShowRefundModal(true);
                }}
                className="btn btn-outline btn-sm w-full mt-4 text-red-600 border-red-300 hover:bg-red-50"
              >
                Process Refund
              </button>
            )}
          </div>

          {/* Customer Notes */}
          {order.customer_notes && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 font-heading">Customer Notes</h2>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {order.customer_notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Update Order Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyCustomer}
                  onChange={(e) => setNotifyCustomer(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Notify customer via email</span>
              </label>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowStatusModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={updateOrderStatus}
                disabled={updating}
                className="btn btn-primary"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Update Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Update Tracking Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Shipping Method</label>
                <input
                  type="text"
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="input"
                  placeholder="e.g., UPS Ground, FedEx Express"
                />
              </div>
              <div>
                <label className="label">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="input"
                  placeholder="Enter tracking number"
                />
              </div>
              <div>
                <label className="label">Tracking URL (Optional)</label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="input"
                  placeholder="https://..."
                />
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyCustomer}
                  onChange={(e) => setNotifyCustomer(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Notify customer via email</span>
              </label>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowTrackingModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={updateTracking}
                disabled={updating}
                className="btn btn-primary"
              >
                {updating ? 'Saving...' : 'Save Tracking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Process Refund</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Refund Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="input pl-8"
                    step="0.01"
                    min="0"
                    max={order.total}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Max: {formatCurrency(order.total)}</p>
              </div>
              <div>
                <label className="label">Reason</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="input"
                  placeholder="Reason for refund..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowRefundModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={processRefund}
                disabled={updating || !refundAmount}
                className="btn btn-danger"
              >
                {updating ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
