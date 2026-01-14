import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../services/api';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, change, changeType, color, link }) => (
  <div className="card p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            changeType === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {link && (
      <Link to={link} className="flex items-center gap-1 mt-4 text-sm text-primary-500 hover:text-primary-600">
        View all <ArrowRight className="w-4 h-4" />
      </Link>
    )}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, salesRes, productsRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/dashboard/recent-orders'),
        api.get('/admin/dashboard/sales-chart'),
        api.get('/admin/dashboard/top-products')
      ]);

      setStats(statsRes.data.data);
      setRecentOrders(ordersRes.data.data || []);
      setSalesData(salesRes.data.data || []);
      setTopProducts(productsRes.data.data || []);
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      processing: 'badge-info',
      shipped: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-danger',
      refunded: 'badge-gray'
    };
    return `badge ${styles[status] || 'badge-gray'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Total Products"
          value={stats?.products?.total || 0}
          icon={Package}
          color="bg-primary-500"
          link="/products"
        />
        <StatCard
          title="Total Orders"
          value={stats?.orders?.total || 0}
          icon={ShoppingCart}
          change={`${stats?.orders?.this_week || 0} this week`}
          changeType="up"
          color="bg-secondary-500"
          link="/orders"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.revenue?.monthly_revenue)}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Total Customers"
          value={stats?.customers?.total || 0}
          icon={Users}
          color="bg-purple-500"
          link="/customers"
        />
        <StatCard
          title="New Inquiries"
          value={stats?.inquiries?.new_inquiries || 0}
          icon={MessageSquare}
          color="bg-orange-500"
          link="/inquiries"
        />
        <StatCard
          title="Low Stock"
          value={stats?.lowStock || 0}
          icon={AlertTriangle}
          color="bg-red-500"
          link="/products?status=low_stock"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-heading font-semibold text-gray-800 mb-4 font-heading">Sales Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D63585" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D63585" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#D63585" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-semibold text-gray-800 font-heading">Top Products</h3>
            <Link to="/products" className="text-sm text-primary-500 hover:text-primary-600">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-400 w-6">{index + 1}</span>
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{product.total_sold} sold</p>
                  <p className="text-xs text-gray-500">{formatCurrency(product.total_revenue)}</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-center text-gray-500 py-8">No sales data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-heading font-semibold text-gray-800 font-heading">Recent Orders</h3>
          <Link to="/orders" className="text-sm text-primary-500 hover:text-primary-600">
            View all
          </Link>
        </div>
        <div className="table-container border-0">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium">{order.order_number}</td>
                  <td>
                    <div>
                      <p className="text-gray-800">{order.customer_first_name} {order.customer_last_name}</p>
                      <p className="text-xs text-gray-500">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="font-medium">{formatCurrency(order.total)}</td>
                  <td>
                    <span className={getStatusBadge(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadge(order.payment_status)}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="text-gray-500">
                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <Link 
                      to={`/orders/${order.id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg inline-flex"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </Link>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
