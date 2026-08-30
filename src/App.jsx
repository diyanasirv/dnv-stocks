import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Admin from './Admin';

const ADMIN_PIN = '5840';

export default function App() {
  const [activeTab, setActiveTab] = useState('shop');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
    payment_method: 'COD',
    transaction_id: ''
  });

  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch dynamic products from Supabase
  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
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

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.payment_method === 'ONLINE' && !formData.transaction_id.trim()) {
      alert('Please enter your UPI Transaction/UTR ID');
      setLoading(false);
      return;
    }

    const newOrderId = generateOrderId();

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
        order_status: 'Processing'
      }
    ]);

    setLoading(false);

    if (error) {
      alert('Failed to place order: ' + error.message);
    } else {
      setPlacedOrderId(newOrderId);
      setSelectedProduct(null);
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
    navigator.clipboard.writeText('yourupiid@upi');
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

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Navbar */}
      <nav className="navbar sticky-top bg-white border-bottom shadow-sm py-2">
        <div className="container-fluid px-3 d-flex justify-content-between align-items-center">
          <span className="navbar-brand fw-bold text-primary fs-4 m-0">DNV Stocks</span>
          <div className="btn-group" role="group">
            <button 
              className={`btn btn-sm ${activeTab === 'shop' ? 'btn-primary fw-bold' : 'btn-outline-primary'}`} 
              onClick={() => { setActiveTab('shop'); setPlacedOrderId(null); fetchProducts(); window.history.pushState({}, '', '/'); }}>
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
                  <button 
                    onClick={() => { setPlacedOrderId(null); fetchProducts(); }} 
                    className="btn btn-primary w-100 py-3 fw-bold fs-6">
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : !selectedProduct ? (
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
                    {products.map((prod) => (
                      <div key={prod.id} className="card shadow-sm border-0 rounded-3 overflow-hidden">
                        <img 
                          src={prod.image || 'https://via.placeholder.com/300'} 
                          className="card-img-top object-fit-cover" 
                          alt={prod.name} 
                          style={{ height: '220px' }} 
                        />
                        <div className="card-body p-3">
                          <h5 className="card-title fw-bold fs-5 mb-1">{prod.name}</h5>
                          <p className="card-text text-muted small mb-3">{prod.description}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-3 fw-bold text-danger">₹{prod.price}</span>
                            <button 
                              onClick={() => setSelectedProduct(prod)} 
                              className="btn btn-success fw-bold px-4 py-2 fs-6">
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-3">
                  <button 
                    onClick={() => setSelectedProduct(null)} 
                    className="btn btn-light btn-sm fw-semibold mb-3 border w-100 py-2">
                    ← Back to Products
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
                      <span className="fs-5 text-danger fw-bold">₹{selectedProduct.price}</span>
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
                    <div className="card p-2 mb-2 border">
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="payment_method" id="cod" value="COD" checked={formData.payment_method === 'COD'} onChange={handleInputChange} />
                        <label className="form-check-label fw-semibold" htmlFor="cod">Cash on Delivery (COD)</label>
                      </div>
                    </div>
                    <div className="card p-2 mb-3 border">
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="payment_method" id="online" value="ONLINE" checked={formData.payment_method === 'ONLINE'} onChange={handleInputChange} />
                        <label className="form-check-label fw-semibold" htmlFor="online">Online Payment (UPI / QR Code)</label>
                      </div>
                    </div>

                    {formData.payment_method === 'ONLINE' && (
                      <div className="p-3 bg-light rounded border border-dashed text-center mb-3">
                        <p className="fw-bold small mb-2">Scan QR Code or Copy UPI ID to pay ₹{selectedProduct.price}</p>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=yourupiid@upi%26am=${selectedProduct.price}`} alt="UPI QR Code" className="mb-2 rounded img-fluid" style={{ maxWidth: '160px' }} />
                        <div className="mb-2 d-flex justify-content-center align-items-center gap-2">
                          <code className="bg-white px-2 py-1 border rounded small">yourupiid@upi</code>
                          <button type="button" onClick={copyUpiId} className="btn btn-outline-primary btn-sm py-1">Copy</button>
                        </div>
                        <input type="text" name="transaction_id" className="form-control form-control-lg fs-6" placeholder="Enter UTR / Transaction ID" value={formData.transaction_id} onChange={handleInputChange} />
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm">
                      {loading ? 'Placing Order...' : `Confirm Order (₹${selectedProduct.price})`}
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
                    <div className="p-2 bg-white rounded border d-flex justify-content-between align-items-center">
                      <strong>Status:</strong> 
                      <span className={`badge text-uppercase fs-6 ${
                        trackedOrder.order_status === 'Delivered' ? 'bg-success' :
                        trackedOrder.order_status === 'Cancelled' ? 'bg-danger' : 'bg-primary'
                      }`}>
                        {trackedOrder.order_status || 'Processing'}
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