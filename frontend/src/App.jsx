import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Quests from './pages/Quests';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Nutrition from './pages/Nutrition';
import { Bell, Heart, Droplets, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const { notifications, clearNotifications } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <div style={{ display: 'flex' }} className="bg-mesh min-h-screen">
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', maxHeight: '100vh' }}>
        <header style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 40px', position: 'sticky', top: 0, zIndex: 30, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
             
             {/* Notification Bell */}
             <div style={{ position: 'relative' }}>
                <motion.button 
                  onClick={() => setShowNotifs(!showNotifs)}
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  style={{ background: 'white', border: '1px solid #f1f5f9', padding: '10px', borderRadius: '14px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s ease' }}
                >
                  <Bell size={20} />
                  {notifications.length > 0 && <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', background: '#ef4444', border: '2px solid white', borderRadius: '50%' }}></div>}
                </motion.button>

                <AnimatePresence>
                  {showNotifs && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{ position: 'absolute', top: '60px', right: '0', width: '320px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '24px', zIndex: 100, border: '1px solid #f1f5f9' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Notifications</h3>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '100px' }}>{notifications.length} New</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {notifications.map(n => (
                          <div key={n.id} style={{ display: 'flex', gap: '14px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: n.type === 'health' ? '#ecfdf5' : '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {n.type === 'health' ? <Droplets size={18} color="#10b981" /> : <Info size={18} color="#0ea5e9" />}
                            </div>
                            <div>
                              <p style={{ fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '2px' }}>{n.title}</p>
                              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>{n.message}</p>
                              <p style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: '600', marginTop: '4px' }}>{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <motion.button 
                        onClick={clearNotifications}
                        whileHover={{ background: '#f1f5f9', color: 'var(--primary)', scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ width: '100%', marginTop: '20px', padding: '12px', border: 'none', background: '#f8fafc', color: '#94a3b8', fontSize: '12px', fontWeight: '700', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                      >
                        Mark all as read
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {/* User Profile */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
               <div style={{ textAlign: 'right' }}>
                 <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Welcome,</p>
                 <p style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px' }}>{user?.username}</p>
               </div>
               <div style={{ position: 'relative' }}>
                  <img 
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                    style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f8fafc', border: '2px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                    alt={user?.username} 
                  />
                  <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '14px', height: '14px', background: '#10b981', border: '3px solid white', borderRadius: '50%' }}></div>
               </div>
             </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={<PrivateRoute><MainLayout><Dashboard /></MainLayout></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><MainLayout><Chat /></MainLayout></PrivateRoute>} />
            <Route path="/leaderboard" element={<PrivateRoute><MainLayout><Leaderboard /></MainLayout></PrivateRoute>} />
            <Route path="/quests" element={<PrivateRoute><MainLayout><Quests /></MainLayout></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><MainLayout><Analytics /></MainLayout></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><MainLayout><Profile /></MainLayout></PrivateRoute>} />
            <Route path="/nutrition" element={<PrivateRoute><MainLayout><Nutrition /></MainLayout></PrivateRoute>} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
