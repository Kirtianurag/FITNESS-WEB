import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Users, Flame, Zap, HelpCircle, ChevronDown } from 'lucide-react';
import axios from 'axios';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="glass" style={{ marginBottom: '16px', overflow: 'hidden', border: isOpen ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.3)' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={20} color="#94a3b8" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 32px 24px', color: '#64748b', fontSize: '15px', lineHeight: '1.6', fontWeight: '500' }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalUsers: 0, totalCalories: 0, totalWorkouts: 0 });
  const [loading, setLoading] = useState(true);

  const faqs = [
    { question: "How is my warrior rank calculated?", answer: "Your rank is primarily determined by your Total XP (Experience Points). Every workout you log and every mission you complete adds to your XP. The more consistent you are, the higher you climb." },
    { question: "When does the leaderboard update?", answer: "The leaderboard is dynamic and updates in real-time. As soon as you finish a workout or accept a reward, your position is recalculated against all other warriors globally." },
    { question: "How can I climb the ranks faster?", answer: "To boost your rank quickly, focus on 'Body Specialization' missions in the Quests tab. These offer higher 'Base XP' plus 'Time Bonuses' that can significantly accelerate your growth compared to standard logs." },
    { question: "Are there rewards for being at the top?", answer: "Yes! Top-ranked warriors receive exclusive visual badges on their profiles, a golden crown icon in the community chat, and unique multipliers for future events." }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lbRes, statsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/workouts/leaderboard'),
          axios.get('http://localhost:5000/api/stats/global')
        ]);
        setLeaderboard(lbRes.data);
        setGlobalStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Crown color="#fbbf24" size={24} />;
      case 1: return <Medal color="#94a3b8" size={24} />;
      case 2: return <Medal color="#b45309" size={24} />;
      default: return <span style={{ color: '#94a3b8', fontWeight: '700' }}>{index + 1}</span>;
    }
  };

  return (
    <div className="main-content" style={{ paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="dashboard-title">Top Fitness Warriors</h1>
        <p className="dashboard-subtitle">The elite few who have climbed the mountain. Are you next?</p>
      </div>

      <div className="glass" style={{ padding: '0', overflow: 'hidden', marginBottom: '60px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Rank</th>
              <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Warrior</th>
              <th style={{ padding: '20px 32px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Level</th>
              <th style={{ padding: '20px 32px', textAlign: 'right', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>XP</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, idx) => (
              <motion.tr 
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{ 
                  borderBottom: '1px solid #f1f5f9',
                  background: idx === 0 ? 'rgba(251, 191, 36, 0.03)' : 'transparent'
                }}
              >
                <td style={{ padding: '20px 32px' }}>{getRankIcon(idx)}</td>
                <td style={{ padding: '20px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={user.avatar} style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f1f5f9' }} alt="" />
                    <div>
                      <p style={{ fontWeight: '800', color: '#1e293b' }}>{user.username}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>Active this week</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 32px', textAlign: 'center' }}>
                  <span style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', fontWeight: '800', color: '#475569', border: '1px solid #e2e8f0' }}>
                    {user.level}
                  </span>
                </td>
                <td style={{ padding: '20px 32px', textAlign: 'right', fontWeight: '800', color: 'var(--primary)', fontSize: '18px' }}>
                  {user.xp.toLocaleString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Community Impact Dashboard */}
      <div className="glass" style={{ 
        background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', 
        padding: '60px 40px', 
        borderRadius: '32px', 
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        marginBottom: '80px'
      }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', opacity: 0.1 }}>
           <Users size={400} color="white" />
        </div>
        
        <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '16px', position: 'relative', zIndex: 2 }}>Community Power</h2>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px', fontWeight: '500', position: 'relative', zIndex: 2 }}>
          You aren't just training alone. You are part of a global movement of warriors pushing their limits every single day.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', position: 'relative', zIndex: 2 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
             <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Users size={24} />
             </div>
             <p style={{ fontSize: '32px', fontWeight: '900' }}>{globalStats.totalUsers}</p>
             <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '1px' }}>Active Warriors</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
             <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Flame size={24} />
             </div>
             <p style={{ fontSize: '32px', fontWeight: '900' }}>{globalStats.totalCalories.toLocaleString()}</p>
             <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '1px' }}>Kcal Burned Globally</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
             <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Zap size={24} />
             </div>
             <p style={{ fontSize: '32px', fontWeight: '900' }}>{globalStats.totalWorkouts.toLocaleString()}</p>
             <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '1px' }}>Workouts Completed</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section style={{ maxWidth: '800px', margin: '0 auto' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', justifyContent: 'center' }}>
            <HelpCircle size={32} color="var(--primary)" />
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b' }}>FAQ</h2>
         </div>
         {faqs.map((faq, idx) => (
           <FAQItem key={idx} question={faq.question} answer={faq.answer} />
         ))}
      </section>
    </div>
  );
};

export default Leaderboard;
