import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

const OrderList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get('payment') || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchOrders();
  }, [debouncedSearch, status, paymentStatus, startDate, endDate, pagination.page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/orders', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch,
          status,
          paymentStatus,
          startDate,
          endDate
        }
      });
      
      setOrders(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
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

  const exportOrders = async () => {
    try {
      toast.loading('Generating export...');
      // In production, this would call an export endpoint
      const csvContent = orders.map(order => 
        `${order.order_number},${order.customer_email},${order.total},${order.status},${order.payment_status},${order.created_at}`
      ).join('\n');
      
      const header = 'Order Number,Email,Total,Status,Payment,Date\n';
      const blob = new Blob([header + csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      
      toast.dismiss();
      toast.success('Export downloaded');
    } catch (error) {
      toast.dismiss();
      toast.error('Export failed');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setPaymentStatus('');
    setStartDate('');
    setEndDate('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-800 font-heading">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchOrders} className="btn btn-outline btn-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button onClick={exportOrders} className="btn btn-outline btn-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order #, email, name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          {/* Order Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          
          {/* Payment Status */}
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="input"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          
          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
              placeholder="Start date"
            />
          </div>
        </div>

        {/* Active Filters */}
        {(status || paymentStatus || startDate || endDate || search) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">Active filters:</span>
            {search && (
              <span className="badge badge-info">Search: {search}</span>
            )}
            {status && (
              <span className="badge badge-info">{status}</span>
            )}
            {paymentStatus && (
              <span className="badge badge-info">{paymentStatus}</span>
            )}
            {startDate && (
              <span className="badge badge-info">From: {startDate}</span>
            )}
            <button 
              onClick={clearFilters}
              className="text-sm text-primary-500 hover:text-primary-600 ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th className="w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td>
                      <Link 
                        to={`/orders/${order.id}`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td>
                      <div>
                        <p className="text-gray-800">
                          {order.customer_first_name} {order.customer_last_name}
                        </p>
                        <p className="text-xs text-gray-500">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-gray">{order.item_count || 0}</span>
                    </td>
                    <td className="font-medium">{formatCurrency(order.total)}</td>
                    <td>
                      <span className={getStatusBadge(order.status)}>
                        {order.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={getPaymentBadge(order.payment_status)}>
                        {order.payment_status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-gray-500 text-sm">
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                      <br />
                      <span className="text-xs">{format(new Date(order.created_at), 'h:mm a')}</span>
                    </td>
                    <td>
                      <Link 
                        to={`/orders/${order.id}`}
                        className="p-2 hover:bg-gray-100 rounded-lg inline-flex"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn btn-sm btn-outline"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="btn btn-sm btn-outline"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
