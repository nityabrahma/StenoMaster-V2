
'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  motion,
  useMotionValue,
  animate,
  useAnimation,
  useTransform,
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
  mouseX: number;
  mouseY: number;
  isMouseMoving: boolean;
}

const Star = ({ star, mouseX, mouseY, isMouseMoving }: StarProps) => {
  const animatedX = useMotionValue(star.x);
  const animatedY = useMotionValue(star.y);
  const driftControls = useAnimation();
  const [isDrifting, setIsDrifting] = useState(true);

  const startDrift = useCallback(async () => {
    setIsDrifting(true);
    await driftControls.start({
      x: [star.x, star.x - window.innerWidth * 1.5],
      y: [star.y, star.y + window.innerHeight * 1.5],
      transition: {
        duration: 40 + Math.random() * 40, // Increased speed
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'linear',
      },
    });
  }, [driftControls, star.x, star.y]);

  const stopDrift = useCallback(() => {
    setIsDrifting(false);
    driftControls.stop();
    // Capture current position from motion values
    animatedX.set(driftControls.get().x || animatedX.get());
    animatedY.set(driftControls.get().y || animatedY.get());
  }, [driftControls, animatedX, animatedY]);

  useEffect(() => {
    if (isMouseMoving) {
      if (isDrifting) stopDrift();
    } else {
      if (!isDrifting) startDrift();
    }
  }, [isMouseMoving, isDrifting, startDrift, stopDrift]);

  useEffect(() => {
    startDrift();
    return () => stopDrift();
  }, [startDrift, stopDrift]);

  const parallaxX = useTransform(
    useMotionValue(mouseX),
    (latest) => star.x + (latest - window.innerWidth / 2) * star.parallaxFactor
  );
  const parallaxY = useTransform(
    useMotionValue(mouseY),
    (latest) => star.y + (latest - window.innerHeight / 2) * star.parallaxFactor
  );

  return (
    <motion.div
      className="star absolute bg-white rounded-full"
      style={{
        width: star.size,
        height: star.size,
        x: isMouseMoving ? parallaxX : driftControls.get().x || animatedX,
        y: isMouseMoving ? parallaxY : driftControls.get().y || animatedY,
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

  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const movementTimeout = useRef<NodeJS.Timeout | null>(null);

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
      parallaxFactor: Math.random() * 0.04 + 0.02, // Increased follow distance
    }));

    setStars(generatedStars);

    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
      if (!isMouseMoving) {
        setIsMouseMoving(true);
      }

      if (movementTimeout.current) clearTimeout(movementTimeout.current);
      
      movementTimeout.current = setTimeout(() => {
        setIsMouseMoving(false);
      }, 150); // Inactivity timer
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (movementTimeout.current) clearTimeout(movementTimeout.current);
    };
  }, [isClient, isMouseMoving]);

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
