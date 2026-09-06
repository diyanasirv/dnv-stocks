import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Admin from './Admin';
import ProductReviews, { getReviewData } from './ProductReviews';

const ADMIN_PIN = '5840';

// moved review data into ProductReviews.jsx

export default function App() {
  const [activeTab, setActiveTab] = useState('shop');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckout, setIsCheckout] = useState(false);

  // Admin Auth States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    pincode: '',
    payment_method: 'ONLINE',
    transaction_id: ''
  });

  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [placedOrderAmount, setPlacedOrderAmount] = useState(null);
  const [placedOrderProductName, setPlacedOrderProductName] = useState('');
  const [searchOrderId, setSearchOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentReviewData, setCurrentReviewData] = useState({ reviews: [], count: 0, avgRating: '4.8' });
  const [productReviewsMap, setProductReviewsMap] = useState({}); // productId -> { reviews, count, avgRating }

  // Fetch dynamic products from Supabase
  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
      // fetch reviews for these products (server-side storage)
      try {
        const ids = data.map((p) => p.id).filter(Boolean);
        if (ids.length) {
          const { data: revData, error: revErr } = await supabase
            .from('product_reviews')
            .select('product_id,reviews')
            .in('product_id', ids);
          if (!revErr && Array.isArray(revData)) {
            const map = {};
            revData.forEach((r) => {
              const arr = Array.isArray(r.reviews) ? r.reviews : [];
              const count = arr.length;
              const avg = count > 0 ? (arr.reduce((a, it) => a + (Number(it.rating) || 0), 0) / count).toFixed(1) : '4.8';
              map[r.product_id] = { reviews: arr, count, avgRating: avg };
            });
            setProductReviewsMap(map);
          }
        }
      } catch (e) {
        // ignore
      }
    }
    setLoadingProducts(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Check URL path on initial render to detect direct access to /admin
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      if (isAdminAuthenticated) {
        setActiveTab('admin');
      } else {
        setShowPinModal(true);
      }
    }
  }, [isAdminAuthenticated]);

  // Real-time listener cleanup for tracked order
  useEffect(() => {
    if (!trackedOrder) return;

    const channel = supabase
      .channel(`public:orders:order_id=eq.${trackedOrder.order_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `order_id=eq.${trackedOrder.order_id}`
        },
        (payload) => {
          if (payload.new) {
            setTrackedOrder(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trackedOrder?.order_id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateOrderId = () => {
    return 'DNV-' + Math.floor(100000 + Math.random() * 900000);
  };

  const getFinalPrice = () => {
    if (!selectedProduct) return 0;
    const basePrice = Number(selectedProduct.price) || 0;
    return formData.payment_method === 'COD' ? basePrice + 10 : basePrice;
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.payment_method === 'ONLINE' && !formData.transaction_id.trim()) {
      alert('Please enter your UPI Transaction/UTR ID');
      setLoading(false);
      return;
    }

    const newOrderId = generateOrderId();
    const finalAmount = getFinalPrice();

    const { error } = await supabase.from('orders').insert([
      {
        order_id: newOrderId,
        product_name: selectedProduct.name,
        customer_name: formData.customer_name,
        phone: formData.phone,
        address: formData.address,
        pincode: formData.pincode,
        payment_method: formData.payment_method,
        transaction_id: formData.payment_method === 'ONLINE' ? formData.transaction_id : null,
        order_status: 'Order placed',
        amount: finalAmount
      }
    ]);

    setLoading(false);

    if (error) {
      alert('Failed to place order: ' + error.message);
    } else {
      setPlacedOrderId(newOrderId);
      setPlacedOrderAmount(finalAmount);
      setPlacedOrderProductName(selectedProduct?.name || '');
      closeProduct();
      setIsCheckout(false);
    }
  };

  const handleTrackOrder = async (e) => {
    if (e) e.preventDefault();
    setTrackError('');
    setTrackedOrder(null);

    const cleanOrderId = searchOrderId.trim();
    if (!cleanOrderId) {
      setTrackError('Please enter an Order ID.');
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', cleanOrderId)
      .single();

    if (error || !data) {
      setTrackError('Order not found. Please check your Order ID.');
    } else {
      setTrackedOrder(data);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('diyanasir01-2@oksbi');
    alert('UPI ID copied to clipboard!');
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (enteredPin === ADMIN_PIN) {
      setIsAdminAuthenticated(true);
      setShowPinModal(false);
      setActiveTab('admin');
    } else {
      setPinError('Incorrect PIN. Access Denied.');
    }
  };

  const handleClosePinModal = () => {
    setShowPinModal(false);
    window.history.pushState({}, '', '/');
    setActiveTab('shop');
  };

  // `getReviewData` is imported from `src/ProductReviews.jsx` and used below

  // When a product is selected, prefer server-stored reviews (Supabase `product_reviews` table).
  useEffect(() => {
    let mounted = true;
    const loadReviews = async () => {
      if (!selectedProduct) {
        if (mounted) setCurrentReviewData({ reviews: [], count: 0, avgRating: '4.8' });
        return;
      }

      try {
        const { data, error } = await supabase.from('product_reviews').select('reviews').eq('product_id', selectedProduct.id).single();
        if (!error && data && Array.isArray(data.reviews) && data.reviews.length > 0) {
          const parsed = data.reviews;
          const count = parsed.length;
          const avgRating = (parsed.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / count).toFixed(1);
          if (mounted) setCurrentReviewData({ reviews: parsed, count, avgRating });
          return;
        }
      } catch (e) {
        // ignore and fallback to local/default
      }

      // Fallback: use localStorage or built-in defaults via getReviewData
      if (mounted) setCurrentReviewData(getReviewData(selectedProduct));
    };

    loadReviews();
    return () => { mounted = false; };
  }, [selectedProduct]);

  // History helpers: open/close product and handle browser back/forward
  useEffect(() => {
    const handlePop = (e) => {
      const path = window.location.pathname;
      if (path.startsWith('/product/')) {
        const id = path.split('/product/')[1];
        const prod = products.find((p) => String(p.id) === String(id));
        if (prod) setSelectedProduct(prod);
        else setSelectedProduct(null);
      } else {
        setSelectedProduct(null);
      }
    };

    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [products]);

  const openProduct = (prod) => {
    setSelectedProduct(prod);
    try { window.history.pushState({ productId: prod.id }, '', `/product/${prod.id}`); } catch (e) { /* ignore */ }
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    try { window.history.pushState({}, '', '/'); } catch (e) { /* ignore */ }
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Navbar */}
      <nav className="navbar sticky-top bg-white border-bottom shadow-sm py-2">
        <div className="container-fluid px-3 d-flex justify-content-between align-items-center">
          <span className="navbar-brand fw-bold text-primary fs-4 m-0">DNV Stocks</span>
          <div className="btn-group" role="group">
            <button
              className={`btn btn-sm ${activeTab === 'shop' ? 'btn-primary fw-bold' : 'btn-outline-primary'}`}
              onClick={() => { setActiveTab('shop'); setPlacedOrderId(null); closeProduct(); setIsCheckout(false); fetchProducts(); window.history.pushState({}, '', '/'); }}>
              Shop
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'track' ? 'btn-primary fw-bold' : 'btn-outline-primary'}`}
              onClick={() => { setActiveTab('track'); window.history.pushState({}, '', '/track'); }}>
              Track
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-3 pt-3" style={{ maxWidth: '600px' }}>
        {/* SHOP SECTION */}
        {activeTab === 'shop' && (
          <div>
            {placedOrderId ? (
              <div className="card shadow-sm border-0 text-center p-3">
                <div className="card-body p-2">
                  <div className="text-success mb-2 display-4">🎉</div>
                  <h3 className="card-title text-success fw-bold fs-4">Order Placed!</h3>
                  <p className="text-muted small mb-2">Your unique Order ID is:</p>
                  <div className="bg-light p-3 rounded border fs-3 fw-bold text-primary my-2 user-select-all">
                    {placedOrderId}
                  </div>
                  <div className="alert alert-warning text-dark fw-bold small my-3" role="alert">
                    📸 <strong>Important:</strong> Take a screenshot or copy this Order ID to track your order!
                  </div>

                  {/* WHATSAPP CONFIRMATION BUTTON */}
                  <a
                    href={`https://wa.me/918156902004?text=${encodeURIComponent(
                      `Hello! I have placed an order.\n\n*Name:* ${formData.customer_name}\n*Order ID:* ${placedOrderId}\n*Product:* ${placedOrderProductName || ''}\n*Total:* ₹${placedOrderAmount !== null ? placedOrderAmount : getFinalPrice()}\n\nPlease confirm my order. Thank you!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success w-100 py-3 fw-bold fs-6 mb-2 d-flex align-items-center justify-content-center gap-2"
                  >
                    <span>💬</span> Confirm Order on WhatsApp
                  </a>

                  <button
                    onClick={() => { setPlacedOrderId(null); fetchProducts(); }}
                    className="btn btn-outline-secondary w-100 py-2 fw-semibold fs-6">
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : !selectedProduct ? (
              /* PRODUCT LIST VIEW */
              <div>
                {loadingProducts ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="card border-0 shadow-sm text-center p-4">
                    <p className="text-muted m-0">No products available at the moment.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {products.map((prod) => {
                      const serverRev = productReviewsMap[prod.id];
                      const { count, avgRating } = serverRev ? { count: serverRev.count, avgRating: serverRev.avgRating } : getReviewData(prod);
                      return (
                        <div
                          key={prod.id}
                          className="card shadow-sm border-0 rounded-3 overflow-hidden"
                          style={{ cursor: 'pointer' }}
                          onClick={() => openProduct(prod)}
                        >
                          <img
                            src={prod.image || 'https://via.placeholder.com/300'}
                            className="card-img-top object-fit-cover"
                            alt={prod.name}
                            style={{ height: '220px' }}
                          />
                          <div className="card-body p-3">
                            <h5 className="card-title fw-bold fs-5 mb-1">{prod.name}</h5>
                            <div className="d-flex align-items-center gap-1 mb-2">
                              <span className="text-warning fw-bold fs-6">★ {avgRating}</span>
                              <span className="text-muted small">({count} reviews)</span>
                            </div>
                            <p className="card-text text-muted small mb-3">{prod.description}</p>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fs-3 fw-bold text-danger">₹{prod.price}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); openProduct(prod); }}
                                className="btn btn-primary fw-bold px-4 py-2 fs-6">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : !isCheckout ? (
              /* SEPARATE PRODUCT PAGE VIEW */
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-3">
                  <button
                    onClick={() => closeProduct()}
                    className="btn btn-light btn-sm fw-semibold mb-3 border w-100 py-2">
                    ← Back to Products
                  </button>

                  <img
                    src={selectedProduct.image || 'https://via.placeholder.com/300'}
                    alt={selectedProduct.name}
                    className="w-100 rounded-3 object-fit-cover mb-3"
                    style={{ maxHeight: '300px' }}
                  />

                  <h4 className="fw-bold fs-4 mb-1">{selectedProduct.name}</h4>

                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="badge bg-success fs-6 py-1 px-2">{currentReviewData.avgRating} ★</span>
                    <span className="text-muted small font-weight-semibold">{currentReviewData.count} Verified Reviews</span>
                  </div>

                  <div className="mb-3">
                    <span className="fs-2 fw-bold text-danger me-2">₹{selectedProduct.price}</span>
                    <span className="badge bg-light text-success border border-success">In Stock</span>
                  </div>

                  <p className="text-secondary mb-4">{selectedProduct.description}</p>

                  <button
                    onClick={() => setIsCheckout(true)}
                    className="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm mb-4">
                    Buy Now
                  </button>

                  <hr className="my-4" />

                  <ProductReviews selectedProduct={selectedProduct} currentReviewData={currentReviewData} />
                </div>
              </div>
            ) : (
              /* CHECKOUT FORM VIEW */
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-3">
                  <button
                    onClick={() => setIsCheckout(false)}
                    className="btn btn-light btn-sm fw-semibold mb-3 border w-100 py-2">
                    ← Back to Product Details
                  </button>

                  <div className="d-flex align-items-center gap-3 p-2 bg-light rounded mb-3 border">
                    <img
                      src={selectedProduct.image || 'https://via.placeholder.com/60'}
                      alt={selectedProduct.name}
                      className="rounded object-fit-cover"
                      style={{ width: '60px', height: '60px' }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">{selectedProduct.name}</h6>
                      <span className="fs-5 text-danger fw-bold">Total: ₹{getFinalPrice()}</span>
                    </div>
                  </div>

                  <form onSubmit={handleOrderSubmit}>
                    <h6 className="fw-bold text-uppercase text-muted small mb-2">Delivery Details</h6>
                    <div className="mb-2">
                      <input type="text" name="customer_name" className="form-control form-control-lg fs-6" placeholder="Full Name" required value={formData.customer_name} onChange={handleInputChange} />
                    </div>
                    <div className="mb-2">
                      <input type="tel" name="phone" className="form-control form-control-lg fs-6" placeholder="Mobile Number" required value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div className="mb-2">
                      <textarea name="address" className="form-control fs-6" rows="3" placeholder="Full Delivery Address" required value={formData.address} onChange={handleInputChange}></textarea>
                    </div>
                    <div className="mb-3">
                      <input type="text" name="pincode" className="form-control form-control-lg fs-6" placeholder="Pincode" required value={formData.pincode} onChange={handleInputChange} />
                    </div>

                    <h6 className="fw-bold text-uppercase text-muted small mb-2">Payment Method</h6>

                    {/* ONLINE PAYMENT FIRST */}
                    <div className="card p-2 mb-2 border">
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="payment_method" id="online" value="ONLINE" checked={formData.payment_method === 'ONLINE'} onChange={handleInputChange} />
                        <label className="form-check-label fw-semibold" htmlFor="online">
                          Online Payment (UPI / QR Code)
                        </label>
                      </div>
                    </div>

                    {/* CASH ON DELIVERY SECOND WITH +₹10 NOTICE */}
                    <div className="card p-2 mb-3 border">
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="payment_method" id="cod" value="COD" checked={formData.payment_method === 'COD'} onChange={handleInputChange} />
                        <label className="form-check-label fw-semibold d-flex justify-content-between align-items-center" htmlFor="cod">
                          <span>Cash on Delivery (COD)</span>
                          <span className="badge bg-warning text-dark small">+₹10 Charge</span>
                        </label>
                      </div>
                    </div>

                    {formData.payment_method === 'COD' && (
                      <div className="alert alert-info py-2 small mb-3">
                        ℹ️ <strong>Note:</strong> ₹10 cash-on-delivery handling charge has been added to your total.
                      </div>
                    )}

                    {formData.payment_method === 'ONLINE' && (
                      <div className="p-3 bg-light rounded border border-dashed text-center mb-3">
                        <p className="fw-bold small mb-2">Scan QR Code or Copy UPI ID to pay ₹{getFinalPrice()}</p>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=diyanasir01-2@oksbi%26am=${getFinalPrice()}`} alt="UPI QR Code" className="mb-2 rounded img-fluid" style={{ maxWidth: '160px' }} />
                        <div className="mb-2 d-flex justify-content-center align-items-center gap-2">
                          <code className="bg-white px-2 py-1 border rounded small">diyanasir01-2@oksbi</code>
                          <button type="button" onClick={copyUpiId} className="btn btn-outline-primary btn-sm py-1">Copy</button>
                        </div>
                        <input type="text" name="transaction_id" className="form-control form-control-lg fs-6" placeholder="Enter UTR / Transaction ID" value={formData.transaction_id} onChange={handleInputChange} />
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm">
                      {loading ? 'Placing Order...' : `Confirm Order (₹${getFinalPrice()})`}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRACKING SECTION */}
        {activeTab === 'track' && (
          <div className="card shadow-sm border-0 p-3 rounded-3">
            <div className="card-body p-1">
              <h5 className="fw-bold mb-3">Track Your Order Status</h5>
              <form onSubmit={handleTrackOrder} className="d-flex flex-column gap-2 mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg fs-6"
                  placeholder="Enter Order ID (e.g. DNV-123456)"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary py-2 fw-bold fs-6">
                  Track Order
                </button>
              </form>

              {trackError && <div className="alert alert-danger p-2 small" role="alert">{trackError}</div>}

              {trackedOrder && (
                <div className="border rounded p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-primary m-0">Order ID: {trackedOrder.order_id}</h6>
                    <button
                      className="btn btn-sm btn-outline-secondary py-0 px-2 fs-7"
                      onClick={handleTrackOrder}
                    >
                      🔄 Refresh Status
                    </button>
                  </div>
                  <div className="d-flex flex-column gap-2 small">
                    <div className="p-2 bg-white rounded border">
                      <strong>Item:</strong> {trackedOrder.product_name || 'N/A'}
                    </div>
                    {trackedOrder.amount && (
                      <div className="p-2 bg-white rounded border">
                        <strong>Total Amount:</strong> ₹{trackedOrder.amount}
                      </div>
                    )}
                    <div className="p-2 bg-white rounded border d-flex justify-content-between align-items-center">
                      <strong>Status:</strong>
                      <span className={`badge text-uppercase fs-6 ${trackedOrder.order_status === 'Delivered' ? 'bg-success' :
                          trackedOrder.order_status === 'Cancelled' ? 'bg-danger' : 'bg-primary'
                        }`}>
                        {trackedOrder.order_status || 'Order Placed'}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <strong>Payment Method:</strong> {trackedOrder.payment_method}
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <strong>Address:</strong> {trackedOrder.address}, {trackedOrder.pincode}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADMIN SECTION */}
        {activeTab === 'admin' && isAdminAuthenticated && <Admin />}
      </div>

      {/* ADMIN PIN VERIFICATION MODAL */}
      {showPinModal && (
        <div className="modal show d-block tab-modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered px-3">
            <div className="modal-content rounded-3 border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">🔐 Admin Access</h5>
                <button type="button" className="btn-close" onClick={handleClosePinModal}></button>
              </div>
              <form onSubmit={handlePinSubmit}>
                <div className="modal-body py-3">
                  <p className="text-muted small mb-2">Please enter passcode to access dashboard:</p>
                  <input
                    type="password"
                    className="form-control form-control-lg text-center fs-4 fw-bold"
                    placeholder="Enter PIN"
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    autoFocus
                    required
                  />
                  {pinError && <p className="text-danger small mt-2 mb-0 fw-semibold text-center">{pinError}</p>}
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={handleClosePinModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold px-4">
                    Unlock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}