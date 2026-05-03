import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop"
];

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      {/* Background Slideshow */}
      <AnimatePresence>
        <motion.div
          key={currentImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${images[currentImage]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
        zIndex: 1
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="logo-circle" style={{ margin: '0 auto 30px', transform: 'scale(1.5)' }}>F</div>
          <h1 style={{ fontSize: '72px', fontWeight: '900', marginBottom: '20px', letterSpacing: '-2px' }}>
            FITQUEST
          </h1>
          <p style={{ fontSize: '24px', fontWeight: '500', maxWidth: '600px', margin: '0 auto 48px', opacity: 0.9 }}>
            The ultimate gamified fitness experience. Level up your body, earn rewards, and join the community.
          </p>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
              style={{ padding: '20px 60px', fontSize: '20px', width: 'auto' }}
            >
              Start Your Quest
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Bottom Text */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '0',
        right: '0',
        zIndex: 2,
        textAlign: 'center',
        color: 'white',
        opacity: 0.6,
        fontSize: '14px',
        fontWeight: '600',
        letterSpacing: '2px',
        textTransform: 'uppercase'
      }}>
        Every Drop of Sweat Counts
      </div>
    </div>
  );
};

export default Home;
