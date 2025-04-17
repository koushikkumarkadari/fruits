import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-gray-200">
          FarmerGram
        </Link>
        <div className="space-x-6">
        {user && !user.isAdmin && (<Link to="/" className="hover:text-gray-300 transition">
            Home
          </Link> )}
          {user && !user.isAdmin && (<Link to="/order" className="hover:text-gray-300 transition">
            Orders
          </Link> )}
          {user && (<Link to="/track-order" className="hover:text-gray-300 transition">
            Track Order
          </Link>)}
          {user && user.isAdmin && (
            <Link to="/admin" className="hover:text-gray-300 transition">
              AdminDashboard
            </Link>
          )}
          {user && user.isAdmin && (
            <Link to="/inventory" className="hover:text-gray-300 transition">
              Inventory Manager 
            </Link>
          )}
          {user ? (
            <button onClick={logout} className="hover:text-gray-300 transition">
              Logout
            </button>
          ) : (
            <Link to="/login" className="hover:text-gray-300 transition">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;