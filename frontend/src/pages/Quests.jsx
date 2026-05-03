import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Footprints, Flame, Swords, ChevronRight, Target, Trophy, X, Shield, Zap, CheckCircle2, Clock, Timer, Lock, MapPin, Wind, Plus, Edit2 } from 'lucide-react';
import axios from 'axios';
import { useNotifications } from '../context/NotificationContext';

const Quests = () => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [activeMission, setActiveMission] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [workouts, setWorkouts] = useState([]);
  const { addNotification } = useNotifications();
  const timerRef = useRef(null);

  // Daily Trials State
  const [dailyStats, setDailyStats] = useState({
    steps: 0,
    water: 0,
    calories: 0
  });

  const bodyParts = [
    { id: 'upper', name: 'Upper Body', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop', quest: 'Complete 3 Chest/Arms sessions', reward: '500 XP', mission: 'Titan Strength', tasks: ['Log 3 Upper Body workouts', 'Total 45 mins active time', 'Burn 600 total kcal'] },
    { id: 'lower', name: 'Lower Body', img: 'https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=1000&auto=format&fit=crop', quest: 'Complete 100 Squats', reward: '450 XP', mission: 'Iron Foundation', tasks: ['Perform 100 deep squats', 'Complete 2 Leg sessions', 'Hold wall sit for 2 mins'] },
    { id: 'legs', name: 'Legs Day', img: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600', quest: 'Log 5km Walking/Running', reward: '600 XP', mission: 'The Marathoner', tasks: ['Reach 5km distance', 'Maintain 6km/h pace', 'Complete in one session'] },
    { id: 'abs', name: 'ABS Core', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop', quest: 'Hold a 5 min Plank', reward: '350 XP', mission: 'Core Guardian', tasks: ['Hold 5 mins total plank', 'Complete 50 crunches', 'No rest between sets'] },
    { id: 'back', name: 'Back Strength', img: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1000&auto=format&fit=crop', quest: 'Complete 50 Pullups', reward: '700 XP', mission: 'The Wingman', tasks: ['50 wide-grip pullups', 'Log 2 heavy back days', 'Burn 400 kcal in back day'] },
    { id: 'shoulder', name: 'Shoulders', img: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?q=80&w=1000&auto=format&fit=crop', quest: 'Military Press 40 reps', reward: '400 XP', mission: 'Boulder Shoulders', tasks: ['40 military press reps', 'Complete 30 lateral raises', 'Zero form breakdown'] },
  ];

  const outdoorQuests = [
    { id: 'football', name: 'Football', img: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=600', quest: '90 min intense match', reward: '800 XP', mission: 'Striker Pride', tasks: ['Play for 90 minutes', 'Reach 10km total distance', 'Burn 800 kcal match-day'] },
    { id: 'cricket', name: 'Cricket', img: 'https://images.pexels.com/photos/3657154/pexels-photo-3657154.jpeg?auto=compress&cs=tinysrgb&w=600', quest: 'Full T20 session', reward: '600 XP', mission: 'The Finisher', tasks: ['Log 3 hours of play', 'Perform 20 sprints', 'Maintain hydration levels'] },
    { id: 'basketball', name: 'Basketball', img: 'https://images.pexels.com/photos/1080884/pexels-photo-1080884.jpeg?auto=compress&cs=tinysrgb&w=600', quest: '3-on-3 Tournament', reward: '550 XP', mission: 'Sky Jumper', tasks: ['Play 45 min nonstop', 'Log high-intensity cardio', 'Improve vertical jump'] },
    { id: 'badminton', name: 'Badminton', img: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600', quest: '3 Sets intensity', reward: '400 XP', mission: 'Lightning Reflex', tasks: ['Complete 3 intense sets', 'Focus on agility drills', 'Burn 300 kcal'] },
    { id: 'swimming', name: 'Swimming', img: 'https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=600', quest: '500m Laps', reward: '750 XP', mission: 'The Aqua Warrior', tasks: ['Swim 500m total', 'Practice breathing drills', 'Log full body recovery'] },
  ];

  useEffect(() => {
    // Load persisted data
    const savedMission = localStorage.getItem('activeMission');
    if (savedMission) {
      const missionData = JSON.parse(savedMission);
      setActiveMission(missionData.mission);
      const startTime = missionData.startTime;
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeElapsed(elapsed);
    }

    const savedWater = localStorage.getItem('dailyWater');
    const savedSteps = localStorage.getItem('dailySteps');
    if (savedWater) setDailyStats(prev => ({ ...prev, water: parseInt(savedWater) }));
    if (savedSteps) setDailyStats(prev => ({ ...prev, steps: parseInt(savedSteps) }));

    const fetchData = async () => {
      try {
        const [questsRes, workoutsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/quests'),
          axios.get('http://localhost:5000/api/workouts')
        ]);
        setQuests(questsRes.data);
        setWorkouts(workoutsRes.data);

        // Calculate today's calories
        const today = new Date().setHours(0,0,0,0);
        const todayCalories = workoutsRes.data
          .filter(w => new Date(w.date).setHours(0,0,0,0) === today)
          .reduce((sum, w) => sum + w.calories, 0);
        
        setDailyStats(prev => ({ ...prev, calories: todayCalories }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeMission) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setTimeElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [activeMission]);

  const handleUpdateSteps = () => {
    const newSteps = prompt("Enter your total steps for today:", dailyStats.steps);
    if (newSteps !== null) {
      const val = parseInt(newSteps);
      setDailyStats(prev => ({ ...prev, steps: val }));
      localStorage.setItem('dailySteps', val);
    }
  };

  const handleAddWater = () => {
    const newVal = dailyStats.water + 1;
    setDailyStats(prev => ({ ...prev, water: newVal }));
    localStorage.setItem('dailyWater', newVal);
    if (newVal === 8) {
      addNotification({ title: 'Hydration Goal Hit! 💧', message: 'You drank 8 glasses of water today. Stay fresh!', time: 'Just now', type: 'health' });
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAcceptMission = () => {
    const startTime = Date.now();
    setActiveMission(selectedQuest);
    localStorage.setItem('activeMission', JSON.stringify({ mission: selectedQuest, startTime }));
    addNotification({ title: 'Mission Lock-In!', message: `The ${selectedQuest.mission} mission is now active. Focus on your goal!`, time: 'Just now', type: 'health' });
    setSelectedQuest(null);
  };

  const handleEndMission = async () => {
    const baseReward = parseInt(activeMission.reward);
    const timeBonus = Math.floor(timeElapsed / 60) * 10;
    const totalXp = baseReward + timeBonus;
    try {
      await axios.post('http://localhost:5000/api/users/xp-update', { xpToAdd: totalXp });
      addNotification({ title: 'Mission Mastered! 🏆', message: `You earned ${totalXp} XP in ${formatTime(timeElapsed)}.`, time: 'Just now', type: 'achievement' });
      setActiveMission(null);
      localStorage.removeItem('activeMission');
      window.location.reload(); 
    } catch (err) { console.error(err); }
  };

  const renderQuestCard = (bp, idx) => {
    const isLocked = activeMission && activeMission.id !== bp.id;
    const isActive = activeMission && activeMission.id === bp.id;
    return (
      <motion.div key={bp.id} whileHover={!isLocked ? { y: -8 } : {}} className="glass" style={{ padding: '0', borderRadius: '32px', overflow: 'hidden', position: 'relative', height: '320px', cursor: isLocked ? 'not-allowed' : 'pointer', background: '#f1f5f9', opacity: isLocked ? 0.4 : 1, filter: isLocked ? 'grayscale(0.5)' : 'none' }}>
        <img src={bp.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        {isLocked && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ background: 'white', padding: '12px', borderRadius: '50%' }}><Lock size={24} color="#64748b" /></div></div>}
        <motion.div initial={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 10%, rgba(0,0,0,0.3) 100%)' }} whileHover={!isLocked ? { background: 'linear-gradient(to top, rgba(0,0,0,0.5) 10%, rgba(0,0,0,0.1) 100%)' } : {}} style={{ position: 'absolute', inset: 0, padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', transition: 'all 0.3s ease' }}>
          <h3 style={{ color: 'white', fontSize: '22px', fontWeight: '900', marginBottom: '4px' }}>{bp.name}</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>{bp.quest}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fbbf24', fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><Trophy size={18} /> {bp.reward}</span>
            <motion.button onClick={() => !isLocked && setSelectedQuest(bp)} disabled={isLocked} whileHover={!isLocked ? { scale: 1.05 } : {}} whileTap={!isLocked ? { scale: 0.95 } : {}} style={{ background: isActive ? '#10b981' : 'white', border: 'none', color: isActive ? 'white' : '#1e293b', padding: '10px 20px', borderRadius: '14px', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: isLocked ? 'not-allowed' : 'pointer' }}>{isActive ? 'IN PROGRESS' : 'Start Mission'} <ChevronRight size={16} /></motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const dailyQuestsData = [
    { id: 'steps', title: 'Daily Walk', current: dailyStats.steps, goal: 10000, icon: <Footprints color="#10b981" />, unit: 'Steps', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=600', action: handleUpdateSteps, actionIcon: <Edit2 size={14} /> },
    { id: 'water', title: 'Hydration Hero', current: dailyStats.water, goal: 8, icon: <Droplets color="#0ea5e9" />, unit: 'Glasses', img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=600', action: handleAddWater, actionIcon: <Plus size={14} /> },
    { id: 'calories', title: 'Calorie Burn', current: dailyStats.calories, goal: 500, icon: <Flame color="#f97316" />, unit: 'kcal', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600' }
  ];

  return (
    <div className="main-content" style={{ paddingBottom: '100px' }}>
      <AnimatePresence>
        {activeMission && (
          <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 300, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(20px)', padding: '12px 24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '24px', minWidth: '500px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Shield size={20} /></div>
               <div><p style={{ color: 'white', fontSize: '14px', fontWeight: '800' }}>{activeMission.mission} ACTIVE</p><p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Focus: {activeMission.name}</p></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px' }}><Timer size={18} color="#0ea5e9" /><span style={{ color: 'white', fontFamily: 'monospace', fontSize: '18px', fontWeight: '700' }}>{formatTime(timeElapsed)}</span></div>
            <button onClick={handleEndMission} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>COMPLETE MISSION</button>
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ marginBottom: '48px' }}>
        <h1 className="dashboard-title">Active Missions</h1>
        <p className="dashboard-subtitle">Select your objective, train hard, and claim your rewards.</p>
      </header>

      {/* Daily Challenges */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
           <Target size={24} color="var(--primary)" />
           <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Daily Trials</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {dailyQuestsData.map((dq, idx) => (
            <motion.div key={dq.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }} transition={{ delay: idx * 0.1 }} className="glass" style={{ padding: '0', borderRadius: '32px', overflow: 'hidden', position: 'relative', height: '240px', background: '#f1f5f9' }}>
              <img src={dq.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              <motion.div initial={{ background: 'linear-gradient(to top, rgba(15,23,42,0.9), rgba(15,23,42,0.4))' }} whileHover={{ background: 'linear-gradient(to top, rgba(15,23,42,0.6), rgba(15,23,42,0.1))' }} style={{ position: 'absolute', inset: 0, padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.9)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{dq.icon}</div>
                  {dq.action && (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={dq.action}
                      style={{ background: 'rgba(255,255,255,0.9)', border: 'none', width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}
                    >
                      {dq.actionIcon}
                    </motion.button>
                  )}
                </div>
                <div>
                  <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '900', marginBottom: '8px' }}>{dq.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                    <span>{dq.current} / {dq.goal} {dq.unit}</span>
                    <span>{Math.min(100, Math.round((dq.current / dq.goal) * 100))}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '100px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (dq.current / dq.goal) * 100)}%` }} style={{ height: '100%', background: 'white', boxShadow: '0 0 15px rgba(255,255,255,0.5)' }} />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Body Part Specialization */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
           <Swords size={24} color="#f43f5e" /><h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Body Specialization</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>{bodyParts.map((bp, idx) => renderQuestCard(bp, idx))}</div>
      </section>

      {/* Outdoor Arenas */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
           <MapPin size={24} color="#10b981" /><h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Outdoor Arenas</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>{outdoorQuests.map((oq, idx) => renderQuestCard(oq, idx))}</div>
      </section>

      {/* Mission Briefing Modal */}
      <AnimatePresence>
        {selectedQuest && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="glass" style={{ width: '100%', maxWidth: '500px', padding: '0', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.2)' }}>
               <div style={{ height: '200px', position: 'relative' }}>
                  <img src={selectedQuest.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, white, transparent)' }} /><button onClick={() => setSelectedQuest(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}><X size={20} /></button>
                  <div style={{ position: 'absolute', bottom: '-20px', left: '40px', background: 'white', padding: '12px 24px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}><Shield size={24} color="var(--primary)" /><span style={{ fontWeight: '900', color: '#1e293b', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '1px' }}>{selectedQuest.mission}</span></div>
               </div>
               <div style={{ padding: '48px 40px 40px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Objective Breakdown</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{selectedQuest.tasks.map((task, idx) => (<div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={16} color="var(--primary)" /></div><span style={{ color: '#475569', fontWeight: '600', fontSize: '15px' }}>{task}</span></div>))}</div>
                  <div style={{ marginTop: '40px', padding: '24px', background: '#f8fafc', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div><p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Reward on completion</p><p style={{ fontSize: '24px', fontWeight: '900', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap fill="#fbbf24" size={24} /> {selectedQuest.reward}</p></div>
                     <motion.button onClick={handleAcceptMission} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '16px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(14, 165, 233, 0.3)' }}>Accept Mission</motion.button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Quests;
