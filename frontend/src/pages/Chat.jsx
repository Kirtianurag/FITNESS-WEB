import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Users, Hash, MessageSquare, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { socket } from '../socket';

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

  // Refs to prevent stale closures in socket callbacks
  const activeChatRef = useRef(activeChat);
  const currentRoomRef = useRef(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Initial fetch of users
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

  // Room switching and message loading when activeChat changes
  useEffect(() => {
    if (!activeChat || !user?._id) return;

    const currentUserId = String(user._id);
    const partnerId = String(activeChat._id);
    const newRoom = [currentUserId, partnerId].sort().join('_');

    if (currentRoomRef.current && currentRoomRef.current !== newRoom) {
      socket.emit('leave_room', currentRoomRef.current);
    }
    currentRoomRef.current = newRoom;
    socket.emit('join_room', newRoom);

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/messages/${partnerId}`);
        const formatted = data.map(m => ({
          _id: m._id,
          sender: String(m.sender) === currentUserId ? user.username : activeChat.username,
          senderId: String(m.sender),
          recipientId: String(m.receiver),
          content: m.content,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: String(m.sender) === currentUserId ? user.avatar : activeChat.avatar
        }));
        setMessages(formatted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [activeChat?._id, user?._id]);

  // Persistent Socket Listeners for Real-Time Messages and Typing
  useEffect(() => {
    if (!user?._id) return;

    const currentUserId = String(user._id);

    const joinUser = () => {
      socket.emit('join_personal_room', currentUserId);
      if (activeChatRef.current) {
        const r = [currentUserId, String(activeChatRef.current._id)].sort().join('_');
        socket.emit('join_room', r);
      }
    };

    if (socket.connected) {
      joinUser();
    }
    socket.on('connect', joinUser);

    const handleReceiveMessage = (data) => {
      const active = activeChatRef.current;
      const dataSenderId = String(data.senderId || '');
      const dataRecipientId = String(data.recipientId || '');

      // 1. If currently in conversation with this person, display message live
      if (active && (dataSenderId === String(active._id) || dataSenderId === currentUserId)) {
        setMessages((prev) => {
          const isDuplicate = prev.some(m => 
            (m._id && data._id && String(m._id) === String(data._id)) ||
            (String(m.senderId) === dataSenderId && m.content === data.content && m.time === data.time)
          );
          if (isDuplicate) return prev;
          return [...prev, data];
        });
      }

      // 2. Bring the conversation partner to the TOP of the chat list
      const partnerId = dataSenderId === currentUserId ? dataRecipientId : dataSenderId;
      setUsers((prevUsers) => {
        const partnerIndex = prevUsers.findIndex(u => String(u._id) === partnerId);
        if (partnerIndex === -1) return prevUsers;
        const partner = prevUsers[partnerIndex];
        const isCurrentActive = activeChatRef.current && String(activeChatRef.current._id) === partnerId;

        const updatedPartner = {
          ...partner,
          lastMessage: data.content,
          lastMessageTime: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unreadCount: isCurrentActive ? 0 : ((partner.unreadCount || 0) + 1)
        };

        const others = prevUsers.filter(u => String(u._id) !== partnerId);
        return [updatedPartner, ...others];
      });
    };

    const handleUserTyping = (data) => {
      if (activeChatRef.current && data.username === activeChatRef.current.username) {
        if (data.isTyping) {
          setTypingUser(data.username);
          setIsTyping(true);
        } else {
          setIsTyping(false);
        }
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('connect', joinUser);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [user?._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectChat = (u) => {
    setActiveChat(u);
    // Clear unread count for this user
    setUsers((prev) => prev.map(item => String(item._id) === String(u._id) ? { ...item, unreadCount: 0 } : item));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat || !user?._id) return;

    const currentUserId = String(user._id);
    const partnerId = String(activeChat._id);
    const room = [currentUserId, partnerId].sort().join('_');
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const contentToSend = input.trim();

    const msgData = {
      room,
      sender: user.username,
      senderId: currentUserId,
      recipientId: partnerId,
      content: contentToSend,
      time: currentTime,
      avatar: user.avatar
    };

    // Emit live to socket
    socket.emit('send_message', msgData);

    // Save to database
    axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/messages`, {
      recipientId: partnerId,
      content: contentToSend,
      room
    }).catch(err => console.error(err));

    // Update messages locally (with duplicate guard)
    setMessages((prev) => {
      const exists = prev.some(m => 
        String(m.senderId) === currentUserId && m.content === contentToSend && m.time === currentTime
      );
      if (exists) return prev;
      return [...prev, msgData];
    });

    setInput('');
    socket.emit('typing', { room, username: user.username, isTyping: false });

    // Move active chat partner to the top of the sidebar list
    setUsers((prevUsers) => {
      const partner = prevUsers.find(u => String(u._id) === partnerId);
      if (!partner) return prevUsers;
      const updatedPartner = {
        ...partner,
        lastMessage: contentToSend,
        lastMessageTime: currentTime,
        unreadCount: 0
      };
      const others = prevUsers.filter(u => String(u._id) !== partnerId);
      return [updatedPartner, ...others];
    });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (activeChat && user?._id) {
      const room = [String(user._id), String(activeChat._id)].sort().join('_');
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
                onClick={() => handleSelectChat(u)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '14px', 
                  padding: '12px 16px', 
                  borderRadius: '16px', 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: String(activeChat?._id) === String(u._id) ? 'var(--primary-light)' : 'transparent',
                  marginBottom: '8px'
                }}
                className="user-list-item"
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={u.avatar} style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f1f5f9' }} alt="" />
                  <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#10b981', border: '2px solid white', borderRadius: '50%' }}></div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '15px', 
                      fontWeight: '800', 
                      color: String(activeChat?._id) === String(u._id) ? 'var(--primary)' : '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {u.username}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', flexShrink: 0, marginLeft: '6px' }}>
                      {u.lastMessageTime || `Lvl ${u.level}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                    <p style={{ 
                      fontSize: '12px', 
                      color: u.unreadCount ? '#0f172a' : '#64748b', 
                      fontWeight: u.unreadCount ? '700' : '500', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      margin: 0
                    }}>
                      {u.lastMessage ? (
                        u.lastMessage
                      ) : (
                        <><Flame size={12} fill="#f97316" color="#f97316" /> {u.streak} day streak</>
                      )}
                    </p>
                    {u.unreadCount > 0 && (
                      <span style={{
                        background: 'var(--primary)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '800',
                        borderRadius: '9999px',
                        padding: '2px 7px',
                        marginLeft: '6px',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(14, 165, 233, 0.4)'
                      }}>
                        {u.unreadCount}
                      </span>
                    )}
                  </div>
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
