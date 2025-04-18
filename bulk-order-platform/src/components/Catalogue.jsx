import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext/AuthContext';

const Catalogue = () => {
  const [fruits, setFruits] = useState([]);
  const [vegetables, setVegetables] = useState([]);
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Fetch products and segregate them
    if (user) {
      axios
        .get('http://localhost:5000/products')
        .then((res) => {
          const fruits = res.data.filter((product) => product.type === 'Fruit');
          const vegetables = res.data.filter((product) => product.type === 'Vegetable');
          setFruits(fruits);
          setVegetables(vegetables);
        })
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

      <h2 className="text-xl font-semibold mb-2">Fruits</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {fruits.map((fruit) => (
          <div key={fruit._id} className="p-4 border rounded-lg shadow">
            <h3 className="text-lg font-semibold">{fruit.name}</h3>
            <p className="text-gray-600">Price per unit: ₹{fruit.pricePerUnit}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-2">Vegetables</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vegetables.map((vegetable) => (
          <div key={vegetable._id} className="p-4 border rounded-lg shadow">
            <h3 className="text-lg font-semibold">{vegetable.name}</h3>
            <p className="text-gray-600">Price per unit: ₹{vegetable.pricePerUnit}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalogue;