import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext/AuthContext';
import Catalogue from './components/Catalogue';
import OrderForm from './components/OderForm';
import TrackOrder from './components/TrackOrder';
import AdminDashboard from './components/AdminDashboard';
import InventoryManager from './components/InventoryManager';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Catalogue />} />
          <Route path="/order" element={<OrderForm />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/inventory" element={<InventoryManager />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;