import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [categories, setCategories] = useState([]);
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, status, category, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/products', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch,
          status,
          category
        }
      });
      
      setProducts(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
    setShowDeleteModal(false);
    setDeleteProductId(null);
  };

  const handleBulkAction = async (action) => {
    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }

    try {
      await api.post('/admin/products/bulk-action', {
        action,
        productIds: selectedProducts
      });
      toast.success(`Bulk ${action} completed`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      toast.error(`Bulk ${action} failed`);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/products/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'badge-success',
      draft: 'badge-gray',
      out_of_stock: 'badge-warning',
      discontinued: 'badge-danger'
    };
    return `badge ${styles[status] || 'badge-gray'}`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-800 font-heading">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your product catalog</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input w-full md:w-48"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
          
          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input w-full md:w-48"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">{selectedProducts.length} selected</span>
            <button 
              onClick={() => handleBulkAction('activate')}
              className="btn btn-sm btn-outline"
            >
              Activate
            </button>
            <button 
              onClick={() => handleBulkAction('deactivate')}
              className="btn btn-sm btn-outline"
            >
              Deactivate
            </button>
            <button 
              onClick={() => handleBulkAction('delete')}
              className="btn btn-sm btn-danger"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No products found</p>
                    <Link to="/products/new" className="btn btn-primary btn-sm mt-4">
                      Add your first product
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.primary_image ? (
                            <img 
                              src={product.primary_image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 truncate">{product.brand || 'No brand'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{product.sku}</td>
                    <td>{product.category_name || '-'}</td>
                    <td>
                      <div>
                        <p className="font-medium">{formatCurrency(product.price)}</p>
                        {product.sale_price && (
                          <p className="text-xs text-green-600">{formatCurrency(product.sale_price)} sale</p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`font-medium ${
                        product.stock_quantity <= product.low_stock_threshold 
                          ? 'text-red-600' 
                          : 'text-gray-800'
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadge(product.status)}>
                        {product.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link 
                          to={`/products/${product.id}/edit`}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </Link>
                        <button
                          onClick={() => {
                            setDeleteProductId(product.id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
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
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 font-heading">Delete Product</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteProductId)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
