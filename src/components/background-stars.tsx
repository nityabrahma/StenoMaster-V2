'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  animate,
  useAnimation,
  MotionValue,
} from 'framer-motion';

const NUM_STARS = 250;

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
  isMouseMoving: boolean;
}

const Star = ({ star, mouseX, mouseY, isMouseMoving }: StarProps) => {
  const x = useSpring(star.x, { stiffness: 40, damping: 15 });
  const y = useSpring(star.y, { stiffness: 40, damping: 15 });

  const driftControls = useAnimation();
  const drifting = useRef(true);

  const startDrift = useCallback(() => {
    drifting.current = true;
    driftControls.start({
      x: [x.get(), star.x - window.innerWidth * 1.5],
      y: [y.get(), star.y + window.innerHeight * 1.5],
      transition: {
        duration: 60 + Math.random() * 30,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'linear',
      },
    });
  }, [driftControls, star.x, star.y, x, y]);

  const stopDrift = useCallback(() => {
    drifting.current = false;
    driftControls.stop();
  }, [driftControls]);

  useEffect(() => {
    if (isMouseMoving) {
      // smoothly interrupt drift and follow cursor
      stopDrift();

      const targetX =
        star.x + (mouseX.get() - window.innerWidth / 2) * star.parallaxFactor;
      const targetY =
        star.y + (mouseY.get() - window.innerHeight / 2) * star.parallaxFactor;

      x.set(targetX);
      y.set(targetY);
    } else {
      // smoothly transition back into drifting
      if (!drifting.current) {
        startDrift();
      }
    }
  }, [isMouseMoving, mouseX, mouseY, star, x, y, startDrift, stopDrift]);

  useEffect(() => {
    startDrift();
    return () => stopDrift();
  }, [startDrift, stopDrift]);

  return (
    <motion.div
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
      animate={driftControls}
    />
  );
};

const BackgroundStars = () => {
  const [stars, setStars] = useState<StarData[]>([]);
  const [isClient, setIsClient] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const generatedStars = Array.from({ length: NUM_STARS }).map(() => ({
      id: Math.random().toString(36).substring(2, 9),
      x: Math.random() * window.innerWidth * 1.5,
      y: Math.random() * window.innerHeight * 1.5 - window.innerHeight * 0.5,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      parallaxFactor: Math.random() * 0.04 + 0.02,
    }));

    setStars(generatedStars);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      setIsMouseMoving(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setIsMouseMoving(false);
      }, 150); // slightly longer delay makes smoother fallback
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isClient]);

  if (!isClient) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none bg-background">
      {stars.map((star) => (
        <Star
          key={star.id}
          star={star}
          mouseX={mouseX}
          mouseY={mouseY}
          isMouseMoving={isMouseMoving}
        />
      ))}
    </div>
  );
};

export default BackgroundStars;
