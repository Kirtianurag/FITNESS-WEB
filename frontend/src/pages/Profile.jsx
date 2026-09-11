import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Calendar, Weight, Ruler, UserCircle, Edit3, Save, X, Camera, Shield, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import axios from 'axios';

const Profile = () => {
  const { user, login } = useAuth();
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    age: user?.age || '',
    weight: user?.weight || '',
    gender: user?.gender || 'Male',
    height: user?.height || '175',
    bio: user?.bio || 'Warrior in training. Focused on being 1% better every day.'
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`, formData);
      login(data); // Update local auth state
      setIsEditing(false);
      addNotification({
        title: 'Profile Updated!',
        message: 'Your personal information has been successfully saved.',
        time: 'Just now',
        type: 'health'
      });
    } catch (err) {
      console.error(err);
      addNotification({
        title: 'Update Failed',
        message: 'Could not save changes. Please try again.',
        time: 'Just now',
        type: 'tip'
      });
    }
  };

  return (
    <div className="main-content">
      <header style={{ marginBottom: '40px' }}>
        <h1 className="dashboard-title" style={{ textTransform: 'capitalize' }}>{user?.username}'s Profile</h1>
        <p className="dashboard-subtitle">Manage your personal data and fitness vitals.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Left Side: Avatar & Quick Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <div className="glass" style={{ padding: '40px', textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 24px' }}>
                 <img 
                   src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                   style={{ width: '100%', height: '100%', borderRadius: '40px', border: '4px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                   alt="Avatar"
                 />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', marginBottom: '4px' }}>{user?.username}</h2>
              <p style={{ color: '#94a3b8', fontWeight: '700', fontSize: '14px', marginBottom: '24px' }}>Warrior Level {user?.level}</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                 <span style={{ background: '#f1f5f9', color: '#64748b', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '800' }}>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
           </div>

           <div className="glass" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <Shield size={18} color="var(--primary)" /> Fitness Rank
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontWeight: '700', fontSize: '13px' }}>Total XP Earned</span>
                    <span style={{ color: '#1e293b', fontWeight: '900', fontSize: '14px' }}>{user?.xp?.toLocaleString()}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontWeight: '700', fontSize: '13px' }}>Workouts Logged</span>
                    <span style={{ color: '#1e293b', fontWeight: '900', fontSize: '14px' }}>{user?.totalWorkouts || 0}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8', fontWeight: '700', fontSize: '13px' }}>Active Streak</span>
                    <span style={{ color: '#10b981', fontWeight: '900', fontSize: '14px' }}>{user?.streak} Days</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Detailed Info & Editing */}
        <div className="glass" style={{ padding: '48px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>Personal Details</h3>
              <motion.button 
                onClick={() => setIsEditing(!isEditing)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ background: isEditing ? '#f1f5f9' : 'var(--primary)', color: isEditing ? '#64748b' : 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                {isEditing ? <><X size={16} /> Cancel</> : <><Edit3 size={16} /> Edit Profile</>}
              </motion.button>
           </div>

             <form onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                 <div className="form-group">
                    <label className="label">Display Name</label>
                    <input 
                      disabled={!isEditing}
                      className="input"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                 </div>
                 <div className="form-group">
                    <label className="label">Email Address</label>
                    <input 
                      disabled={!isEditing}
                      className="input"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                 </div>
                 <div className="form-group">
                    <label className="label">Age</label>
                    <input 
                      type="number"
                      disabled={!isEditing}
                      className="input"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                 </div>
                 <div className="form-group">
                    <label className="label">Body Weight (kg)</label>
                    <input 
                      type="number"
                      disabled={!isEditing}
                      className="input"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    />
                 </div>
                 <div className="form-group">
                    <label className="label">Height (cm)</label>
                    <input 
                      type="number"
                      disabled={!isEditing}
                      className="input"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                    />
                 </div>
                 <div className="form-group">
                    <label className="label">Gender</label>
                    <select 
                      disabled={!isEditing}
                      className="input"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      style={{ appearance: 'none' }}
                    >
                       <option>Male</option>
                       <option>Female</option>
                       <option>Other</option>
                    </select>
                 </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                 <label className="label" style={{ textTransform: 'capitalize' }}>{user?.username} Bio</label>
                 <textarea 
                   disabled={!isEditing}
                   className="input"
                   rows="3"
                   style={{ resize: 'none' }}
                   value={formData.bio}
                   onChange={(e) => setFormData({...formData, bio: e.target.value})}
                 />
              </div>

              <AnimatePresence>
                 {isEditing && (
                   <motion.button 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     type="submit"
                     className="btn-primary"
                     style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                   >
                      <Save size={20} /> Save Vitals
                   </motion.button>
                 )}
              </AnimatePresence>
           </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
