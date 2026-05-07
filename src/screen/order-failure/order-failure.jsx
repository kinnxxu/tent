import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XCircle, RefreshCcw, ShoppingBag } from 'lucide-react';
import './order-failure.css';

const OrderFailure = () => {
  const location = useLocation();
  const { error } = location.state || { error: 'Payment could not be processed.' };

  return (
    <div className="order-failure-screen">
      <div className="container">
        <div className="failure-card">
          <XCircle size={80} color="#ef4444" />
          <h1>Payment Failed</h1>
          <p className="error-message">{error}</p>
          
          <div className="reasons">
            <p>Common reasons for failure:</p>
            <ul>
              <li>Insufficient funds</li>
              <li>Incorrect details or OTP</li>
              <li>Network issues</li>
            </ul>
          </div>

          <div className="actions">
            <Link to="/products" className="btn btn-outline"><ShoppingBag size={18} /> Back to Shop</Link>
            <button className="btn btn-primary" onClick={() => window.history.back()}><RefreshCcw size={18} /> Try Again</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFailure;
