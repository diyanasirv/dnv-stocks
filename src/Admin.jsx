import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [customStatusInput, setCustomStatusInput] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  // Products State
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    image: ''
  });
  const [imageFile, setImageFile] = useState(null); // NEW: State for file upload
  const [editingProductId, setEditingProductId] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  // Reviews are managed via server-side import; Admin UI no longer accepts pasted reviews.

  const STATUS_OPTIONS = ['Order placed', 'Order confirmed', 'Item Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  // --- FETCH DATA ---
  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setOrders(data || []);
    setLoadingOrders(false);
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setProducts(data || []);
    setLoadingProducts(false);
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // --- ORDER STATUS UPDATES ---
  const updateStatus = async (orderId, newStatus) => {
    const formattedStatus = newStatus ? newStatus.trim() : '';
    if (!formattedStatus) return alert('Status cannot be empty.');

    setUpdatingId(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ order_status: formattedStatus })
      .eq('order_id', orderId);

    if (error) {
      alert('Failed to update status: ' + error.message);
    } else {
      setOrders((prev) =>
        prev.map((order) =>
          order.order_id === orderId ? { ...order, order_status: formattedStatus } : order
        )
      );
      setCustomStatusInput((prev) => ({ ...prev, [orderId]: '' }));
    }
    setUpdatingId(null);
  };

  // --- IMAGE UPLOAD HELPER ---
  const uploadImageToStorage = async (file) => {
    const fileExt = file.name.split('.').pop();
    // Add random string to filename to prevent overwriting images with the same name
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // --- PRODUCT MANAGEMENT ---
  const handleProductInputChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      alert('Please fill product name and price.');
      return;
    }

    setSavingProduct(true);

    try {
      let imageUrl = productForm.image;

      // If user selected a new file, upload it first
      if (imageFile) {
        imageUrl = await uploadImageToStorage(imageFile);
      }

      if (editingProductId) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: productForm.name,
            price: parseFloat(productForm.price),
            description: productForm.description,
            image: imageUrl || 'https://via.placeholder.com/300'
          })
          .eq('id', editingProductId);

        if (error) throw error;
        alert('Product updated successfully!');
        // Save reviews for this product if provided: upsert to Supabase
        try {
          const parsed = parseReviewsInput(reviewsInput);
          if (parsed.length) {
            const { error: upsertErr } = await supabase.from('product_reviews').upsert([{ product_id: editingProductId, reviews: parsed }], { returning: 'minimal' });
            if (upsertErr) throw upsertErr;
          }
        } catch (err) {
          alert('Failed to save reviews to server: ' + (err.message || err));
        }
      } else {
        // Add new product
        const { data: insertedData, error } = await supabase.from('products').insert([
          {
            name: productForm.name,
            price: parseFloat(productForm.price),
            description: productForm.description,
            image: imageUrl || 'https://via.placeholder.com/300'
          }
        ]).select();

        if (error) throw error;
        // insertedData may be an array — get the first inserted row id
        const newId = Array.isArray(insertedData) && insertedData[0] ? insertedData[0].id : (insertedData?.id || null);
        // Save reviews for the newly created product if provided: upsert to Supabase
        try {
          const parsed = parseReviewsInput(reviewsInput);
          if (parsed.length && newId) {
            const { error: upsertErr } = await supabase.from('product_reviews').upsert([{ product_id: newId, reviews: parsed }], { returning: 'minimal' });
            if (upsertErr) throw upsertErr;
          }
        } catch (err) {
          alert('Failed to save reviews to server: ' + (err.message || err));
        }
        alert('Product added successfully!');
      }

      // Reset form
      setEditingProductId(null);
      setImageFile(null);
      setProductForm({ name: '', price: '', description: '', image: '' });
      fetchProducts();
    } catch (err) {
      alert('Error saving product: ' + err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleEditProductClick = (prod) => {
    setEditingProductId(prod.id);
    setImageFile(null); // Reset any un-uploaded file
    setProductForm({
      name: prod.name,
      price: prod.price,
      description: prod.description || '',
      image: prod.image || ''
    });
    // Reviews are managed via server-side import; no client-side reviews textarea is shown.
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      alert('Failed to delete product: ' + error.message);
    } else {
      fetchProducts();
    }
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setImageFile(null);
    setProductForm({ name: '', price: '', description: '', image: '' });
  };

  // --- Reviews helper (parser used by product create/update) ---

  const parseReviewsInput = (text) => {
    const out = [];
    const trimmed = text.trim();
    if (!trimmed) return out;

    // Try JSON first (accept and attempt to clean common malformations)
    try {
      // attempt parse as-is first
      let parsed = null;
      try {
        parsed = JSON.parse(trimmed);
      } catch (jerr) {
        // try a cleaned-up version: remove trailing commas and fix unmatched braces/brackets
        let cleaned = trimmed.replace(/,(\s*[\]\}])/g, '$1');
        const openBraces = (cleaned.match(/{/g) || []).length;
        const closeBraces = (cleaned.match(/}/g) || []).length;
        const openBrackets = (cleaned.match(/\[/g) || []).length;
        const closeBrackets = (cleaned.match(/\]/g) || []).length;
        if (openBraces > closeBraces) {
          const missing = openBraces - closeBraces;
          const insertPos = cleaned.lastIndexOf(']') !== -1 ? cleaned.lastIndexOf(']') : cleaned.length;
          cleaned = cleaned.slice(0, insertPos) + '}'.repeat(missing) + cleaned.slice(insertPos);
        }
        if (openBrackets > closeBrackets) {
          const missing = openBrackets - closeBrackets;
          cleaned = cleaned + ']'.repeat(missing);
        }

        try {
          parsed = JSON.parse(cleaned);
        } catch (e) {
          parsed = null;
        }
      }

      if (Array.isArray(parsed)) {
        parsed.forEach((r, i) => {
          if (r && (r.name || r.comment || r.review || r.author || r.customer_name || r.text || r.body)) {
            let name = (r.name || r.fullName || r.full_name || r.author || r.reviewer || r.customer_name || r.customer || r.username || r.title || '').toString().trim();
            const rating = Number(r.rating ?? r.rate ?? r.stars ?? r.score) || 5;
            const comment = (r.comment || r.review || r.text || r.body || '').toString().trim();
            const date = (r.date || r.created_at || r.time || '').toString().trim();
            // ensure name is not empty: fallback to comment excerpt
            if (!name) {
              const excerpt = comment ? (comment.substring(0, 24) + (comment.length > 24 ? '...' : '')) : '';
              name = excerpt || 'Anonymous';
            }
            const id = r.id || `${Date.now()}-${i}`;
            out.push({ id, name, rating, comment, date });
          }
        });
        return out;
      }
    } catch (e) {
      // not JSON
    }

    const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    lines.forEach((line, idx) => {
      let parts = null;
      if (line.includes('|')) parts = line.split('|');
      else if (line.includes(',')) parts = line.split(',');
      else if (line.includes('\t')) parts = line.split('\t');
      else parts = line.split(/\s{2,}/); // split on two+ spaces

      if (parts.length >= 4) {
        let name = parts[0].trim();
        const rating = Number(parts[1].trim()) || 5;
        const comment = parts[2].trim();
        const date = parts.slice(3).join('|').trim();
        if (!name) {
          const excerpt = comment ? (comment.substring(0, 24) + (comment.length > 24 ? '...' : '')) : '';
          name = excerpt || 'Anonymous';
        }
        out.push({ id: `${Date.now()}-${idx}`, name, rating, comment, date });
      } else if (parts.length === 3) {
        let [name, ratingOrComment, maybeDate] = parts.map(p => p.trim());
        const rating = Number(ratingOrComment) || 5;
        const comment = maybeDate || '';
        if (!name) {
          const excerpt = comment ? (comment.substring(0, 24) + (comment.length > 24 ? '...' : '')) : '';
          name = excerpt || 'Anonymous';
        }
        out.push({ id: `${Date.now()}-${idx}`, name, rating, comment, date: '' });
      } else {
        // fallback: try to extract rating as a digit in the line
        const m = line.match(/(\d)\s*$/);
        const rating = m ? Number(m[1]) : 5;
        out.push({ id: `${Date.now()}-${idx}`, name: line.substring(0, 30).trim(), rating, comment: line, date: '' });
      }
    });

    return out;
  };

  // (Standalone review management removed.)

  // Filter Orders
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      (order.order_id && order.order_id.toLowerCase().includes(q)) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(q)) ||
      (order.phone && order.phone.includes(q))
    );
  });

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Admin Sub Navbar */}
      <nav className="navbar bg-dark navbar-dark shadow-sm py-2 mb-3">
        <div className="container-fluid px-3 d-flex justify-content-between align-items-center">
          <span className="navbar-brand fw-bold fs-5 m-0">🛠️ Admin Control</span>
          <div className="btn-group">
            <button
              className={`btn btn-sm ${activeTab === 'orders' ? 'btn-light fw-bold' : 'btn-outline-light'}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 Orders ({orders.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'products' ? 'btn-light fw-bold' : 'btn-outline-light'}`}
              onClick={() => setActiveTab('products')}
            >
              🏷️ Products ({products.length})
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-3" style={{ maxWidth: '800px' }}>
        {/* ================= ORDERS TAB ================= */}
        {activeTab === 'orders' && (
          <div>
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body p-3">
                <input
                  type="text"
                  className="form-control form-control-lg fs-6"
                  placeholder="🔍 Search orders by ID, Name, or Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loadingOrders ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="card border-0 shadow-sm text-center p-4">
                <p className="text-muted m-0">No orders found.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filteredOrders.map((order) => {
                  const currentStatus = order.order_status || 'Placed';
                  const isPreset = STATUS_OPTIONS.includes(currentStatus);

                  return (
                    <div key={order.order_id} className="card border-0 shadow-sm rounded-3 overflow-hidden">
                      <div className="card-header bg-white d-flex justify-content-between align-items-center py-2 px-3 border-bottom">
                        <span className="fw-bold text-primary fs-6">{order.order_id}</span>
                        <span
                          className={`badge ${
                            currentStatus === 'Delivered'
                              ? 'bg-success'
                              : currentStatus === 'Cancelled'
                              ? 'bg-danger'
                              : isPreset
                              ? 'bg-primary'
                              : 'bg-info text-dark'
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </div>

                      <div className="card-body p-3">
                        <div className="row g-2 mb-2">
                          <div className="col-12 col-sm-6">
                            <p className="mb-1 small"><strong>Product:</strong> {order.product_name || 'N/A'}</p>
                            <p className="mb-1 small"><strong>Customer:</strong> {order.customer_name || 'N/A'}</p>
                            <p className="mb-1 small">
                              <strong>Phone:</strong>{' '}
                              {order.phone ? <a href={`tel:${order.phone}`}>{order.phone}</a> : 'N/A'}
                            </p>
                          </div>
                          <div className="col-12 col-sm-6">
                            <p className="mb-1 small">
                              <strong>Payment:</strong> <span className="badge bg-secondary">{order.payment_method || 'COD'}</span>
                            </p>
                            {order.payment_method === 'ONLINE' && (
                              <p className="mb-1 small text-truncate">
                                <strong>UTR ID:</strong> <code>{order.transaction_id || 'N/A'}</code>
                              </p>
                            )}
                            <p className="mb-1 small"><strong>Address:</strong> {order.address}, {order.pincode}</p>
                          </div>
                        </div>

                        <hr className="my-2" />

                        {/* Status Change Form */}
                        <div className="bg-light p-2 rounded border">
                          <div className="row g-2 align-items-center">
                            <div className="col-12 col-sm-6">
                              <select
                                className="form-select form-select-sm"
                                value={isPreset ? currentStatus : 'CUSTOM'}
                                disabled={updatingId === order.order_id}
                                onChange={(e) => {
                                  if (e.target.value !== 'CUSTOM') updateStatus(order.order_id, e.target.value);
                                }}
                              >
                                {!isPreset && <option value="CUSTOM">Custom: "{currentStatus}"</option>}
                                <option value="" disabled>Select Preset Status</option>
                                {STATUS_OPTIONS.map((status) => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </div>

                            <div className="col-12 col-sm-6">
                              <div className="input-group input-group-sm">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Set custom status..."
                                  value={customStatusInput[order.order_id] ?? ''}
                                  onChange={(e) =>
                                    setCustomStatusInput({ ...customStatusInput, [order.order_id]: e.target.value })
                                  }
                                />
                                <button
                                  className="btn btn-outline-primary"
                                  type="button"
                                  disabled={updatingId === order.order_id || !customStatusInput[order.order_id]?.trim()}
                                  onClick={() => updateStatus(order.order_id, customStatusInput[order.order_id])}
                                >
                                  {updatingId === order.order_id ? 'Updating...' : 'Set'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= PRODUCTS TAB ================= */}
        {activeTab === 'products' && (
          <div>
            {/* Product Add / Edit Form */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white fw-bold">
                {editingProductId ? '✏️ Edit Product' : '➕ Add New Product'}
              </div>
              <div className="card-body p-3">
                <form onSubmit={handleSaveProduct}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold mb-1">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control form-control-sm"
                      placeholder="e.g. Premium Running Shoes"
                      value={productForm.name}
                      onChange={handleProductInputChange}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      className="form-control form-control-sm"
                      placeholder="e.g. 599"
                      value={productForm.price}
                      onChange={handleProductInputChange}
                      required
                    />
                  </div>
                  
                  {/* NEW FILE UPLOAD INPUT */}
                  <div className="mb-2">
                    <label className="form-label small fw-semibold mb-1">Select Product Image (Gallery)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control form-control-sm"
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                    {/* Show existing image preview if editing and no new file selected */}
                    {productForm.image && !imageFile && (
                      <div className="mt-2 d-flex align-items-center">
                        <span className="text-muted small me-2">Current Image:</span>
                        <img src={productForm.image} alt="Preview" style={{ width: '40px', height: '40px' }} className="rounded border" />
                      </div>
                    )}
                  </div>
                  {/* END FILE UPLOAD INPUT */}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold mb-1">Description</label>
                    <textarea
                      name="description"
                      className="form-control form-control-sm"
                      rows="2"
                      placeholder="Product details, specs, etc."
                      value={productForm.description}
                      onChange={handleProductInputChange}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold mb-1">Product Reviews</label>
                    <div className="form-text small text-muted">Bulk reviews are imported via server-side code. To add 1000+ reviews, use a script (see <strong>tools/uploadReviews.js</strong>) or run a migration using the Supabase service role key.</div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" disabled={savingProduct} className="btn btn-success btn-sm fw-bold px-3">
                      {savingProduct ? 'Saving...' : editingProductId ? 'Update Product' : 'Add Product'}
                    </button>
                    {editingProductId && (
                      <button type="button" onClick={handleCancelEdit} className="btn btn-secondary btn-sm">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Manage Reviews card removed — reviews are now edited inside the Add/Edit Product form */}

            {/* Product List */}
            <h6 className="fw-bold mb-3">All Active Products</h6>
            {loadingProducts ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
              </div>
            ) : products.length === 0 ? (
              <p className="text-muted small">No products added yet.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="card border-0 shadow-sm p-2"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={prod.image || 'https://via.placeholder.com/60'}
                        alt={prod.name}
                        className="rounded object-fit-cover"
                        style={{ width: '60px', height: '60px' }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-0 fw-bold">{prod.name}</h6>
                        <span className="text-danger fw-bold fs-6">₹{prod.price}</span>
                        <p className="text-muted small m-0 text-truncate" style={{ maxWidth: '250px' }}>
                          {prod.description}
                        </p>
                      </div>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-outline-primary btn-sm py-1 px-2"
                          onClick={(e) => { e.stopPropagation(); handleEditProductClick(prod); }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm py-1 px-2"
                          onClick={(e) => { e.stopPropagation(); handleDeleteProduct(prod.id); }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}