import React, { useEffect, useState, useMemo } from 'react';

export default function SnowEffect({ enabled }) {
  const snowflakes = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 5 + Math.random() * 10,
      animationDelay: Math.random() * 8,
      size: 6 + Math.random() * 12,
      opacity: 0.5 + Math.random() * 0.5
    }));
  }, []);

  if (!enabled) return null;

  return (
    <>
      <style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute top-0"
            style={{
              left: `${flake.left}%`,
              animation: `snowfall ${flake.animationDuration}s linear ${flake.animationDelay}s infinite`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
            }}
          >
            <div 
              className="w-full h-full rounded-full bg-white shadow-lg"
              style={{
                opacity: flake.opacity,
                boxShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4)'
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}