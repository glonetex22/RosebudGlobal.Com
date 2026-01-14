import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import OrderList from './pages/Orders/OrderList';
import OrderDetail from './pages/Orders/OrderDetail';
import InquiryList from './pages/Inquiries/InquiryList';
import InquiryDetail from './pages/Inquiries/InquiryDetail';
import CategoryList from './pages/Categories/CategoryList';
import CustomerList from './pages/Customers/CustomerList';
import CustomerDetail from './pages/Customers/CustomerDetail';
import Settings from './pages/Settings/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Products */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        
        {/* Orders */}
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        
        {/* Inquiries */}
        <Route path="inquiries" element={<InquiryList />} />
        <Route path="inquiries/:id" element={<InquiryDetail />} />
        
        {/* Categories */}
        <Route path="categories" element={<CategoryList />} />
        
        {/* Customers */}
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        
        {/* Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
