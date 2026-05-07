import React, { useState, useEffect } from 'react';
import { Package, ChevronRight, ShoppingBag, Clock, CheckCircle2, Truck, Box, XCircle, MapPin, X, Phone, Mail, Building, CreditCard, ReceiptText } from 'lucide-react';
import { resolveImageUrl } from '../../components/home/ProductCard';
import './orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://weekend-production-4177.up.railway.app/api/orders/${user.email || user.username}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
      } catch (error) {
        console.error("Fetch Orders Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return <Clock size={18} />;
      case 'packed': return <Box size={18} />;
      case 'dispatched': return <Truck size={18} />;
      case 'delivered': return <CheckCircle2 size={18} />;
      case 'cancelled': return <XCircle size={18} />;
      default: return <Package size={18} />;
    }
  };

  const getProgressWidth = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return '20%';
      case 'packed': return '40%';
      case 'dispatched': return '70%';
      case 'delivered': return '100%';
      case 'cancelled': return '0%';
      default: return '10%';
    }
  };

  if (!user) {
    return (
      <div className="orders-page-wrapper">
        <div className="orders-empty">
          <ShoppingBag size={64} />
          <h2>Please Login</h2>
          <p>You need to be logged in to track your recent industrial orders.</p>
          <a href="/login" className="btn-primary">Login to Account</a>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="orders-loading">
      <div className="spinner"></div>
      <p>Retrieving your order history...</p>
    </div>
  );

  return (
    <div className="orders-page-wrapper">
      <div className="container">
        <header className="orders-header-section">
          <h1>My Recent Orders</h1>
          <p>Track delivery status and view history for your B2B purchases</p>
        </header>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <Package size={64} strokeWidth={1} />
            <h2>No orders found</h2>
            <p>You haven't placed any orders yet. Explore our professional catalogue to get started.</p>
            <a href="/products" className="btn-primary">Browse Products</a>
          </div>
        ) : (
          <div className="orders-container-grid">
            {orders.map((order) => (
              <div key={order.orderId} className="tracking-order-card">
                <div className="order-top-bar">
                  <div className="order-meta">
                    <span className="order-label">ORDER ID</span>
                    <span className="order-value">#{order.orderId}</span>
                    <span className="order-date">{new Date(order.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className={`status-pill ${order.status.toLowerCase().replace(' ', '-')}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </div>

                <div className="tracking-progress-container">
                  <div className="progress-track">
                    <div className="progress-bar" style={{ width: getProgressWidth(order.status) }}></div>
                  </div>
                  <div className="progress-labels">
                    <span className={order.status.toLowerCase() === 'processing' ? 'active' : ''}>Processing</span>
                    <span className={order.status.toLowerCase() === 'packed' ? 'active' : ''}>Packed</span>
                    <span className={order.status.toLowerCase() === 'dispatched' ? 'active' : ''}>Dispatched</span>
                    <span className={order.status.toLowerCase() === 'delivered' ? 'active' : ''}>Delivered</span>
                  </div>
                </div>

                <div className="order-card-main">
                  <div className="order-items-list">
                    {order.items.map((item, i) => (
                      <div key={i} className="tracking-item">
                        <img src={resolveImageUrl(item.image)} alt={item.name} />
                        <div className="tracking-item-info">
                          <h4>{item.name}</h4>
                          <p>Quantity: {item.quantity}</p>
                        </div>
                        <div className="tracking-item-price">₹{item.totalPrice.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="order-shipping-summary">
                    <div className="shipping-info-block">
                      <h5><MapPin size={14} /> Shipping To</h5>
                      {order.shippingAddress ? (
                        <p>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                      ) : (
                        <p>Address details not available for this legacy order.</p>
                      )}
                    </div>
                    <div className="payment-info-block">
                      <h5>Payment Status</h5>
                      <p className="payment-success">Verified & Paid</p>
                      <span className="total-amount-label">Total Amount</span>
                      <span className="total-amount-value">₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="order-footer-actions">
                  <button className="btn-details" onClick={() => setSelectedOrder(order)}>
                    View Full Details <ChevronRight size={16} />
                  </button>
                  <button className="btn-support" onClick={() => window.location.href = '/contact'}>
                    Contact Support
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Order Details Modal --- */}
        {selectedOrder && (
          <div className="order-modal-backdrop" onClick={() => setSelectedOrder(null)}>
            <div className="order-details-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="header-info">
                  <h3>Order Details</h3>
                  <span className="order-id">#{selectedOrder.orderId}</span>
                </div>
                <button className="close-modal" onClick={() => setSelectedOrder(null)}>
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                {/* Status Section */}
                <div className="modal-section status-section">
                  <div className={`status-banner ${selectedOrder.status.toLowerCase().replace(' ', '-')}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span>Order is currently <strong>{selectedOrder.status}</strong></span>
                  </div>
                  <p className="order-timestamp">Placed on {new Date(selectedOrder.date).toLocaleString()}</p>
                </div>

                <div className="modal-grid">
                  {/* Left Column: Items */}
                  <div className="modal-left">
                    <div className="modal-section">
                      <h4><ShoppingBag size={18} /> Items Ordered</h4>
                      <div className="modal-items-list">
                        {selectedOrder.items.map((item, i) => (
                          <div key={i} className="modal-item">
                            <img src={resolveImageUrl(item.image)} alt={item.name} />
                            <div className="item-details">
                              <p className="item-name">{item.name}</p>
                              <p className="item-qty">Qty: {item.quantity} × ₹{item.price || (item.totalPrice / item.quantity).toFixed(2)}</p>
                            </div>
                            <div className="item-price">₹{item.totalPrice.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Address & Payment */}
                  <div className="modal-right">
                    <div className="modal-section">
                      <h4><MapPin size={18} /> Shipping Address</h4>
                      <div className="info-card">
                        {selectedOrder.shippingAddress ? (
                          <>
                            <p className="customer-name">{selectedOrder.shippingAddress.fullName}</p>
                            <p>{selectedOrder.shippingAddress.street}</p>
                            <p>{selectedOrder.shippingAddress.landmark}</p>
                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zip}</p>
                            <p className="contact-row"><Phone size={14} /> {selectedOrder.shippingAddress.phone}</p>
                            <p className="contact-row"><Mail size={14} /> {selectedOrder.shippingAddress.email}</p>
                          </>
                        ) : (
                          <p>Address data missing.</p>
                        )}
                      </div>
                    </div>

                    <div className="modal-section">
                      <h4><ReceiptText size={18} /> Price Breakdown</h4>
                      <div className="price-card">
                        <div className="price-row"><span>Subtotal</span><span>₹{(selectedOrder.total / 1.18).toFixed(2)}</span></div>
                        <div className="price-row"><span>GST (18%)</span><span>₹{(selectedOrder.total - (selectedOrder.total / 1.18)).toFixed(2)}</span></div>
                        <div className="price-divider"></div>
                        <div className="price-total"><span>Total Paid</span><span>₹{selectedOrder.total.toFixed(2)}</span></div>
                        <p className="payment-method"><CreditCard size={14} /> Paid via Razorpay</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-print" onClick={() => window.print()}>Download Invoice</button>
                <button className="btn-primary-small" onClick={() => setSelectedOrder(null)}>Done</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
