import React from 'react';
import { Home, Trophy, MessageSquare, BarChart2, User, LogOut, Sword, Utensils } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { useNotifications } from '../context/NotificationContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { unreadChat, clearUnreadChat } = useNotifications();

  const menuItems = [
    { icon: <Home size={22} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Sword size={22} />, label: 'Quests', path: '/quests' },
    { icon: <Trophy size={22} />, label: 'Leaderboard', path: '/leaderboard' },
    { icon: (
      <div style={{ position: 'relative' }}>
        <MessageSquare size={22} />
        {unreadChat && <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></div>}
      </div>
    ), label: 'Chat', path: '/chat' },
    { icon: <BarChart2 size={22} />, label: 'Analytics', path: '/analytics' },
    { icon: <Utensils size={22} />, label: 'Nutrition', path: '/nutrition' },
    { icon: <User size={22} />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="glass sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 10px' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white', fontWeight: '800', fontSize: '20px', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)', paddingLeft: '11px' }}>
          F
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
          FITQUEST
        </h1>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => {
              if (item.label === 'Chat') clearUnreadChat();
            }}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <button
        onClick={logout}
        className="nav-item"
        style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', marginTop: 'auto' }}
      >
        <LogOut size={22} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
