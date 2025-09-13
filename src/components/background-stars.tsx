
'use client';
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  motion,
  useMotionValue,
  MotionValue,
  animate,
  AnimationPlaybackControls,
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
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  isMoving: boolean;
}

const Star = ({ star, mouseX, mouseY, isMoving }: StarProps) => {
  const [isClient, setIsClient] = useState(false);

  const animatedX = useMotionValue(star.x);
  const animatedY = useMotionValue(star.y);

  const [driftAnimation, setDriftAnimation] = useState<{ x: AnimationPlaybackControls, y: AnimationPlaybackControls } | null>(null);

  const startDrift = useCallback(() => {
    const animX = animate(
        animatedX, 
        [star.x, star.x - window.innerWidth * 1.5], 
        { duration: 50 + Math.random() * 50, repeat: Infinity, ease: "linear", repeatType: "loop" }
    );
    const animY = animate(
        animatedY,
        [star.y, star.y + window.innerHeight * 1.5],
        { duration: 50 + Math.random() * 50, repeat: Infinity, ease: "linear", repeatType: "loop" }
    );
    setDriftAnimation({ x: animX, y: animY });
  }, [animatedX, animatedY, star.x, star.y]);

  useEffect(() => {
    setIsClient(true);
    startDrift();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isClient) {
      if (isMoving) {
        if (driftAnimation) {
          driftAnimation.x.stop();
          driftAnimation.y.stop();
          setDriftAnimation(null);
        }
        const unsubscribeX = mouseX.on('change', (latest) => {
          const targetX =
            animatedX.get() +
            (latest - window.innerWidth / 2) * star.parallaxFactor * 0.1;
          animate(animatedX, targetX, { duration: 0.05, ease: 'linear' });
        });
        const unsubscribeY = mouseY.on('change', (latest) => {
          const targetY =
            animatedY.get() +
            (latest - window.innerHeight / 2) * star.parallaxFactor * 0.1;
          animate(animatedY, targetY, { duration: 0.05, ease: 'linear' });
        });

        return () => {
          unsubscribeX();
          unsubscribeY();
        };
      } else if (!driftAnimation) {
        startDrift();
      }
    }
  }, [
    isClient,
    isMoving,
    driftAnimation,
    startDrift,
    mouseX,
    mouseY,
    animatedX,
    animatedY,
    star.parallaxFactor,
  ]);

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
  const [isMoving, setIsMoving] = useState(false);
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      y: Math.random() * window.innerHeight * 1.5 - window.innerHeight * 0.5,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      parallaxFactor: Math.random() * 0.03 + 0.02,
    }));
    setStars(generatedStars);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (!isMoving) {
        setIsMoving(true);
      }

      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }

      moveTimeoutRef.current = setTimeout(() => {
        setIsMoving(false);
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          isMoving={isMoving}
        />
      ))}
    </div>
  );
};

export default BackgroundStars;
