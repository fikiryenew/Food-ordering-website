// src/Pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const DAILY_LIMIT = 20;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Check Auth & Fetch live orders from backend server
  const fetchOrdersFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders from server');
      }
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not connect to backend server. Make sure node server.js is running.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchOrdersFromBackend();
    
    // Optional polling interval to check for new orders every 10 seconds live
    const interval = setInterval(fetchOrdersFromBackend, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  // 2. Update payment or order status in backend via PATCH
  const handleUpdateStatus = async (orderId, updatedFields) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders list immediately
      fetchOrdersFromBackend();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status on server.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  // Calculate total portions reserved today from backend data
  const totalPortionsReserved = orders.reduce((sum, o) => sum + (o.totalPortions || 0), 0);

  if (loading) return <div className="admin-loading" style={{ textAlign: 'center', padding: '50px' }}>Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Admin Management Dashboard</h1>
          <p>Review orders, verify payment evidence, and track daily capacity.</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </header>

      {errorMsg && <div className="checkout-error-banner" style={{ background: '#e74c3c', color: 'white', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>{errorMsg}</div>}

      <section className="capacity-card">
        <div className="capacity-info">
          <h3>Daily Capacity Status</h3>
          <p>Service Date: <strong>{new Date().toLocaleDateString()}</strong></p>
        </div>
        <div className="capacity-meter">
          <span>Portions Reserved: <strong>{totalPortionsReserved} / {DAILY_LIMIT}</strong></span>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${Math.min(100, (totalPortionsReserved / DAILY_LIMIT) * 100)}%` }}
            />
          </div>
        </div>
      </section>

      <section className="orders-section">
        <h2>Customer Orders Management</h2>

        <div className="orders-table-wrapper">
          {orders.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '30px' }}>No orders found in database.</p>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer Details</th>
                  <th>Portions</th>
                  <th>Total</th>
                  <th>Payment Method</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="ref-cell">{o.id}</td>
                    <td>
                      <strong>{o.customerName}</strong>
                      <div className="sub-text">{o.phone}</div>
                      <div className="sub-text text-muted">{o.deliveryAddress}</div>
                    </td>
                    <td>{o.totalPortions} portion(s)</td>
                    <td className="price-cell">{o.totalAmount.toFixed(2)} ETB</td>
                    <td>
                      <span className="badge-method">
                        {o.paymentMethod === 'telebirr' ? 'Telebirr / Transfer' : 'COD'}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={o.paymentStatus} 
                        onChange={(e) => handleUpdateStatus(o.id, { paymentStatus: e.target.value })}
                        className="status-select"
                      >
                        <option value="Payment pending verification">Pending Verification</option>
                        <option value="Verified / Paid">Verified / Paid</option>
                        <option value="Unpaid (COD)">Unpaid (COD)</option>
                        <option value="Rejected / Needs Review">Rejected / Needs Review</option>
                      </select>
                    </td>
                    <td>
                      <select 
                        value={o.orderStatus} 
                        onChange={(e) => handleUpdateStatus(o.id, { orderStatus: e.target.value })}
                        className="status-select"
                      >
                        <option value="Received">Received</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;