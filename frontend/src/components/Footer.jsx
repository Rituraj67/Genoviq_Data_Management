import React from 'react';
import { motion } from 'framer-motion';
import logo from "../assets/logo.png"



const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#0b1643ab] to-[#78160ff6] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex flex-col items-center md:items-start">
            <img
              src={logo}
              alt="Genoviq Logo"
              className="w-64 mb-4"
            />
            
          </div>
          
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4"></h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              
              
              
            </motion.div>
          </div>
          
          <div className="flex justify-center md:justify-end">
            <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-50">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'rgb(255,255,255)', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: 'rgb(255,255,255)', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <motion.path
                d="M100 20 L180 100 L100 180 L20 100 Z"
                fill="url(#grad1)"
                stroke="white"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <motion.circle
                cx="100"
                cy="100"
                r="50"
                fill="none"
                stroke="white"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.5 }}
                transition={{ duration: 1, delay: 1 }}
              />
              <motion.path
                d="M70 100 Q100 60 130 100 Q100 140 70 100"
                fill="none"
                stroke="white"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 2 }}
              />
            </svg>
          </div>
        </div>
        <p className="text-sm text-center opacity-80">© 2025 Genoviq Group of Companies. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
