import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext/AuthContext';

const InventoryManager = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', pricePerUnit: '', type: '' });
  const [error, setError] = useState('');
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated or not loading
    if (!loading && !user) {
      navigate('/login');
    }
    // Redirect to home if authenticated but not admin
    if (!loading && user && !user.isAdmin) {
      setError('You must be an admin to access this page.');
      navigate('/');
    }
  }, [user, loading, navigate]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('https://fruits-server.onrender.com/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch products.');
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addProduct = async () => {
    try {
      if (!form.name || !form.pricePerUnit || !form.type) {
        setError('All fields are required.');
        return;
      }
      await axios.post('https://fruits-server.onrender.com/products', form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setForm({ name: '', pricePerUnit: '', type: '' });
      setError('');
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Failed to add product. Ensure you are logged in as an admin.');
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`https://fruits-server.onrender.com/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Failed to delete product.');
    }
  };

  const editProduct = async (id, updatedProduct) => {
    try {
      await axios.put(`https://fruits-server.onrender.com/products/${id}`, updatedProduct, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Failed to edit product.');
    }
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchProducts();
    }
  }, [user]);

  // Render nothing while loading to prevent flicker
  if (loading) {
    return null;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Inventory Manager</h1>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-white shadow-md rounded-lg p-4 size-fit">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleInputChange}
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="pricePerUnit"
          placeholder="Price per Unit"
          value={form.pricePerUnit}
          onChange={handleInputChange}
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="type"
          value={form.type}
          onChange={handleInputChange}
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select Type --</option>
          <option value="Fruit">Fruit</option>
          <option value="Vegetable">Vegetable</option>
        </select>
        <button
          onClick={addProduct}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded transition"
        >
          Add Product
        </button>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="border border-gray-200 p-4 rounded bg-white shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="text-lg font-medium text-gray-700">{product.name}</p>
              <p className="text-sm text-gray-500">₹{product.pricePerUnit}/kg</p>
              <p className="text-sm text-gray-500">Type: {product.type}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => deleteProduct(product._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  const newName = prompt('New name:', product.name);
                  const newPrice = prompt('New price:', product.pricePerUnit);
                  const newType = prompt('New type (Fruit/Vegetable):', product.type);
                  if (newName && newPrice && newType) {
                    editProduct(product._id, { name: newName, pricePerUnit: newPrice, type: newType });
                  }
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryManager;