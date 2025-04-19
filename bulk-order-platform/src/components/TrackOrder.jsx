import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext/AuthContext';

const TrackOrder = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Fetch orders based on user role
    if (user) {
      const fetchOrders = async () => {
        try {
          const endpoint = user.isAdmin ? '/admin/orders' : '/user/orders';
          const res = await axios.get(`https://fruits-server.onrender.com${endpoint}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setOrders(res.data);
          setError('');
        } catch (err) {
          console.error(err);
          setError(err.response?.data?.message || 'Failed to fetch orders.');
        }
      };
      fetchOrders();
    }
  }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `https://fruits-server.onrender.com/admin/orders/${orderId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      setError('Failed to update order status.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.delete(`https://fruits-server.onrender.com/user/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
    } catch (err) {
      console.error(err);
      setError('Failed to cancel the order.');
    }
  };

  // Calculate the total price for each order
  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => {
      return total + (item.product?.pricePerUnit || 0) * item.quantity;
    }, 0);
  };

  // Calculate the aggregated total price for all orders
  const aggregatedTotal = orders.reduce((total, order) => {
    return total + calculateOrderTotal(order.items);
  }, 0);

  // Render loader while loading
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        {user?.isAdmin ? 'All Orders (Admin View)' : 'Your Orders'}
      </h1>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {orders.length === 0 && !error && (
        <div className="flex flex-row justify-center text-gray-600 text-center h-screen items-center">
          {user?.isAdmin ? (
            <p className="text-gray-600 text-center">'No orders in the system.'</p>
          ) : (
            <img alt="You have no orders." src="https://s6.gifyu.com/images/bpc41.gif" />
          )}
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => {
          const orderTotal = calculateOrderTotal(order.items);
          return (
            <div
              key={order._id}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-200 space-y-4"
            >
              <h2 className="md:text-2xl font-semibold text-gray-700">
                Order ID: {order._id}
              </h2>
              {user?.isAdmin && (
                <p className="text-sm md:text-lg">
                  <span className="text-sm md:text-lg font-medium text-gray-600">
                    Placed by:
                  </span>{' '}
                  {order.user?.email || 'Unknown User'}
                </p>
              )}
              <div className="space-y-2">
                <h3 className="text-sm md:text-lg font-medium text-gray-600">Items:</h3>
                {order.items && order.items.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {order.items.map((item, index) => (
                      <li key={index} className="text-gray-700">
                        {item.product?.name || 'Unknown Product'} ({item.quantity} kg) - ₹
                        {item.product?.pricePerUnit || 0} per kg
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No items in this order.</p>
                )}
              </div>
              <p className="text-sm md:text-lg">
                <span className="text-sm md:text-lg font-medium text-gray-600">Buyer:</span>{' '}
                {order.buyerName}
              </p>
              <p className="text-sm md:text-lg">
                <span className="text-sm md:text-lg font-medium text-gray-600">Contact:</span>{' '}
                {order.contact}
              </p>
              <p className="text-sm md:text-lg">
                <span className="text-sm md:text-lg font-medium text-gray-600">Address:</span>{' '}
                {order.address}
              </p>
              <p className="text-sm md:text-lg">
                <span className="text-sm md:text-lg font-medium text-gray-600">Status:</span>
                {user?.isAdmin ? (
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="ml-2 px-2 py-1 text-sm rounded border border-gray-300"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In transit">In transit</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Returned">Returned</option>
                    <option value="Failed">Failed</option>
                  </select>
                ) : (
                  <span
                    className={`ml-2 px-2 py-1 text-sm rounded ${
                      order.status === 'Delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {order.status}
                  </span>
                )}
              </p>
              <p className="text-sm md:text-lg font-medium text-gray-600">
                Total Price: ₹{orderTotal.toFixed(2)}
              </p>
              {/* Cancel Order Button */}
              {!user?.isAdmin && order.status === 'Pending' && (
                <button
                  onClick={() => handleCancelOrder(order._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Cancel Order
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackOrder;