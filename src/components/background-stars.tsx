'use client';
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const NUM_STARS = 150;

interface Star {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  parallaxFactor: number;
}

const BackgroundStars = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [isClient, setIsClient] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const generatedStars = Array.from({ length: NUM_STARS }).map(() => ({
      id: Math.random().toString(36).substring(2, 9),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      parallaxFactor: Math.random() * 0.02 + 0.01, // Different parallax effect per star
    }));
    setStars(generatedStars);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isClient, mouseX, mouseY]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
      {stars.map((star) => {
        const x = useTransform(mouseX, (val) => star.x + (val - window.innerWidth / 2) * star.parallaxFactor);
        const y = useTransform(mouseY, (val) => star.y + (val - window.innerHeight / 2) * star.parallaxFactor);

        return (
          <motion.div
            key={star.id}
            className="star absolute bg-white rounded-full"
            style={{
              width: star.size,
              height: star.size,
              x,
              y,
              animationName: 'twinkle',
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: `${star.delay}s`,
            }}
          />
        );
      })}
    </div>
  );
};

export default BackgroundStars;
