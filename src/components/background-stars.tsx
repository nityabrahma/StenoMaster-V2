
'use client';
import { useMemo } from 'react';

const BackgroundStars = () => {
  const stars = useMemo(() => {
    const starElements = [];
    const numStars = 200;
    for (let i = 0; i < numStars; i++) {
      const style = {
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
        width: `${Math.random() * 2 + 1}px`,
        height: `${Math.random() * 2 + 1}px`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 5 + 5}s`,
      };
      starElements.push(<div key={i} className="star" style={style}></div>);
    }
    return starElements;
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
      <style jsx>{`
        @keyframes twinkle {
          0% {
            opacity: 0.5;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }
        .star {
          position: absolute;
          background-color: white;
          border-radius: 50%;
          opacity: 0.5;
          animation: twinkle infinite linear;
        }
      `}</style>
      {stars}
    </div>
  );
};

export default BackgroundStars;
