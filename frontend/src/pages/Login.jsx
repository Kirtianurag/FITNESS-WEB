import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-form-side">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass auth-card"
        >
          <div className="logo-circle">F</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Ready for today's quest?</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input 
                type="email" 
                className="input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input 
                type="password" 
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              Sign In
            </button>
          </form>

          <p className="auth-footer">
            New here? <Link to="/register" className="auth-link">Create an account</Link>
          </p>
        </motion.div>
      </div>
      
      <div className="auth-image-side">
        <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop" alt="Fitness" />
        <div className="auth-image-overlay"></div>
        <div className="auth-image-content">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="auth-image-title"
          >
            PUSH YOUR LIMITS
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="auth-image-text"
          >
            Level up your life, one workout at a time. Join the community of warriors.
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Login;
