import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  GripVertical
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    salePrice: '',
    costPrice: '',
    categoryId: '',
    brand: '',
    material: '',
    dimensions: '',
    weight: '',
    color: '',
    stockQuantity: 0,
    lowStockThreshold: 5,
    status: 'draft',
    isFeatured: false,
    isNew: false,
    isSale: false,
    actionType: 'add_to_cart',
    metaTitle: '',
    metaDescription: '',
    tags: ''
  });
  
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/products/${id}`);
      const product = response.data.data;
      
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.short_description || '',
        price: product.price || '',
        salePrice: product.sale_price || '',
        costPrice: product.cost_price || '',
        categoryId: product.category_id || '',
        brand: product.brand || '',
        material: product.material || '',
        dimensions: product.dimensions || '',
        weight: product.weight || '',
        color: product.color || '',
        stockQuantity: product.stock_quantity || 0,
        lowStockThreshold: product.low_stock_threshold || 5,
        status: product.status || 'draft',
        isFeatured: product.is_featured || false,
        isNew: product.is_new || false,
        isSale: product.is_sale || false,
        actionType: product.action_type || 'add_to_cart',
        metaTitle: product.meta_title || '',
        metaDescription: product.meta_description || '',
        tags: product.tags || ''
      });
      
      if (product.images) {
        setImages(product.images.map(img => ({
          id: img.id,
          url: img.image_url,
          alt: img.alt_text,
          isPrimary: img.is_primary
        })));
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (acceptedFiles) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('images', file);
      });
      formData.append('folder', 'products');
      
      const response = await api.post('/admin/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const uploadedImages = response.data.data.map((img, index) => ({
        url: img.url,
        alt: img.originalName,
        isPrimary: images.length === 0 && index === 0
      }));
      
      setImages(prev => [...prev, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index) => {
    const imageToRemove = images[index];
    
    try {
      if (imageToRemove.url.startsWith('/uploads/')) {
        await api.delete('/admin/upload/image', { data: { url: imageToRemove.url } });
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
    
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: i === index
    })));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleImageUpload,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 10 * 1024 * 1024
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.name || !formData.price) {
      toast.error('Please fill in required fields (SKU, Name, Price)');
      return;
    }
    
    setSaving(true);
    
    try {
      const payload = {
        ...formData,
        images: images.map((img, index) => ({
          url: img.url,
          alt: img.alt || formData.name,
          isPrimary: img.isPrimary || index === 0
        }))
      };
      
      if (isEdit) {
        await api.put(`/admin/products/${id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created successfully');
      }
      
      navigate('/products');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-semibold text-gray-800 font-heading">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isEdit ? `Editing ${formData.name}` : 'Create a new product listing'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              {isEdit ? 'Update Product' : 'Create Product'}
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card p-6">
              <h2 className="text-lg font-heading font-semibold text-gray-800 mb-4 font-heading">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">SKU <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="input"
                    placeholder="RBG-XXXX"
                    required
                  />
                </div>
                <div>
                  <label className="label">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="input"
                    placeholder="Brand name"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="label">Product Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div className="mt-4">
                <label className="label">Short Description</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  className="input"
                  placeholder="Brief product description"
                  maxLength={500}
                />
              </div>
              
              <div className="mt-4">
                <label className="label">Full Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input min-h-[120px]"
                  placeholder="Detailed product description..."
                  rows={5}
                />
              </div>
            </div>

            {/* Images */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Product Images</h2>
              
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-1">
                  {isDragActive ? 'Drop images here...' : 'Drag & drop images here, or click to select'}
                </p>
                <p className="text-sm text-gray-400">PNG, JPG, WebP up to 10MB</p>
              </div>
              
              {uploading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-primary-500">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </div>
              )}
              
              {images.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div 
                      key={index} 
                      className={`relative group rounded-lg overflow-hidden border-2 ${
                        image.isPrimary ? 'border-primary-500' : 'border-transparent'
                      }`}
                    >
                      <img 
                        src={image.url} 
                        alt={image.alt || 'Product'} 
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100"
                          title="Set as primary"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 bg-white rounded-lg hover:bg-red-50"
                          title="Remove"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      {image.isPrimary && (
                        <span className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Pricing</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Regular Price <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="input pl-8"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Sale Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleChange}
                      className="input pl-8"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Cost Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      className="input pl-8"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Inventory</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Stock Quantity</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    className="input"
                    min="0"
                  />
                </div>
                <div>
                  <label className="label">Low Stock Threshold</label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                    className="input"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Attributes</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Material</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., Cotton, Ceramic"
                  />
                </div>
                <div>
                  <label className="label">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., Red, Blue"
                  />
                </div>
                <div>
                  <label className="label">Dimensions</label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., 10 x 5 x 3 inches"
                  />
                </div>
                <div>
                  <label className="label">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., 2 lbs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Status */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Status</h2>
              
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
              
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Featured Product</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={formData.isNew}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Mark as New</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isSale"
                    checked={formData.isSale}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">On Sale</span>
                </label>
              </div>
            </div>

            {/* Category */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Category</h2>
              
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Action Type */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Product Action</h2>
              
              <select
                name="actionType"
                value={formData.actionType}
                onChange={handleChange}
                className="input"
              >
                <option value="add_to_cart">Add to Cart</option>
                <option value="make_inquiry">Make an Inquiry</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                "Add to Cart" for regular products. "Make an Inquiry" for custom/wholesale items.
              </p>
            </div>

            {/* Tags */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 font-heading">Tags</h2>
              
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="input"
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-gray-500 mt-2">Separate tags with commas</p>
            </div>

            {/* SEO */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 font-heading">SEO</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Meta Title</label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    className="input"
                    placeholder="SEO title"
                    maxLength={70}
                  />
                </div>
                <div>
                  <label className="label">Meta Description</label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    className="input"
                    placeholder="SEO description"
                    rows={3}
                    maxLength={160}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
