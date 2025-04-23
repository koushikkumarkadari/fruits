import React, { useState, useContext } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext/AuthContext';
import {ClimbingBoxLoader} from "react-spinners";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading,setLoading]=useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      // Client-side validation
      if (!email || !password) {
        setError('Please provide both email and password.');
        return;
      }
      if (!emailRegex.test(email)) {
        setError("Invalid email format. Email must include '@' and a valid domain (e.g., user@example.com).");
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      setLoading(true);
      await register(email, password);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed.');
    }
    finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Register</h1>
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div>
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(''); // Clear error on input change
            }}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="user@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(''); // Clear error on input change
            }}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="At least 6 characters"
            required
          />
        </div>
        {!loading&&<button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition"
        >
          Register
        </button>}
        {loading&&<button
              
              className="w-full  text-white font-semibold px-4 py-2 rounded transition"
            >
              <ClimbingBoxLoader
            color="#36d7b7"
            size={15}
            aria-label="Loading Spinner"
            data-testid="loader"
          /></button>}
        <p className="text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;