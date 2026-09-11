import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Search, Users, Hash, MessageSquare, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const socket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`);

const Chat = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [search, setSearch] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`);
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeChat) {
      const room = [user._id, activeChat._id].sort().join('_');
      socket.emit('join_room', room);

      const fetchMessages = async () => {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/messages/${activeChat._id}`);
          // Map backend structure to frontend structure
          const formatted = data.map(m => ({
            sender: m.sender === user._id ? user.username : activeChat.username,
            content: m.content,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: m.sender === user._id ? user.avatar : activeChat.avatar
          }));
          setMessages(formatted);
        } catch (err) {
          console.error(err);
        }
      };
      fetchMessages();
    }

    socket.on('receive_message', (data) => {
      if (activeChat && (data.senderId === activeChat._id || data.senderId === user._id)) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socket.on('user_typing', (data) => {
      if (activeChat && data.username === activeChat.username) {
        if (data.isTyping) {
          setTypingUser(data.username);
          setIsTyping(true);
        } else {
          setIsTyping(false);
        }
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [activeChat, user._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() && activeChat) {
      const room = [user._id, activeChat._id].sort().join('_');
      const msgData = {
        room,
        sender: user.username,
        senderId: user._id,
        recipientId: activeChat._id,
        content: input,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: user.avatar
      };

      // Emit to socket
      socket.emit('send_message', msgData);
      
      // Save to database
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/messages`, {
        recipientId: activeChat._id,
        content: input,
        room
      });

      setMessages((prev) => [...prev, msgData]);
      setInput('');
      socket.emit('typing', { room, username: user.username, isTyping: false });
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (activeChat) {
      const room = [user._id, activeChat._id].sort().join('_');
      socket.emit('typing', { room, username: user.username, isTyping: e.target.value.length > 0 });
    }
  };

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="main-content" style={{ height: 'calc(100vh - 120px)', paddingBottom: '0' }}>
      <div style={{ display: 'flex', gap: '32px', height: '100%' }}>
        
        {/* User Sidebar */}
        <div className="glass" style={{ width: '320px', display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 className="card-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Messages</h2>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
              <input 
                type="text" 
                placeholder="Search legends..." 
                className="input" 
                style={{ paddingLeft: '44px', background: '#f8fafc', fontSize: '14px' }} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {filteredUsers.length > 0 ? filteredUsers.map((u) => (
              <div 
                key={u._id} 
                onClick={() => setActiveChat(u)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '14px', 
                  padding: '12px 16px', 
                  borderRadius: '16px', 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeChat?._id === u._id ? 'var(--primary-light)' : 'transparent',
                  marginBottom: '8px'
                }}
                className="user-list-item"
              >
                <div style={{ position: 'relative' }}>
                  <img src={u.avatar} style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f1f5f9' }} alt="" />
                  <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#10b981', border: '2px solid white', borderRadius: '50%' }}></div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: activeChat?._id === u._id ? 'var(--primary)' : '#1e293b' }}>{u.username}</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>Lvl {u.level}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <Flame size={12} fill="#f97316" color="#f97316" /> {u.streak} day streak
                  </p>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Users size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>No legends found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {activeChat ? (
          <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '20px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={activeChat.avatar} style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f8fafc' }} alt="" />
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{activeChat.username}</h2>
                  <p style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>• Online</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <button className="btn-action" style={{ background: '#f0f9ff', color: 'var(--primary)', padding: '10px' }}>
                    <MessageSquare size={20} />
                 </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {messages.length > 0 ? messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    flexDirection: msg.sender === user.username ? 'row-reverse' : 'row' 
                  }}
                >
                  <img src={msg.avatar} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f8fafc', flexShrink: 0 }} alt="" />
                  <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: msg.sender === user.username ? 'flex-end' : 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', padding: '0 4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>{msg.sender}</span>
                      <span style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: '600' }}>{msg.time}</span>
                    </div>
                    <div style={{ 
                      padding: '12px 20px', 
                      borderRadius: '16px', 
                      fontSize: '14px', 
                      fontWeight: '500',
                      lineHeight: '1.5',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      background: msg.sender === user.username ? 'var(--primary)' : 'white',
                      color: msg.sender === user.username ? 'white' : '#334155',
                      border: msg.sender === user.username ? 'none' : '1px solid #f1f5f9',
                      borderTopRightRadius: msg.sender === user.username ? '0' : '16px',
                      borderTopLeftRadius: msg.sender === user.username ? '16px' : '0',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                   <div className="logo-circle" style={{ transform: 'scale(0.8)', opacity: 0.5, marginBottom: '20px' }}>F</div>
                   <p style={{ fontWeight: '700' }}>Start a conversation with {activeChat.username}</p>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '24px 32px' }}>
              <AnimatePresence>
                {isTyping && (
                  <motion.p 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', fontStyle: 'italic', marginBottom: '8px', marginLeft: '4px' }}
                  >
                    {typingUser} is typing...
                  </motion.p>
                )}
              </AnimatePresence>
              <form onSubmit={sendMessage} style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={input}
                  onChange={handleTyping}
                  placeholder={`Send a message to ${activeChat.username}...`}
                  className="input"
                  style={{ paddingRight: '60px', background: 'white' }}
                />
                <button 
                  type="submit"
                  style={{ position: 'absolute', right: '8px', top: '8px', padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)' }}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
             <motion.div 
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0] 
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  background: 'var(--primary-light)', 
                  borderRadius: '40px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'var(--primary)', 
                  marginBottom: '32px',
                  boxShadow: '0 20px 40px rgba(14, 165, 233, 0.15)'
                }}
             >
                <MessageSquare size={64} />
             </motion.div>
             <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>Select a Legend to Chat</h2>
             <p style={{ maxWidth: '360px', color: '#64748b', fontSize: '16px', fontWeight: '500', lineHeight: '1.6' }}>
                Connect with other athletes, share tips, and dominate the leaderboards together.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
