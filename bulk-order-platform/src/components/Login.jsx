import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext} from '../AuthContext/AuthContext';
import { Link } from 'react-router-dom';
import { ClimbingBoxLoader } from "react-spinners";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h1>
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        {!loading&&<button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition"
        >
          Login
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
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;