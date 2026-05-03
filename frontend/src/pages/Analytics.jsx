import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Award, Users, Target, Activity, Flame, Zap, MapPin } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
  const { user } = useAuth();
  const [workoutData, setWorkoutData] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [typeData, setTypeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extraStats, setExtraStats] = useState({ totalDistance: 0, topSpecialty: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workoutsRes, compRes] = await Promise.all([
          axios.get('http://localhost:5000/api/workouts'),
          axios.get('http://localhost:5000/api/stats/comparison')
        ]);

        const allWorkouts = workoutsRes.data;

        // Process Weekly Data
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const weeklyStats = last7Days.map(date => {
          const dayWorkouts = allWorkouts.filter(w => w.date.split('T')[0] === date);
          return {
            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            calories: dayWorkouts.reduce((sum, w) => sum + w.calories, 0),
          };
        });
        setWorkoutData(weeklyStats);

        // Process Type Distribution & Extra Stats
        const types = {};
        let totalDist = 0;
        allWorkouts.forEach(w => {
          types[w.type] = (types[w.type] || 0) + 1;
          if (w.type === 'Running' || w.type === 'Walking') totalDist += (w.duration * 0.15); // Rough km estimate
        });
        
        const sortedTypes = Object.entries(types).sort((a,b) => b[1] - a[1]);
        setExtraStats({
          totalDistance: totalDist.toFixed(1),
          topSpecialty: sortedTypes[0] ? sortedTypes[0][0] : 'N/A'
        });

        setTypeData(Object.entries(types).map(([name, value]) => ({ name, value })));
        setComparisonData(compRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const comparisonChartData = comparisonData ? [
    { name: 'Avg Member', xp: comparisonData.avgXp, color: '#94a3b8' },
    { name: user?.username || 'You', xp: comparisonData.yourXp, color: '#0ea5e9' },
    { name: 'Elite Member', xp: comparisonData.eliteXp, color: '#fbbf24' },
  ] : [];

  const COLORS = ['#0ea5e9', '#10b981', '#f43f5e', '#fbbf24', '#8b5cf6'];

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Analyzing your performance...</div>;

  return (
    <div className="main-content">
      <header style={{ marginBottom: '40px' }}>
        <h1 className="dashboard-title" style={{ textTransform: 'capitalize' }}>{user?.username}'s Analytics</h1>
        <p className="dashboard-subtitle">Visualize your growth and see how you stack up against the elite.</p>
      </header>

      {/* NEW Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
        <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(255, 255, 255, 0.7))' }}>
           <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <MapPin size={24} color="var(--primary)" />
           </div>
           <div>
              <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Total Distance Covered</p>
              <h4 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>{extraStats.totalDistance} <span style={{ fontSize: '14px', color: '#94a3b8' }}>KM</span></h4>
           </div>
        </div>

        <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(255, 255, 255, 0.7))' }}>
           <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Zap size={24} color="#10b981" />
           </div>
           <div>
              <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Core Specialty</p>
              <h4 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>{extraStats.topSpecialty}</h4>
           </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Main Performance Chart */}
        <div className="glass" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>Energy Output</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Your calorie burn over the last 7 days</p>
            </div>
            <div style={{ background: '#f0f9ff', padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Flame size={16} color="#0ea5e9" />
               <span style={{ color: '#0ea5e9', fontWeight: '800', fontSize: '14px' }}>Active Week</span>
            </div>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={workoutData}>
                <defs>
                  <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: '800' }}
                />
                <Area type="monotone" dataKey="calories" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorCal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Training Distribution */}
        <div className="glass" style={{ padding: '32px' }}>
           <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '24px' }}>Discipline Mix</h3>
           <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div style={{ marginTop: '20px' }}>
              {typeData.map((type, idx) => (
                <div key={type.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>{type.name}</span>
                   </div>
                   <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{type.value}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Comparison Analytics */}
      <div className="glass" style={{ padding: '40px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 20px rgba(251, 191, 36, 0.3)' }}>
               <Award size={32} />
            </div>
            <div>
               <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>Global Benchmarking</h3>
               <p style={{ color: '#94a3b8', fontWeight: '600' }}>Where you stand against the average and the elite warriors.</p>
            </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '60px', alignItems: 'center' }}>
            <div style={{ height: '300px' }}>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData}>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                     <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                     <Bar dataKey="xp" radius={[10, 10, 0, 0]}>
                        {comparisonChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>

            <div>
               <div className="glass" style={{ background: '#f8fafc', padding: '32px', borderRadius: '24px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                        <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Elite Status Gap</p>
                        <h4 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b' }}>{Math.max(0, comparisonData.eliteXp - comparisonData.yourXp).toLocaleString()} XP</h4>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Performance Rank</p>
                        <span style={{ background: 'var(--primary)', color: 'white', padding: '6px 16px', borderRadius: '100px', fontWeight: '800', fontSize: '14px' }}>Top 15%</span>
                     </div>
                  </div>
               </div>
               
               <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', fontWeight: '500' }}>
                 Your current performance is <strong style={{ color: '#10b981' }}>{Math.round((comparisonData.yourXp / comparisonData.avgXp) * 100)}% higher</strong> than the average warrior. 
                 To reach the "Elite" status and join the top 1%, focus on completing 3 more High-XP Epic Quests this week.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
