import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle the menu

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-gray-200">
          FarmerGram
        </Link>
        {/* Hamburger Icon */}
        <button
          className="block md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
        {/* Links for larger screens */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-gray-300 transition">
            Home
          </Link>
          {user && !user.isAdmin && (
            <Link to="/order" className="hover:text-gray-300 transition">
              Order here
            </Link>
          )}
          {user && (
            <Link to="/track-order" className="hover:text-gray-300 transition">
              Track Order
            </Link>
          )}
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
      {/* Dropdown Menu for small screens */}
      {isMenuOpen && (
        <div className="md:hidden bg-green-700 text-white space-y-4 px-4 py-3">
          <Link to="/" className="block hover:text-gray-300 transition">
            Home
          </Link>
          {user && !user.isAdmin && (
            <Link to="/order" className="block hover:text-gray-300 transition">
              Order here
            </Link>
          )}
          {user && (
            <Link to="/track-order" className="block hover:text-gray-300 transition">
              Track Order
            </Link>
          )}
          {user && user.isAdmin && (
            <Link to="/admin" className="block hover:text-gray-300 transition">
              AdminDashboard
            </Link>
          )}
          {user && user.isAdmin && (
            <Link to="/inventory" className="block hover:text-gray-300 transition">
              Inventory Manager
            </Link>
          )}
          {user ? (
            <button
              onClick={logout}
              className="block hover:text-gray-300 transition"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="block hover:text-gray-300 transition">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;