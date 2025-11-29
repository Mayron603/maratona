import React, { useState, useEffect } from 'react';
import { Gift, Sparkles } from 'lucide-react';

export default function ChristmasCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isChristmas, setIsChristmas] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const christmas = new Date(now.getFullYear(), 11, 25);
      
      if (now > christmas) {
        christmas.setFullYear(christmas.getFullYear() + 1);
      }

      const diff = christmas - now;
      
      if (diff <= 0) {
        setIsChristmas(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isChristmas) {
    return (
      <div className="bg-gradient-to-r from-red-600 to-green-600 rounded-2xl p-6 text-center text-white">
        <Gift className="w-12 h-12 mx-auto mb-2 animate-bounce" />
        <h3 className="text-2xl font-bold">🎄 Feliz Natal! 🎄</h3>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-red-600/90 to-red-800/90 backdrop-blur-sm rounded-2xl p-6 text-white shadow-xl border border-red-400/30">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
        <h3 className="text-lg font-semibold">Contagem para o Natal</h3>
        <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[
          { value: timeLeft.days, label: 'Dias' },
          { value: timeLeft.hours, label: 'Horas' },
          { value: timeLeft.minutes, label: 'Min' },
          { value: timeLeft.seconds, label: 'Seg' }
        ].map((item, i) => (
          <div key={i} className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-3xl font-bold text-yellow-300">{String(item.value).padStart(2, '0')}</div>
            <div className="text-xs text-white/80">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}