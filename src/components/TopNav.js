import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';

const TopNav = () => {
  const [lastScrollY, setLastScrollY] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        controls.start({ y: '-100%', transition: { duration: 0.3 } });
      } else {
        controls.start({ y: 0, transition: { duration: 0.3 } });
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, controls]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 bg-white shadow-md z-50"
      initial={{ y: 0 }}
      animate={controls}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-teal-600">EnergyTrade</Link>
          <div className="flex items-center space-x-4">
            <Link to="/about" className="text-gray-600 hover:text-teal-600">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-teal-600">Contact</Link>
            <Link to="auth/login" className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition duration-300">Login</Link>
            <Link to="auth/login" className="bg-white text-teal-600 px-4 py-2 rounded-full border border-teal-600 hover:bg-teal-50 transition duration-300">Sign Up</Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default TopNav;

