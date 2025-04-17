// File: components/AdminDashboard.js
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext/AuthContext';
import Analytics from './Analytics';

const AdminDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not an admin or not logged in
    if (!loading && (!user || !user.isAdmin)) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div
          onClick={() => navigate('/inventory')}
          className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Manage Inventory</h2>
          <p className="text-gray-500">Add, edit, or delete products in your catalogue.</p>
        </div>

        <div
          onClick={() => navigate('/track-order')}
          className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-2">View Orders</h2>
          <p className="text-gray-500">Track and manage customer orders.</p>
        </div>


      </div>

      <div>
        <Analytics />
      </div>
    </div>
  );
};

export default AdminDashboard;
