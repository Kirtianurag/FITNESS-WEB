import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, CheckCircle2, TrendingUp, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import XPProgress from '../components/XPProgress';
import axios from 'axios';

const Dashboard = () => {
  const { user, updateUserInfo } = useAuth();
  const { addNotification } = useNotifications();
  const [workouts, setWorkouts] = useState([]);
  const [quests, setQuests] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [formData, setFormData] = useState({ type: 'Running', duration: 30, calories: 300 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workoutsRes, profileRes, questsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/workouts'),
          axios.get('http://localhost:5000/api/auth/profile'),
          axios.get('http://localhost:5000/api/quests')
        ]);
        setWorkouts(workoutsRes.data);
        updateUserInfo(profileRes.data);
        // Filter for Daily quests only for the dashboard
        setQuests(questsRes.data.filter(q => q.type?.toLowerCase() === 'daily'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleLogWorkout = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/workouts', formData);
      setWorkouts([data.workout, ...workouts]);
      updateUserInfo(data.user);
      
      addNotification({
        title: 'Workout Logged!',
        message: `Great job! You just logged a ${formData.type} session and earned XP.`,
        time: 'Just now',
        type: 'health'
      });

      setShowLogModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimXP = async (questId) => {
    try {
      const { data } = await axios.post(`http://localhost:5000/api/quests/claim/${questId}`);
      updateUserInfo(data.user);
      addNotification({
        title: 'Reward Claimed! 🏆',
        message: `You earned ${data.xp - user.xp} XP! Keep pushing!`,
        time: 'Just now',
        type: 'achievement'
      });
      // Refresh quests to update UI
      const questsRes = await axios.get('http://localhost:5000/api/quests');
      setQuests(questsRes.data.filter(q => q.type?.toLowerCase() === 'daily'));
    } catch (err) {
      console.error("CLAIM ERROR:", err);
      const msg = err.response?.data?.message || "Server Error: Could not claim XP";
      alert(msg);
    }
  };

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome Back, {user?.username}!</h1>
          <p className="dashboard-subtitle">Keep up the streak! You're doing amazing.</p>
        </div>
        <button onClick={() => setShowLogModal(true)} className="btn-action">
          <Plus size={20} />
          Log Workout
        </button>
      </div>

      <div className="grid-2-1">
        {/* Profile Card */}
        <div className="glass profile-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
             <TrendingUp size={150} color="var(--primary)" />
          </div>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', position: 'relative', zIndex: 2 }}>
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
              alt="Avatar" 
              style={{ width: '80px', height: '80px', background: '#f0f9ff', borderRadius: '20px', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
            />
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>{user?.username}</h2>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <span style={{ background: '#fff7ed', color: '#f97316', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={14} fill="#f97316" /> {user?.streak || 0} Day Streak
                </span>
                <span style={{ background: '#f0f9ff', color: '#0ea5e9', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={14} fill="#0ea5e9" /> Legend Rank
                </span>
              </div>
            </div>
          </div>
          <XPProgress currentXp={user?.xp || 0} maxXp={1000} level={user?.level || 1} />
        </div>

        {/* Quick Stats */}
        <div className="glass stat-card">
          <h3 className="card-title">Quick Stats</h3>
          <div className="stat-item">
            <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <Flame size={24} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Calories Burned</p>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{user?.totalCaloriesBurned || 0} kcal</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Workouts Done</p>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{user?.totalWorkouts || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2-1">
        {/* Recent Activity */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Recent Activity</h3>
          {workouts.length > 0 ? workouts.map((workout, idx) => (
            <motion.div 
              key={workout._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass activity-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '48px', height: '48px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '800', color: '#1e293b' }}>{workout.type}</h4>
                  <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>{workout.duration} mins • {workout.calories} kcal</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--primary)', fontWeight: '800' }}>+{workout.xpGained} XP</p>
                <p style={{ fontSize: '11px', color: '#cbd5e1' }}>{new Date(workout.date).toLocaleDateString()}</p>
              </div>
            </motion.div>
          )) : (
            <div className="glass" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No workouts logged yet. Start today!
            </div>
          )}
        </div>

        {/* Quests */}
        <div>
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Daily Quests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {quests.length > 0 ? quests.map((quest) => {
              const today = new Date().setHours(0,0,0,0);
              
              // Logic check: Is it already claimed?
              const isClaimed = user?.completedQuests?.some(cq => 
                cq.questId === quest._id && 
                new Date(cq.date).setHours(0,0,0,0) === today
              );

              // Logic check: Is it ready to claim?
              const isReady = workouts.some(w => 
                new Date(w.date).setHours(0,0,0,0) === today && 
                (w.calories >= (quest.requirement?.value || 0) || w.duration >= (quest.requirement?.value || 0))
              );

              return (
                <div key={quest._id} className="glass quest-card" style={{ 
                  borderLeft: `4px solid ${isClaimed ? '#10b981' : isReady ? '#f59e0b' : 'var(--primary)'}`,
                  opacity: isClaimed ? 0.6 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ fontWeight: '800', color: '#1e293b' }}>{quest.title}</h4>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: isClaimed ? '#059669' : 'var(--primary)', background: isClaimed ? '#ecfdf5' : 'var(--primary-light)', padding: '2px 8px', borderRadius: '100px' }}>
                      {quest.xpReward} XP
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{quest.description}</p>
                  
                  {isReady && !isClaimed ? (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleClaimXP(quest._id)}
                      style={{ width: '100%', padding: '10px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)' }}
                    >
                      CLAIM {quest.xpReward} XP 🏆
                    </motion.button>
                  ) : (
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isClaimed ? '100%' : '30%' }}
                        style={{ height: '100%', background: isClaimed ? '#10b981' : 'var(--primary)' }}
                      />
                    </div>
                  )}
                  {isClaimed && <p style={{ fontSize: '11px', color: '#10b981', fontWeight: '800', marginTop: '8px', textAlign: 'center' }}>COMPLETED TODAY ✓</p>}
                </div>
              );
            }) : (
              <div className="glass" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                No quests available today.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {showLogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '20px' }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass" 
            style={{ width: '100%', maxWidth: '440px', padding: '40px', borderRadius: '32px' }}
          >
            <h3 className="auth-title" style={{ textAlign: 'left', fontSize: '24px' }}>Log New Workout</h3>
            <form onSubmit={handleLogWorkout} style={{ marginTop: '30px' }}>
              <div className="form-group">
                <label className="label">Workout Type</label>
                <select 
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option>Running</option>
                  <option>Weightlifting</option>
                  <option>Yoga</option>
                  <option>Cycling</option>
                  <option>Swimming</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="label">Duration (min)</label>
                  <input 
                    type="number" 
                    className="input"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Calories</label>
                  <input 
                    type="number" 
                    className="input"
                    value={formData.calories}
                    onChange={(e) => setFormData({...formData, calories: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowLogModal(false)} className="btn-primary" style={{ background: 'white', color: '#64748b', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Workout
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
