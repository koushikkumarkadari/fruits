import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext/AuthContext';

const Catalogue = () => {
  const [products, setProducts] = useState([]);
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
        .get('http://localhost:5000/products')
        .then((res) => setProducts(res.data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  // Render nothing while loading to prevent flicker
  if (loading) {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Product Catalogue</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="p-4 border rounded-lg shadow">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-600">Price per unit: ₹{product.pricePerUnit}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link to="/order" className="text-blue-600 underline">
          Place a Bulk Order
        </Link>
      </div>
    </div>
  );
};

export default Catalogue;