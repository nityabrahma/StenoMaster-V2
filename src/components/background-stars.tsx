
'use client';
import React, { useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  MotionValue,
  animate,
  AnimationControls,
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
  isInteracting: boolean;
}

const Star = ({ star, mouseX, mouseY, isInteracting }: StarProps) => {
  const [isClient, setIsClient] = useState(false);
  
  const animatedX = useMotionValue(star.x);
  const animatedY = useMotionValue(star.y);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let controlsX: AnimationControls | undefined;
    let controlsY: AnimationControls | undefined;

    const startDrift = () => {
        const driftX = animate(animatedX, [animatedX.get(), star.x - window.innerWidth * 1.5], {
            duration: 50 + Math.random() * 50,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
        });
        const driftY = animate(animatedY, [animatedY.get(), star.y + window.innerHeight * 1.5], {
            duration: 50 + Math.random() * 50,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
        });
        
        return { driftX, driftY };
    };

    if (isClient && !isInteracting) {
      const { driftX, driftY } = startDrift();
      
      return () => {
          driftX.stop();
          driftY.stop();
      };
    }
  }, [isClient, isInteracting, animatedX, animatedY, star.x, star.y]);

  useEffect(() => {
    if (!isClient) return;

    if (isInteracting) {
      const unsubscribeX = mouseX.on('change', (latest) => {
        const targetX = animatedX.get() + (latest - window.innerWidth / 2) * star.parallaxFactor;
         animate(animatedX, targetX, { duration: 0.05, ease: "linear"});
      });
      const unsubscribeY = mouseY.on('change', (latest) => {
        const targetY = animatedY.get() + (latest - window.innerHeight / 2) * star.parallaxFactor;
        animate(animatedY, targetY, { duration: 0.05, ease: "linear"});
      });

      return () => {
        unsubscribeX();
        unsubscribeY();
      };
    }
  }, [isClient, isInteracting, mouseX, mouseY, star.parallaxFactor, animatedX, animatedY]);
  
  if (!isClient) return null;

  return (
    <motion.div
      className="star absolute bg-white rounded-full"
      style={{
        width: star.size,
        height: star.size,
        x: animatedX,
        y: animatedY,
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
      y:
        Math.random() * window.innerHeight * 1.5 -
        window.innerHeight * 0.5,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      parallaxFactor: Math.random() * 0.03 + 0.02,
    }));
    setStars(generatedStars);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseEnter = () => setIsInteracting(true);
    const handleMouseLeave = () => setIsInteracting(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isClient, mouseX, mouseY]);

  if (!isClient) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none bg-background">
      {stars.map((star) => (
        <Star
          key={star.id}
          star={star}
          mouseX={mouseX}
          mouseY={mouseY}
          isInteracting={isInteracting}
        />
      ))}
    </div>
  );
};

export default BackgroundStars;
