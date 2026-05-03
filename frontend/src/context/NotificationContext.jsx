import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();
const socket = io('http://localhost:5000');

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadChat, setUnreadChat] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Hydration Goal', message: 'Time to drink a glass of water! Stay hydrated, Warrior.', time: 'Just now', type: 'health' },
    { id: 2, title: 'Daily Tip', message: 'Try adding 5 minutes of stretching after your workout to improve flexibility.', time: '2h ago', type: 'tip' }
  ]);

  const motivationalQuotes = [
    "The only bad workout is the one that didn't happen.",
    "Your body can stand almost anything. It’s your mind that you have to convince.",
    "Fitness is not about being better than someone else. It’s about being better than you were yesterday.",
    "Success starts with self-discipline."
  ];

  const healthTips = [
    "Eat more protein to help your muscles recover faster.",
    "Sleep is just as important as exercise. Aim for 7-8 hours.",
    "Don't forget to warm up before lifting heavy weights.",
    "Consistency is key. Small daily improvements lead to big results."
  ];

  useEffect(() => {
    if (user?._id) {
      socket.emit('join_personal_room', user._id);
    }

    socket.on('new_message_notification', (data) => {
      if (window.location.pathname !== '/chat') {
        setUnreadChat(true);
      }
    });

    // Add a random motivational quote or tip every 5 minutes (demo: every 30s)
    const interval = setInterval(() => {
      const isQuote = Math.random() > 0.5;
      const list = isQuote ? motivationalQuotes : healthTips;
      const text = list[Math.floor(Math.random() * list.length)];
      
      addNotification({
        title: isQuote ? 'Motivation' : 'Health Tip',
        message: text,
        time: 'Just now',
        type: isQuote ? 'tip' : 'health'
      });
    }, 60000); // 1 minute for demo

    return () => {
      socket.off('new_message_notification');
      clearInterval(interval);
    };
  }, [user?._id]);

  const clearUnreadChat = () => setUnreadChat(false);

  const addNotification = (notif) => {
    setNotifications(prev => [{ id: Date.now(), ...notif }, ...prev].slice(0, 5)); // Keep last 5
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <NotificationContext.Provider value={{ unreadChat, notifications, clearUnreadChat, addNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
