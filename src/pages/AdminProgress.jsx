import React, { useState, useEffect } from 'react';
import { History, Trophy, BookOpen, Clock, Trash2, Crown, Medal, Flame } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import progressBgVideo from '@/assets/video2.mp4';

// Dados fictícios para simular competição (Rivals)
const MOCK_RIVALS = [
  { id: 'npc1', name: 'Hermione G.', minutes: 2400, avatar: null },
  { id: 'npc2', name: 'Draco M.', minutes: 1200, avatar: null },
  { id: 'npc3', name: 'Luna L.', minutes: 890, avatar: null },
  { id: 'npc4', name: 'Neville L.', minutes: 450, avatar: null },
];

export default function AdminProgress() {
  const [sprints, setSprints] = useState([]);
  const [rankingList, setRankingList] = useState([]);

  // Carregar dados reais
  const loadData = () => {
    const savedData = localStorage.getItem('sprint_history');
    return savedData ? JSON.parse(savedData) : [];
  };

  useEffect(() => {
    const data = loadData();
    setSprints(data);

    // --- LÓGICA DO RANKING ---
    // 1. Calcula SEUS minutos totais reais
    const myTotalSeconds = data.reduce((acc, curr) => acc + (curr.seconds || 0), 0);
    const myTotalMinutes = Math.floor(myTotalSeconds / 60);

    // 2. Cria seu objeto de usuário
    const meUser = { 
      id: 'me', 
      name: 'Você (Atual)', 
      minutes: myTotalMinutes, 
      isMe: true,
      avatar: null 
    };

    // 3. Mistura com os rivais e ordena
    const fullRanking = [...MOCK_RIVALS, meUser].sort((a, b) => b.minutes - a.minutes);
    setRankingList(fullRanking);

    // Listener para atualizações em tempo real
    const handleStorageChange = () => {
       const newData = loadData();
       setSprints(newData);
       // Recalcular ranking (simplificado aqui)
       const newSeconds = newData.reduce((acc, curr) => acc + (curr.seconds || 0), 0);
       meUser.minutes = Math.floor(newSeconds / 60);
       setRankingList([...MOCK_RIVALS, meUser].sort((a, b) => b.minutes - a.minutes));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const totalProgressSeconds = sprints.reduce((acc, curr) => acc + (curr.seconds || 0), 0);

  const formatShortTime = (totalSeconds) => {
    if (!totalSeconds) return "0m";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleDelete = (id) => {
    if (window.confirm("Deseja apagar este registro do grimório?")) {
      const updated = sprints.filter(s => s.id !== id);
      setSprints(updated);
      localStorage.setItem('sprint_history', JSON.stringify(updated));
      
      // Atualiza ranking localmente rápido
      const newSeconds = updated.reduce((acc, curr) => acc + (curr.seconds || 0), 0);
      const newRanking = rankingList.map(u => u.isMe ? {...u, minutes: Math.floor(newSeconds/60)} : u)
                                    .sort((a, b) => b.minutes - a.minutes);
      setRankingList(newRanking);
    }
  };

  // Função auxiliar para ícone do ranking
  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-white/40 font-bold text-sm">#{index + 1}</span>;
  };

  return (
    <div className="min-h-screen text-[#E2D1C3] font-serif p-4 md:p-8 flex flex-col items-center relative overflow-hidden">
      
      {/* --- BACKGROUND VIDEO FIXO --- */}
      <div className="fixed inset-0 z-0">
        <video 
          autoPlay loop muted playsInline
          className="w-full h-full object-cover opacity-80"
          src={progressBgVideo}
        />
        {/* Camada escura degradê para leitura perfeita */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        {/* Textura de poeira mágica */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
      </div>

      <div className="w-full max-w-6xl z-10 relative space-y-12 animate-in fade-in duration-700">
        
        {/* --- CABEÇALHO --- */}
        <div className="text-center space-y-4 pt-4">
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#bf953f] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-headline">
            Salão dos Campeões
          </h1>
          <p className="text-[#E2D1C3]/60 italic font-serif text-lg">"A glória aguarda aqueles que persistem."</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- COLUNA ESQUERDA: RANKING GLOBAL (Novidade) --- */}
          <div className="lg:col-span-5 space-y-6">
             <div className="bg-black/40 backdrop-blur-md border border-[#bf953f]/30 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-[#bf953f]/10 border-b border-[#bf953f]/20 flex items-center justify-between">
                   <h2 className="text-[#bf953f] font-bold uppercase tracking-widest flex items-center gap-2">
                     <Trophy className="w-4 h-4" /> Classificação Geral
                   </h2>
                   <Badge variant="outline" className="text-[#bf953f] border-[#bf953f]/30">Jan/2026</Badge>
                </div>
                
                <div className="divide-y divide-white/5">
                  {rankingList.map((user, index) => (
                    <div 
                      key={user.id} 
                      className={`flex items-center justify-between p-4 transition-all ${
                        user.isMe 
                          ? 'bg-[#bf953f]/20 border-l-4 border-l-[#bf953f]' // Destaque para VOCÊ
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-6 flex justify-center">
                          {getRankIcon(index)}
                        </div>
                        <div className="flex items-center gap-3">
                          <Avatar className={`h-8 w-8 border ${user.isMe ? 'border-[#bf953f]' : 'border-white/20'}`}>
                            <AvatarFallback className="bg-black text-[#E2D1C3] text-xs">
                              {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className={`text-sm ${user.isMe ? 'font-bold text-white' : 'text-[#E2D1C3]/80'}`}>
                            {user.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="block font-mono font-bold text-[#E2D1C3]">
                           {Math.floor(user.minutes / 60)}h {user.minutes % 60}m
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* STATS RÁPIDOS */}
             <div className="grid grid-cols-2 gap-4">
                <Card className="bg-black/40 backdrop-blur border border-white/10">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs uppercase tracking-widest text-[#E2D1C3]/50 mb-1">Seu Tempo</p>
                    <p className="text-2xl font-mono font-bold text-[#bf953f]">{formatShortTime(totalProgressSeconds)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-black/40 backdrop-blur border border-white/10">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs uppercase tracking-widest text-[#E2D1C3]/50 mb-1">Sessões</p>
                    <p className="text-2xl font-mono font-bold text-[#bf953f]">{sprints.length}</p>
                  </CardContent>
                </Card>
             </div>
          </div>

          {/* --- COLUNA DIREITA: SEU HISTÓRICO (O Grimório) --- */}
          <div className="lg:col-span-7 space-y-4">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-[#E2D1C3] font-bold uppercase tracking-widest flex items-center gap-2 text-sm">
                 <History className="w-4 h-4 text-[#bf953f]" /> Seu Grimório Pessoal
               </h3>
               <span className="text-xs text-[#E2D1C3]/40 italic">Últimos registros</span>
             </div>

             <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {sprints.length === 0 ? (
                  <div className="p-8 border border-dashed border-white/20 rounded-xl text-center text-white/30 italic">
                    Nenhum feitiço de tempo lançado ainda...
                  </div>
                ) : (
                  sprints.map((sprint) => (
                    <div 
                      key={sprint.id} 
                      className="group relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-[#bf953f]/40 hover:bg-black/60 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start md:items-center gap-4">
                         
                         {/* Info Principal */}
                         <div className="flex items-start gap-4">
                            <div className="bg-[#bf953f]/10 p-2.5 rounded-lg border border-[#bf953f]/20">
                              <BookOpen className="w-5 h-5 text-[#bf953f]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-[#E2D1C3] group-hover:text-white transition-colors">
                                {sprint.notes}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-[#E2D1C3]/50 mt-1">
                                <span>{new Date(sprint.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                                <span>•</span>
                                <span>{sprint.startTime} - {sprint.endTime}</span>
                              </div>
                            </div>
                         </div>

                         {/* Tempo e Ações */}
                         <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="bg-[#bf953f]/10 text-[#bf953f] border border-[#bf953f]/20 font-mono text-sm px-3 py-1">
                              {sprint.totalDuration}
                            </Badge>
                            
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDelete(sprint.id)}
                              className="h-8 w-8 text-white/20 hover:text-red-400 hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                         </div>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .font-headline { font-family: 'Cinzel', serif; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(191, 149, 63, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(191, 149, 63, 0.6); }
      `}</style>
    </div>
  );
}