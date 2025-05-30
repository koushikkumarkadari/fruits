import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClimbingBoxLoader } from "react-spinners";
const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('https://fruits-server.onrender.com/admin/analytics', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setAnalyticsData(res.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to fetch analytics data.');
      }
    };

    fetchAnalytics();
  }, []);

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!analyticsData) {
    return <button
              
              className="w-full  text-white font-semibold px-4 py-2 rounded transition"
            >
              <ClimbingBoxLoader
            color="#36d7b7"
            size={15}
            aria-label="Loading Spinner"
            data-testid="loader"
          /></button>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Order Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Orders</h2>
          <p className="text-gray-500">{analyticsData.totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Delivered Orders</h2>
          <p className="text-gray-500">{analyticsData.deliveredOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Pending Orders</h2>
          <p className="text-gray-500">{analyticsData.pendingOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Failed Orders</h2>
          <p className="text-gray-500">{analyticsData.failedOrders}</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;