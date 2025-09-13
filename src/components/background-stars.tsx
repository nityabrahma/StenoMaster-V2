
'use client';
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, MotionValue, animate } from 'framer-motion';

const NUM_STARS = 150;

interface StarData {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  parallaxFactor: number;
}

interface StarProps {
  star: StarData;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  isInteracting: boolean;
}

const Star = ({ star, mouseX, mouseY, isInteracting }: StarProps) => {
  const [isClient, setIsClient] = useState(false);
  
  // Motion values for the star's base position
  const starX = useMotionValue(star.x);
  const starY = useMotionValue(star.y);

  // Parallax transformations that are active only when interacting
  const parallaxX = useTransform(mouseX, (val) => {
    if (!isClient || !isInteracting) return 0;
    return (val - window.innerWidth / 2) * star.parallaxFactor;
  });
  const parallaxY = useTransform(mouseY, (val) => {
    if (!isClient || !isInteracting) return 0;
    return (val - window.innerHeight / 2) * star.parallaxFactor;
  });

  useEffect(() => {
    setIsClient(true);
    // Initial animation for drifting
    const controlsX = animate(starX, [star.x, star.x - window.innerWidth * 1.5], {
        duration: 50 + Math.random() * 50,
        repeat: Infinity,
        repeatType: 'loop',
    });
    const controlsY = animate(starY, [star.y, star.y + window.innerHeight * 1.5], {
        duration: 50 + Math.random() * 50,
        repeat: Infinity,
        repeatType: 'loop',
    });

    return () => {
        controlsX.stop();
        controlsY.stop();
    }
  }, [star.x, star.y, starX, starY]);

  // The final position is the sum of the drifting animation and the interactive parallax
  const x = useTransform([starX, parallaxX], ([base, parallax]) => base + parallax);
  const y = useTransform([starY, parallaxY], ([base, parallax]) => base + parallax);

  if (!isClient) {
    return null;
  }

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
};


const BackgroundStars = () => {
  const [stars, setStars] = useState<StarData[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const generatedStars = Array.from({ length: NUM_STARS }).map(() => ({
      id: Math.random().toString(36).substring(2, 9),
      x: Math.random() * window.innerWidth * 1.5,
      y: Math.random() * window.innerHeight * 1.5 - (window.innerHeight * 0.5),
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      parallaxFactor: Math.random() * 0.02 + 0.01,
    }));
    setStars(generatedStars);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    const handleMouseEnter = () => setIsInteracting(true);
    const handleMouseLeave = () => setIsInteracting(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseenter', handleMouseEnter);
        window.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [isClient, mouseX, mouseY]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none bg-background">
      {stars.map((star) => (
        <Star key={star.id} star={star} mouseX={mouseX} mouseY={mouseY} isInteracting={isInteracting} />
      ))}
    </div>
  );
};

export default BackgroundStars;
