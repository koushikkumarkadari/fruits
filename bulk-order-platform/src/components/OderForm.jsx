import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext/AuthContext';
import { ClimbingBoxLoader } from "react-spinners";

const OrderForm = () => {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ product: '', quantity: '' }]);
  const [form, setForm] = useState({
    buyerName: '',
    contact: '',
    address: '',
  });
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
    // Fetch products only if authenticated
    if (user) {
      axios
        .get('https://fruits-server.onrender.com/products')
        .then((res) => setProducts(res.data))
        .catch((err) => {
          console.error(err);
          setError('Failed to fetch products.');
        });
    }
  }, [user]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product: '', quantity: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      setError('At least one product is required.');
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateCartValue = () => {
    return items.reduce((total, item) => {
      const product = products.find((p) => p._id === item.product);
      const price = product ? product.pricePerUnit : 0;
      return total + price * (item.quantity || 0);
    }, 0);
  };

  const handleSubmit = async () => {
    setError('');
    // Validate items
    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        setError('Please select a product and enter a valid quantity for all items.');
        return;
      }
    }
    // Validate form
    if (!form.buyerName || !form.contact || !form.address) {
      setError('Please fill in all buyer details.');
      return;
    }

    try {
      await axios.post(
        'https://fruits-server.onrender.com/orders',
        {
          items: items.map((item) => ({
            productId: item.product,
            quantity: Number(item.quantity),
          })),
          buyerName: form.buyerName,
          contact: form.contact,
          address: form.address,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      alert('Order placed successfully!');
      navigate('/track-order');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to place order.');
    }
  };

  // Render nothing while loading to prevent flicker
  if (loading) {
    return (
      <button
        className="w-full  text-white font-semibold px-4 py-2 rounded transition"
      >
        <ClimbingBoxLoader
          color="#36d7b7"
          size={15}
          aria-label="Loading Spinner"
          data-testid="loader"
        /></button>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Place Bulk Order</h1>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Items Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Select Products</h2>
          {items.map((item, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 justify-end ">
              <div className="flex-1">
                <label className="block text-gray-600">Product</label>
                <select
                  value={item.product}
                  onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select --</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-gray-600">Quantity (kg)</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  min="1"
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => removeItem(index)}
                className=" bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mt-6 md:mt-0"
                disabled={items.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addItem}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
          >
            Add Another Product
          </button>
        </div>

        {/* Cart Value */}
        <div className="text-right text-lg font-semibold text-gray-700">
          Total Cart Value: ₹{calculateCartValue().toFixed(2)}
        </div>

        {/* Buyer Details Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Buyer Details</h2>
          <div>
            <label className="block text-gray-600">Name</label>
            <input
              type="text"
              name="buyerName"
              value={form.buyerName}
              onChange={handleFormChange}
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-600">Contact</label>
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleFormChange}
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-600">Delivery Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleFormChange}
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default OrderForm;