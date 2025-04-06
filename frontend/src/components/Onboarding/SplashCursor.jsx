import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const SplashCursor = ({
  color = "#a855f7",
  size = 400,
  blur = 100,
  trail = true,
  trailLength = 8,
  springConfig = { damping: 25, stiffness: 200 }
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trailPositions, setTrailPositions] = useState([]);
  const cursorX = useSpring(useMotionValue(0), springConfig);
  const cursorY = useSpring(useMotionValue(0), springConfig);

  useEffect(() => {
    const updateMousePosition = (e) => {
      const { clientX, clientY } = e;
      setMousePosition({ x: clientX, y: clientY });
      cursorX.set(clientX);
      cursorY.set(clientY);

      if (trail) {
        setTrailPositions(prev => {
          const newPositions = [{ x: clientX, y: clientY }, ...prev];
          return newPositions.slice(0, trailLength);
        });
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [cursorX, cursorY, trail, trailLength]);

  return (
    <>
      {trail && trailPositions.map((pos, i) => (
        <motion.div
          key={i}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: size * (1 - i / trailLength * 0.5),
            height: size * (1 - i / trailLength * 0.5),
            backgroundColor: color,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 9999,
            opacity: 0.15 * (1 - i / trailLength),
            filter: `blur(${blur * (i / trailLength)}px)`,
            transform: `translate(${pos.x - (size/2)}px, ${pos.y - (size/2)}px)`
          }}
        />
      ))}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10000,
          opacity: 0.3,
          filter: `blur(${blur}px)`,
          transform: `translate(${mousePosition.x - (size/2)}px, ${mousePosition.y - (size/2)}px)`
        }}
      />
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: size * 0.3,
          height: size * 0.3,
          backgroundColor: 'white',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10001,
          opacity: 0.8,
          filter: `blur(${blur * 0.2}px)`,
          transform: `translate(${mousePosition.x - (size * 0.15)}px, ${mousePosition.y - (size * 0.15)}px)`
        }}
      />
    </>
  );
};

export default SplashCursor; 