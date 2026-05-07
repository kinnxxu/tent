import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard, { resolveImageUrl } from '../../components/home/ProductCard';
import { Filter, ChevronDown, Search, Grid, List, SlidersHorizontal, Plus, X, Save } from 'lucide-react';
import { isAdmin, getAuthToken } from '../../utils/auth';
import './products.css';

const Products = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const brandParam = queryParams.get('brand');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState(brandParam || 'All');
  const [sortBy, setSortBy] = useState('default');
  const [uploading, setUploading] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [uploadingCatalogue, setUploadingCatalogue] = useState(false);

  // Admin State
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const initialFormData = {
    id: "",
    sku: "",
    name: "",
    slug: "",
    brand: "",
    category: "",
    subcategory: "",
    price: "",
    stock: "",
    description: "",
    image: "",
    images: [],
    features: "",
    specifications: "",
    catalogue: "",
    isActive: true,
    source: {
      itemName: "",
      category: "",
      subCategory: "",
      brand: "",
    },
  };

  const [formData, setFormData] = useState(initialFormData);

  const admin = isAdmin();
  const token = getAuthToken();

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://weekend-production-4177.up.railway.app/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();

      const normalizedData = data.map(p => ({
        ...p,
        specs: p.description ? p.description.substring(0, 60) + '...' : (p.subcategory || p.brand)
      }));
      setProducts(normalizedData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    setUploading(true);
    try {
      const response = await fetch('http://weekend-production-4177.up.railway.app/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData(prev => ({ ...prev, image: data.filePath }));
      alert('Image uploaded successfully!');
    } catch (err) {
      alert('Error uploading image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    setUploadingAdditional(true);
    try {
      const response = await fetch('http://weekend-production-4177.up.railway.app/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData(prev => ({ ...prev, images: [...prev.images, data.filePath] }));
    } catch (err) {
      alert('Error uploading additional image: ' + err.message);
    } finally {
      setUploadingAdditional(false);
    }
  };

  const handleCatalogueUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('catalogue', file);

    setUploadingCatalogue(true);
    try {
      const response = await fetch('http://weekend-production-4177.up.railway.app/api/upload-catalogue', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData(prev => ({ ...prev, catalogue: data.filePath }));
      alert('Catalogue PDF uploaded successfully!');
    } catch (err) {
      alert('Error uploading catalogue: ' + err.message);
    } finally {
      setUploadingCatalogue(false);
    }
  };

  const handleRemoveAdditionalImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("source.")) {
      const sourceField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        source: {
          ...prev.source,
          [sourceField]: value,
        },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowAdminForm(false);
  };

  const preparePayload = () => {
    const payload = { ...formData };
    payload.id = payload.id === "" ? null : Number(payload.id);
    payload.price = payload.price === "" ? null : Number(payload.price);
    payload.stock = payload.stock === "" ? null : Number(payload.stock);

    if (typeof payload.features === 'string') {
      payload.features = payload.features.split('\n').map(s => s.trim()).filter(Boolean);
    }
    if (typeof payload.specifications === 'string') {
      const specs = {};
      payload.specifications.split('\n').forEach(line => {
        const idx = line.indexOf(':');
        if (idx > -1) {
          const key = line.substring(0, idx).trim();
          const val = line.substring(idx + 1).trim();
          if (key) specs[key] = val;
        }
      });
      payload.specifications = specs;
    }
    return payload;
  };

  const handleAddProduct = async () => {
    try {
      const response = await fetch('http://weekend-production-4177.up.railway.app/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preparePayload())
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setFormData({
      id: product.id || "",
      sku: product.sku || "",
      name: product.name || "",
      slug: product.slug || "",
      brand: product.brand || "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      description: product.description || "",
      image: product.image || "",
      images: Array.isArray(product.images) ? product.images : [],
      features: Array.isArray(product.features) ? product.features.join("\n") : (product.features || ""),
      specifications: product.specifications
        ? Object.entries(product.specifications).map(([k, v]) => `${k}: ${v}`).join('\n')
        : "",
      catalogue: product.catalogue || "",
      isActive: product.isActive ?? true,
      source: {
        itemName: product.source?.itemName || "",
        category: product.source?.category || "",
        subCategory: product.source?.subCategory || "",
        brand: product.source?.brand || "",
      },
    });
    setShowAdminForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateProduct = async () => {
    try {
      const response = await fetch(`http://weekend-production-4177.up.railway.app/api/products/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preparePayload()),
      });

      if (!response.ok) throw new Error("Failed to update product");
      resetForm();
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`http://weekend-production-4177.up.railway.app/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete product');
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const categories = ['All', ...new Set(products.map(cat => cat.category).filter(Boolean))];
  const searchParam = queryParams.get('search');

  useEffect(() => {
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParam]);

  const filteredProducts = products
    .filter(p => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch =
        (p.name || "").toLowerCase().includes(searchStr) ||
        (p.sku || "").toLowerCase().includes(searchStr) ||
        (p.category || "").toLowerCase().includes(searchStr) ||
        (p.brand || "").toLowerCase().includes(searchStr);

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
      return matchesSearch && matchesCategory && matchesBrand;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading premium industrial equipment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong.</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-layout">
          <aside className="filters-sidebar">
            <div className="filter-group">
              <h3 className="filter-title">Search</h3>
              <div className="search-wrapper">
                <Search size={18} />
                <input type="text" placeholder="SKU or Product Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="filter-group">
              <h3 className="filter-title">Categories</h3>
              <div className="category-list">
                {categories.map(cat => (
                  <label key={cat} className="category-item">
                    <input type="radio" name="category" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <h3 className="filter-title">Brands</h3>
              <div className="category-list">
                {['All', ...new Set(products.map(p => p.brand).filter(Boolean))].map(brand => (
                  <label key={brand} className="category-item">
                    <input type="radio" name="brand" checked={selectedBrand === brand} onChange={() => setSelectedBrand(brand)} />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <main className="products-main">
            <div className="toolbar">
              <div className="results-count">Showing <span>{filteredProducts.length}</span> products</div>
              <div className="toolbar-actions">
                <div className="sort-wrapper">
                  <SlidersHorizontal size={16} />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="default">Default Sorting</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>

            {admin && (
              <div className="admin-management-section">
                <div className="admin-toolbar">
                  <button className="btn btn-primary add-product-btn" onClick={() => setShowAdminForm(!showAdminForm)}>
                    {showAdminForm ? <X size={18} /> : <Plus size={18} />}
                    {showAdminForm ? 'Close Form' : 'Add New Product'}
                  </button>
                </div>
                {showAdminForm && (
                  <div className="admin-product-form-card">
                    <div className="form-header">
                      <h3>{editingId ? 'Update Product Details' : 'Register New Industrial Product'}</h3>
                      <p>Ensure all specifications match the technical datasheet.</p>
                    </div>
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                      <div className="form-group"><label>Product ID</label><input className="form-input" type="number" name="id" value={formData.id} onChange={handleInputChange} placeholder="Auto-generated if empty" /></div>
                      <div className="form-group"><label>Product Name</label><input className="form-input" name="name" value={formData.name} onChange={handleInputChange} /></div>
                      <div className="form-group"><label>SKU</label><input className="form-input" name="sku" value={formData.sku} onChange={handleInputChange} /></div>
                      <div className="form-group"><label>Slug</label><input className="form-input" name="slug" value={formData.slug} onChange={handleInputChange} /></div>
                      <div className="form-group"><label>Brand</label><input className="form-input" name="brand" value={formData.brand} onChange={handleInputChange} /></div>
                      <div className="form-group"><label>Category</label><input className="form-input" name="category" value={formData.category} onChange={handleInputChange} /></div>
                      <div className="form-group"><label>Subcategory</label><input className="form-input" name="subcategory" value={formData.subcategory} onChange={handleInputChange} /></div>
                      <div className="form-group"><label>Price</label><input className="form-input" type="number" name="price" value={formData.price} onChange={handleInputChange} /></div>
                      <div className="form-group"><label>Stock</label><input className="form-input" type="number" name="stock" value={formData.stock} onChange={handleInputChange} /></div>
                      <div className="form-group">
                        <label>Technical Catalogue (Any Format)</label>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          <div className="form-input" style={{ flex: 1, background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', height: '42px' }}>
                            {formData.catalogue ? formData.catalogue.split('/').pop() : 'No catalogue uploaded'}
                          </div>
                          <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0 15px', whiteSpace: 'nowrap', height: '42px', margin: 0, fontSize: '0.9rem' }}>
                            {uploadingCatalogue ? '...' : 'Upload File'}
                            <input type="file" style={{ display: 'none' }} onChange={handleCatalogueUpload} />
                          </label>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Main Image URL</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <input className="form-input" name="image" value={formData.image} onChange={handleInputChange} style={{ flex: 1 }} />
                          <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0 10px', whiteSpace: 'nowrap', height: '100%', margin: 0 }}>
                            {uploading ? '...' : 'Upload'}
                            <input type="file" style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" />
                          </label>
                        </div>
                      </div>

                      {/* Source Fields */}
                      <div className="form-group"><label>Source Item Name</label><input className="form-input" name="source.itemName" value={formData.source.itemName} onChange={handleInputChange} /></div>
                      <div className="form-group"><label>Source Category</label><input className="form-input" name="source.category" value={formData.source.category} onChange={handleInputChange} /></div>
                      <div className="form-group"><label>Source SubCategory</label><input className="form-input" name="source.subCategory" value={formData.source.subCategory} onChange={handleInputChange} /></div>
                      <div className="form-group"><label>Source Brand</label><input className="form-input" name="source.brand" value={formData.source.brand} onChange={handleInputChange} /></div>

                      <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label>Active Product</label>
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea className="form-input" name="description" value={formData.description} onChange={handleInputChange} rows="4" />
                      </div>
                      <div className="form-group">
                        <label>Additional Images</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                          {formData.images.map((imgUrl, idx) => (
                            <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', background: '#f5f5f5' }}>
                              <img src={resolveImageUrl(imgUrl)} alt="Additional" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button type="button" onClick={(e) => { e.preventDefault(); handleRemoveAdditionalImage(idx); }} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255, 0, 0, 0.8)', color: 'white', border: 'none', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <label className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', padding: '5px 15px', fontSize: '14px' }}>
                          <Plus size={16} style={{ marginRight: '5px' }} />
                          {uploadingAdditional ? 'Uploading...' : 'Upload Image'}
                          <input type="file" style={{ display: 'none' }} onChange={handleAdditionalImageUpload} accept="image/*" />
                        </label>
                      </div>
                      <div className="form-group">
                        <label>Features (One per line)</label>
                        <textarea className="form-input" name="features" value={formData.features} onChange={handleInputChange} rows="4" placeholder="Feature 1&#10;Feature 2" />
                      </div>
                      <div className="form-group">
                        <label>Specifications (Key: Value per line)</label>
                        <textarea className="form-input" name="specifications" value={formData.specifications} onChange={handleInputChange} rows="4" placeholder="Weight: 1.9 kg&#10;Material: Cast Iron" />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="btn btn-outline" onClick={resetForm}>Cancel</button>
                      <button className="btn btn-primary" onClick={editingId ? handleUpdateProduct : handleAddProduct}>
                        {editingId ? 'Apply Changes' : 'Create Product Entry'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="products-grid-page">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} isAdmin={admin} onEdit={handleEditClick} onDelete={handleDeleteProduct} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
