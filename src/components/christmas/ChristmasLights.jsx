import React from 'react';

export default function ChristmasLights({ enabled }) {
  if (!enabled) return null;

  const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b6b', '#ffd93d'];
  
  return (
    <>
      <style>{`
        @keyframes blink-light {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.85); }
        }
      `}</style>
      <div className="fixed top-0 left-0 right-0 z-[90] pointer-events-none pt-0">
        <div className="flex justify-around items-start px-2">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-0.5 h-3 bg-green-800"/>
              <div 
                className="w-3 h-4 rounded-full"
                style={{
                  backgroundColor: colors[i % colors.length],
                  boxShadow: `0 0 8px ${colors[i % colors.length]}, 0 0 16px ${colors[i % colors.length]}`,
                  animation: `blink-light 1.5s ease-in-out ${i * 0.15}s infinite`
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}