import React, { useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Lightbulb, LightbulbOff } from 'lucide-react';

interface AnimatedLampProps {
  onLightToggle: (isLit: boolean) => void;
  isLit: boolean;
}

export const AnimatedLamp: React.FC<AnimatedLampProps> = ({ onLightToggle, isLit }) => {
  const [isPulled, setIsPulled] = useState(false);
  const controls = useAnimation();
  const y = useMotionValue(0);
  const scale = useTransform(y, [0, -50], [1, 0.8]);
  const rotate = useTransform(y, [0, -50], [0, -5]);
  
  const handleDragEnd = async () => {
    const currentY = y.get();
    console.log('Drag ended at Y position:', currentY);
    
    // Animate the lamp being pulled
    await controls.start({
      y: -40,
      scale: 0.8,
      rotate: -5,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    });
    
    // Add a slight bounce back
    await controls.start({
      y: -35,
      scale: 0.85,
      rotate: -3,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    });
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Lamp Chain */}
      <motion.div
        className={`w-2 h-16 rounded-full mb-3 shadow-xl ${
          isLit 
            ? 'bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 shadow-yellow-500/50' 
            : 'bg-gradient-to-b from-gray-300 to-gray-600 shadow-gray-500/30'
        }`}
        animate={{
          height: isPulled ? 20 : 64,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      
      {/* Lamp Body */}
      <motion.div
        drag="y"
        dragConstraints={{ top: -60, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={() => {
          console.log('Drag started');
          // Toggle immediately when drag starts
          const newLightState = !isLit;
          console.log('Lamp toggled from', isLit, 'to', newLightState);
          onLightToggle(newLightState);
          if (!isPulled) {
            setIsPulled(true);
          }
        }}
        onDrag={(event, info) => console.log('Dragging, Y:', info.offset.y)}
        onDragEnd={handleDragEnd}
        onClick={() => {
          console.log('Lamp clicked - toggling light');
          const newLightState = !isLit;
          onLightToggle(newLightState);
          if (!isPulled) {
            setIsPulled(true);
          }
        }}
        animate={controls}
        style={{ y, scale, rotate }}
        className="relative cursor-grab active:cursor-grabbing"
      >
        {/* Lamp Shade */}
        <div className={`w-28 h-24 rounded-t-full shadow-2xl relative border-3 ${
          isLit 
            ? 'bg-gradient-to-b from-yellow-50 via-yellow-200 to-amber-400 border-amber-500 shadow-amber-500/60' 
            : 'bg-gradient-to-b from-gray-100 to-gray-500 border-gray-600 shadow-gray-600/40'
        }`}>
          {/* Light Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-yellow-200 via-yellow-300 to-transparent rounded-t-full"
            animate={{
              opacity: isLit ? [0.5, 1, 0.5] : 0,
            }}
            transition={{
              duration: 2,
              repeat: isLit ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
          {/* Shade Highlight */}
          <div className="absolute inset-0 rounded-t-full bg-gradient-to-b from-white/30 via-transparent to-transparent" />
          {/* Shade Pattern */}
          <div className="absolute inset-2 rounded-t-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>
        
        {/* Lamp Base */}
        <div className={`w-24 h-12 rounded-b-full shadow-2xl mx-auto border-3 ${
          isLit 
            ? 'bg-gradient-to-b from-amber-300 via-amber-500 to-amber-800 border-amber-600 shadow-amber-600/60' 
            : 'bg-gradient-to-b from-gray-300 to-gray-700 border-gray-600 shadow-gray-600/40'
        }`}>
          {/* Base Highlight */}
          <div className="absolute inset-0 rounded-b-full bg-gradient-to-b from-white/20 via-transparent to-transparent" />
          {/* Base Pattern */}
          <div className="absolute inset-1 rounded-b-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        </div>
        
        {/* Light Bulb */}
        <motion.div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
          animate={{
            scale: isLit ? [1, 1.3, 1] : 1,
            rotate: isLit ? [0, 2, -2, 0] : 0,
          }}
          transition={{
            duration: 1.8,
            repeat: isLit ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {isLit ? (
            <div className="relative">
              <Lightbulb className="w-10 h-10 text-yellow-100 drop-shadow-2xl" />
              <motion.div
                className="absolute inset-0 w-10 h-10 bg-yellow-200 rounded-full blur-md"
                animate={{
                  opacity: [0.4, 0.9, 0.4],
                  scale: [0.7, 1.3, 0.7],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          ) : (
            <LightbulbOff className="w-10 h-10 text-gray-400 drop-shadow-lg" />
          )}
        </motion.div>
      </motion.div>
      
      {/* Light Rays */}
      {isLit && (
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-28 bg-gradient-to-b from-yellow-200 via-yellow-300 to-transparent rounded-full shadow-lg"
              style={{
                transformOrigin: 'bottom center',
                transform: `rotate(${i * 22.5}deg)`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scaleY: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      )}
      
       {/* Instructions */}
       <motion.div
         className="mt-4 text-center"
         animate={{
           y: [0, -5, 0],
         }}
         transition={{
           duration: 2,
           repeat: Infinity,
           ease: "easeInOut"
         }}
       >
         <p className={`text-base font-bold px-6 py-3 rounded-xl backdrop-blur-md shadow-lg ${
           isLit 
             ? 'text-yellow-100 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border-2 border-yellow-400/50 shadow-yellow-500/30' 
             : 'text-amber-200 bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-2 border-amber-400/50 shadow-amber-500/30'
         }`}>
           {isLit ? 'Pull or click to turn off' : 'Pull or click to turn on'}
         </p>
         
         <motion.div
           className="w-6 h-6 mx-auto mt-3"
           animate={{
             y: [0, 4, 0],
           }}
           transition={{
             duration: 1.2,
             repeat: Infinity,
             ease: "easeInOut"
           }}
         >
           <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full ${
             isLit ? 'text-yellow-300' : 'text-amber-400'
           }`}>
             <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
         </motion.div>
       </motion.div>
    </div>
  );
};