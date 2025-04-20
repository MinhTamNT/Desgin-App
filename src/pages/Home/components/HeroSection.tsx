import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  userName?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ userName }) => {
  const navigate = useNavigate();
  
  return (
    <section className="relative overflow-hidden text-white py-32 md:py-40">
      <div className="absolute inset-0 bg-gray-800/90 mix-blend-multiply z-10" />
      
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="https://cdn.prod.website-files.com/62bac7754ea6d7967db80305/65d6f41364044a20584b6dea_CZ_Main_Compress-transcode.mp4"
      />
      

      
      <div className="relative z-20 container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block mb-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium border border-white/20"
            >
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
            >
              <span className="text-white">
                Welcome Back, {userName || "Creative User"}!
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg sm:text-xl text-blue-100 mb-8 md:mb-10 max-w-2xl mx-auto"
            >
              Transform your ideas into reality with our collaborative design platform.
              Create, share, and bring your visions to life.
            </motion.p>
            
      
          </motion.div>
        </div>
      </div>
    </section>
  );
};
