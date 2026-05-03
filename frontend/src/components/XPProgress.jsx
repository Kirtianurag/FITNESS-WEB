import React from 'react';
import { motion } from 'framer-motion';

const XPProgress = ({ currentXp, maxXp, level }) => {
  const percentage = Math.min((currentXp / maxXp) * 100, 100);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>Lvl {level}</span>
          <span style={{ marginLeft: '12px', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Warrior Rank</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{currentXp}</span>
          <span style={{ color: '#94a3b8', fontWeight: '600', fontSize: '14px' }}> / {maxXp} XP</span>
        </div>
      </div>
      <div className="xp-bar">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="xp-bar-fill"
        />
      </div>
    </div>
  );
};

export default XPProgress;
