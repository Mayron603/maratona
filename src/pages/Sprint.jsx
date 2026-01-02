import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, Square, Hourglass, PenTool } from 'lucide-react';
// Mantendo suas importações
import cronometroImg from '@/assets/cronometro.png';
import cronometroVideo from '@/assets/cronometro.mp4';
import ambientAudio from '@/assets/lofi.mp3';

export default function Sprint() {
  // --- Estados de Configuração ---
  const [topic, setTopic] = useState("");
  const [targetMinutes, setTargetMinutes] = useState("30");

  // --- Estados do Timer ---
  const [timeLeft, setTimeLeft] = useState(0); 
  const [initialTime, setInitialTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  
  const intervalRef = useRef(null);

  // Lógica do Cronômetro
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
             if (prev <= 1000) {
                 handleFinish(true);
                 return 0;
             }
             return prev - 1000;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  // --- FUNÇÕES ---
  const handleStart = () => {
      if (!topic) {
          alert("Defina o foco do estudo.");
          return;
      }
      const mins = parseInt(targetMinutes);
      if (!mins || mins <= 0) return;

      const durationMs = mins * 60 * 1000;
      setInitialTime(durationMs);
      setTimeLeft(durationMs);
      setStartTime(new Date());
      setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);
  const handleResume = () => setIsRunning(true);

  const handleFinish = (completed = false) => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    const studiedMs = initialTime - timeLeft;

    if (studiedMs < 1000 && !completed) {
        setTimeLeft(0);
        return;
    }

    // Salvar lógica (simplificada para visualização)
    try {
        const endTime = new Date();
        const safeStartTime = startTime || new Date(); 
        const formatDurationStr = (ms) => {
            const totalSeconds = Math.floor(ms / 1000);
            const h = Math.floor(totalSeconds / 3600).toString().padStart(2,'0');
            const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2,'0');
            const s = (totalSeconds % 60).toString().padStart(2,'0');
            return `${h}:${m}:${s}`;
        };

        const newRecord = {
            id: Date.now(),
            date: endTime.toISOString().split('T')[0],
            startTime: safeStartTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            totalDuration: formatDurationStr(studiedMs),
            seconds: Math.floor(studiedMs / 1000),
            notes: topic
        };

        const existingHistory = JSON.parse(localStorage.getItem('sprint_history') || '[]');
        localStorage.setItem('sprint_history', JSON.stringify([newRecord, ...existingHistory]));
        window.dispatchEvent(new Event('storage'));
        
        if (completed) alert(`Sessão Concluída: ${topic}`);
    } catch (error) { console.error(error); }
    
    setTimeLeft(0);
    setTopic("");
  };

  // Formatador de Tempo Minimalista
  const formatTime = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    const Digit = ({ value }) => (
      <span className="font-headline text-6xl md:text-8xl font-light tracking-tighter text-[#E2D1C3] drop-shadow-2xl">
        {value.toString().padStart(2, '0')}
      </span>
    );
    
    return (
      <div className="flex items-baseline gap-2 md:gap-4 select-none">
        <Digit value={hours} />
        <span className="text-4xl text-[#E2D1C3]/20 font-serif">:</span>
        <Digit value={minutes} />
        <span className="text-4xl text-[#E2D1C3]/20 font-serif">:</span>
        <Digit value={seconds} />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#050505] overflow-hidden font-serif z-50 flex flex-col items-center justify-center">
      
      {/* --- FUNDO ATMOSFÉRICO (Igual à Lista) --- */}
      <div className="absolute inset-0 z-0">
        {isRunning || timeLeft > 0 ? (
          <>
            <video 
              src={cronometroVideo} 
              autoPlay loop muted playsInline
              className="w-full h-full object-cover opacity-20 grayscale sepia-[50%]"
            />
            <audio src={ambientAudio} autoPlay loop />
          </>
        ) : (
            <div className="w-full h-full bg-[#0a0500] relative">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2c1a0f_0%,_#000000_100%)] opacity-80"></div>
            </div>
        )}
        {/* Vinheta escura nas bordas para focar no centro */}
        <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,_#000000_90%)] pointer-events-none"></div>
      </div>

      {/* --- CONTEÚDO CENTRAL --- */}
      <div className="relative z-20 w-full max-w-2xl px-6 flex flex-col items-center gap-12 animate-in fade-in duration-1000">
        
        {timeLeft === 0 ? (
            // --- MODO CONFIGURAÇÃO: Clean & Elegante ---
            <div className="flex flex-col items-center gap-8 w-full">
                
                <div className="text-center">
                    <Hourglass className="w-8 h-8 text-[#c2985b] mx-auto mb-4 opacity-80" />
                    <h2 className="text-3xl md:text-4xl text-[#E2D1C3] font-headline tracking-[0.15em] uppercase">Cronômetro</h2>
                </div>

                <div className="w-full max-w-md space-y-8 bg-white/5 p-8 rounded border border-white/5 backdrop-blur-sm">
                    {/* Input Matéria */}
                    <div className="space-y-2 text-center">
                        <label className="text-[#c2985b] text-[10px] uppercase tracking-[0.3em] font-bold">Foco do Estudo</label>
                        <Input 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ex: Poções..."
                            className="text-center bg-transparent border-0 border-b border-[#c2985b]/30 rounded-none text-xl text-[#E2D1C3] placeholder:text-[#E2D1C3]/10 focus-visible:ring-0 focus-visible:border-[#c2985b] transition-colors font-serif h-12"
                        />
                    </div>

                    {/* Input Tempo */}
                    <div className="space-y-2 text-center">
                         <label className="text-[#c2985b] text-[10px] uppercase tracking-[0.3em] font-bold">Tempo (Min)</label>
                        <div className="flex justify-center items-baseline gap-2">
                            <Input 
                                type="number"
                                value={targetMinutes}
                                onChange={(e) => setTargetMinutes(e.target.value)}
                                className="text-center bg-transparent border-0 border-b border-[#c2985b]/30 rounded-none w-20 text-4xl text-[#E2D1C3] font-light focus-visible:ring-0 focus-visible:border-[#c2985b] transition-colors font-headline"
                            />
                        </div>
                    </div>

                    <Button 
                        onClick={handleStart}
                        className="w-full bg-[#c2985b]/10 hover:bg-[#c2985b]/20 text-[#c2985b] border border-[#c2985b]/30 py-6 uppercase tracking-[0.2em] text-xs font-bold transition-all hover:scale-[1.02]"
                    >
                        Iniciar
                    </Button>
                </div>
            </div>
        ) : (
            // --- MODO TIMER: Foco Total ---
            <div className="flex flex-col items-center gap-12 w-full">
                
                {/* O Tempo */}
                <div className="relative py-10">
                    {formatTime(timeLeft)}
                    <div className="absolute -bottom-4 left-0 right-0 text-center">
                         <span className="text-[#c2985b]/60 text-sm uppercase tracking-[0.4em] font-serif border-t border-[#c2985b]/20 pt-2 inline-block px-8">
                            {topic}
                         </span>
                    </div>
                </div>

                {/* Controles Discretos */}
                <div className="flex items-center gap-10">
                  {!isRunning ? (
                    <button 
                      onClick={handleResume}
                      className="group flex items-center justify-center w-20 h-20 rounded-full border border-[#c2985b]/30 hover:bg-[#c2985b]/10 transition-all hover:scale-105"
                    >
                      <Play className="w-8 h-8 text-[#c2985b] fill-[#c2985b] ml-1 opacity-80 group-hover:opacity-100" />
                    </button>
                  ) : (
                    <button 
                      onClick={handlePause}
                      className="group flex items-center justify-center w-20 h-20 rounded-full border border-[#c2985b]/30 hover:bg-[#c2985b]/10 transition-all hover:scale-105"
                    >
                      <Pause className="w-8 h-8 text-[#c2985b] fill-[#c2985b] opacity-80 group-hover:opacity-100" />
                    </button>
                  )}

                  <button 
                    onClick={() => handleFinish(false)}
                    className="group flex items-center justify-center w-14 h-14 rounded-full border border-white/10 hover:bg-red-900/20 hover:border-red-500/30 transition-all"
                    title="Parar"
                  >
                    <Square className="w-5 h-5 text-white/30 fill-white/30 group-hover:text-red-400 group-hover:fill-red-400/50 transition-colors" />
                  </button>
                </div>
            </div>
        )}
      </div>

      <style>{`
        /* Fontes importadas localmente no componente Lista ou globalmente */
        .font-headline { font-family: 'Cinzel', serif; }
        
        /* Remove setas do input number */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
        }
      `}</style>
    </div>
  );
}