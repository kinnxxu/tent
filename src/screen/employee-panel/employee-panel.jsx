import React, { useState, useEffect } from 'react';
import { Search, Edit2, Save, X } from 'lucide-react';
import './employee-panel.css';

const EmployeePanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://weekend-production-4177.up.railway.app/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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

  const handleUpdateStatus = async (orderId) => {
    try {
      const response = await fetch(`https://weekend-production-4177.up.railway.app/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setEditingOrderId(null);
        fetchOrders();
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const filteredOrders = orders.filter(o =>
    o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-container"><div className="loader"></div></div>;

  return (
    <div className="employee-panel-screen">
      <div className="container">
        <header className="panel-header">
          <div className="header-info">
            <h1>Employee Portal</h1>
            <p>Managing orders for <span>Fine Bearing & Oil Seal Store</span></p>
          </div>
          <div className="user-welcome">
            Welcome, <strong>{user?.name}</strong>
          </div>
        </header>

        <div className="panel-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by Order ID or Customer Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Shipping Address</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.orderId}>
                  <td className="id-cell">{order.orderId}</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>
                    <div className="customer-info">
                      <span className="c-name">{order.user?.name}</span>
                      <span className="c-email">{order.user?.email || order.user?.phone}</span>
                      {order.shippingAddress?.gstNumber && <span className="c-gst">GST: {order.shippingAddress.gstNumber}</span>}
                    </div>
                  </td>
                  <td>
                    {order.shippingAddress ? (
                      <div className="address-display">
                        <span className="a-street">{order.shippingAddress.street}</span>
                        <span className="a-city">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                        <span className="a-zip">{order.shippingAddress.zip}</span>
                        {(order.shippingAddress.landmark || order.shippingAddress.nearbyPlaces) && (
                          <span className="a-landmark">📍 {order.shippingAddress.landmark || order.shippingAddress.nearbyPlaces}</span>
                        )}
                      </div>
                    ) : (
                      <span className="no-address">No address provided</span>
                    )}
                  </td>
                  <td className="total-cell">₹{order.total.toFixed(2)}</td>
                  <td>
                    {editingOrderId === order.orderId ? (
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="status-select"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${order.status.toLowerCase().replace(' ', '-')}`}>
                        {order.status}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {editingOrderId === order.orderId ? (
                        <>
                          <button className="icon-btn save" onClick={() => handleUpdateStatus(order.orderId)}>
                            <Save size={18} />
                          </button>
                          <button className="icon-btn cancel" onClick={() => setEditingOrderId(null)}>
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <button className="icon-btn edit" onClick={() => {
                          setEditingOrderId(order.orderId);
                          setNewStatus(order.status);
                        }}>
                          <Edit2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeePanel;
