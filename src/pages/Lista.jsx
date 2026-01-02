import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Medal, Feather } from 'lucide-react';

// IMAGENS
import bookCover from '@/assets/capa.png';
import bruxaImg from '@/assets/bruxa.png';
import trouxaImg from '@/assets/trouxa1.png';
// IMPORTANTE: Adicione a imagem harmione.png na pasta assets
import hermioneImg from '@/assets/harmione.png';

export default function Lista() {
  // 0 = Fechado
  // 1 = Aberto (Convocados + Ranking)
  // 2 = Virou Página 1 (Nayara + Bruxa)
  // 3 = Virou Página 2 (Mayron + Trouxa)
  // 4 = Virou Página 3 (Hermione + Foto Hermione)
  const [bookStep, setBookStep] = useState(0);

  // --- DADOS DO RANKING ---
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.users.list(),
  });

  const { data: allGoals = [] } = useQuery({
    queryKey: ['all-goals'],
    queryFn: () => base44.entities.Goal.list(),
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['all-progress'],
    queryFn: () => base44.entities.Marathon.getAllProgress(),
  });

  const calculateRanking = () => {
    const userStats = {};
    users.forEach(u => {
      userStats[u.id] = { ...u, points: 0, completed: 0 };
    });

    allGoals.forEach(g => {
      const user = Object.values(userStats).find(u => u.email === g.created_by);
      if (user && g.status === 'concluido') {
        user.points += 10;
        user.completed++;
      }
    });

    allProgress.forEach(p => {
      const user = userStats[p.userId];
      if (user && p.tasks) {
        p.tasks.forEach(t => {
          if (t.completed) {
            user.points += 5;
            user.completed++;
          }
        });
      }
    });

    return Object.values(userStats).sort((a, b) => b.points - a.points);
  };

  const rankings = calculateRanking();

  // --- CONTROLES DE NAVEGAÇÃO ---
  const nextStep = (e) => {
    e?.stopPropagation();
    // Agora vai até 4 passos
    if (bookStep < 4) setBookStep(prev => prev + 1);
  };

  const prevStep = (e) => {
    e?.stopPropagation();
    if (bookStep > 0) setBookStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-[#0a0500] flex flex-col items-center justify-center p-4 perspective-1000 overflow-hidden font-serif">
      
      {/* ALTERAÇÃO NO FUNDO: Gradiente quente e profundo (Âmbar escuro para preto) */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_#3E2723_0%,_#1a0f0a_50%,_#000000_100%)] opacity-80 pointer-events-none"></div>
      
      {/* Mantive a textura sutil de poeira pois ajuda na imersão sem atrapalhar */}
      <div className="fixed inset-0 opacity-20 pointer-events-none mix-blend-screen" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

      {/* --- O LIVRO 3D --- */}
      <div 
        className={`relative w-[300px] h-[450px] md:w-[420px] md:h-[600px] transition-all duration-1000 ease-in-out transform-style-3d ${
          bookStep > 0 ? 'translate-x-[50%]' : 'hover:scale-105 cursor-pointer'
        }`}
        onClick={bookStep === 0 ? () => setBookStep(1) : undefined}
      >

        {/* ================= NAVEGAÇÃO MÁGICA (ZONAS DE CLIQUE) ================= */}
        {bookStep > 0 && (
          <div className="absolute inset-0 z-[60] pointer-events-none origin-left transform-style-3d" style={{ transform: 'rotateY(-180deg)' }}>
              <div 
                className="absolute top-0 bottom-0 right-0 w-20 cursor-pointer pointer-events-auto hover:bg-yellow-900/10 transition-colors rounded-l-md"
                onClick={prevStep}
                title="Voltar Página"
              ></div>
          </div>
        )}

        {bookStep > 0 && bookStep < 4 && (
           <div className="absolute inset-0 z-[60] pointer-events-none">
              <div 
                className="absolute top-0 bottom-0 right-0 w-20 cursor-pointer pointer-events-auto hover:bg-yellow-900/10 transition-colors rounded-r-md"
                onClick={nextStep}
                title="Próxima Página"
              ></div>
           </div>
        )}

        {/* ================= CAMADA 1: CAPA & CONVOCADOS ================= */}
        <div className={`absolute inset-0 w-full h-full origin-left transition-transform duration-1000 transform-style-3d shadow-2xl ${bookStep >= 2 ? 'z-10' : 'z-50'}`}
             style={{ transform: bookStep >= 1 ? 'rotateY(-180deg)' : 'rotateY(0deg)' }}>
          
          {/* FRENTE: CAPA */}
          <div className="absolute inset-0 backface-hidden rounded-r-md overflow-hidden border-4 border-yellow-900/50 bg-[#2a1a10]">
            <img src={bookCover} alt="Capa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 pointer-events-none"></div>
          </div>

          {/* VERSO: PÁGINA "CONVOCADOS" */}
          <div className="absolute inset-0 h-full w-full bg-[#f4e4bc] rounded-l-md backface-hidden flex flex-col items-center p-8 text-center"
               style={{ transform: 'rotateY(180deg)' }}>
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>
             
             <div className="relative z-10 border-4 border-double border-yellow-800/40 w-full h-full p-6 flex flex-col justify-center items-center pointer-events-none">
                <h2 className="text-3xl font-bold text-yellow-900 mb-4 font-headline uppercase tracking-widest border-b-2 border-yellow-900/30 pb-2">
                  Convocados
                </h2>
                <p className="text-yellow-900/70 italic mb-8 text-sm leading-relaxed">
                  "Nestes pergaminhos residem os nomes daqueles que demonstraram bravura e dedicação extraordinária."
                </p>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-yellow-900/5 p-3 rounded text-yellow-900">
                    <span className="block text-2xl font-bold">{users.length}</span>
                    <span className="text-[10px] uppercase tracking-wide">Bruxos</span>
                  </div>
                  <div className="bg-yellow-900/5 p-3 rounded text-yellow-900">
                    <span className="block text-2xl font-bold">{rankings[0]?.points || 0}</span>
                    <span className="text-[10px] uppercase tracking-wide">Recorde</span>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* ================= CAMADA 2: RANKING & CONTRATO NAYARA ================= */}
        <div className={`absolute inset-0 w-full h-full origin-left transition-transform duration-1000 transform-style-3d shadow-xl ${bookStep === 2 ? 'z-50' : (bookStep > 2 ? 'z-20' : 'z-40')}`}
             style={{ transform: bookStep >= 2 ? 'rotateY(-180deg)' : 'rotateY(0deg)' }}>
          
          {/* FRENTE: RANKING */}
          <div className="absolute inset-0 w-full h-full bg-[#f4e4bc] rounded-r-md backface-hidden overflow-hidden flex flex-col">
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>
             <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-20"></div>

             <div className="relative z-10 h-full flex flex-col p-4">
                <h3 className="text-center text-yellow-900/80 font-bold mb-4 uppercase text-sm border-b border-yellow-900/20 pb-2 mt-2">
                  Classificação Oficial
                </h3>
                
                <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3 pr-2 z-30 pointer-events-auto">
                  {rankings.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-3 border-b border-yellow-900/10 pb-2 hover:bg-yellow-900/5 p-2 rounded transition-colors">
                      <div className="w-6 flex justify-center font-bold text-yellow-900/60 font-mono text-sm">
                        {index === 0 ? <Crown className="w-4 h-4 text-yellow-600" /> : 
                         index === 1 ? <Medal className="w-4 h-4 text-gray-500" /> : 
                         index === 2 ? <Medal className="w-4 h-4 text-amber-700" /> : 
                         `#${index + 1}`}
                      </div>
                      <Avatar className="w-8 h-8 border border-yellow-900/30 grayscale hover:grayscale-0">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-yellow-900/10 text-yellow-900 text-[10px]">{user.name?.slice(0,2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-yellow-900 font-bold text-xs truncate">{user.name}</p>
                        <p className="text-yellow-900/50 text-[9px] uppercase">{user.points} pts</p>
                      </div>
                    </div>
                  ))}
                  {rankings.length === 0 && <div className="text-center text-yellow-900/40 py-4 text-xs">Sem registros...</div>}
                </div>
             </div>
          </div>

          {/* VERSO: CONTRATO NAYARA */}
          <div className="absolute inset-0 w-full h-full bg-[#e8d5a8] rounded-l-md backface-hidden flex flex-col p-6 overflow-y-auto custom-scrollbar text-yellow-900"
               style={{ transform: 'rotateY(180deg)' }}>
             <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>
             
             <div className="relative z-10 text-[10px] md:text-[11px] leading-relaxed font-serif space-y-2 text-justify pointer-events-none">
                <p><strong>Nome da Bruxa:</strong> Nayara Panda Mendes</p>
                <p><strong>Casa Original:</strong> Lufa Lufa</p>

                <p><strong>Seu foco principal neste mês:</strong> Concurso e estudos para faculdade de enfermagem</p>
                <p><strong>Área(s) de estudo prioritária(s):</strong> Anatomia e Medicamentos</p>

                <div>
                   <p className="font-bold mb-1 flex items-center gap-1"><Feather className="w-3 h-3"/> Leituras enviadas pela coruja:</p>
                   <ul className="list-disc list-inside pl-2 space-y-0.5 italic">
                     <li>Fama</li>
                     <li>Malibu</li>
                     <li>Inferno</li>
                     <li>As Viagens de Gulliver</li>
                     <li>Te entreguei meu coração</li>
                     <li>Na estrada com o idol</li>
                     <li>Tic tac (conto)</li>
                   </ul>
                </div>

                <p>A aluna compromete-se a dedicar até <strong>quatro horas diárias</strong> aos estudos, respeitando seus limites e dividindo o tempo entre preparação para concursos, formação em Enfermagem e revisões necessárias. O foco será cultivado com coragem e constância, mesmo nos dias difíceis.</p>
                <p>Será mantido o hábito de leitura diária por, no mínimo, <strong>trinta minutos</strong>, bem como o estudo contínuo dos idiomas <strong>Inglês e Espanhol</strong>, entendidos como ferramentas de expansão do pensamento e do mundo.</p>
                <p>A aluna zelará por seu corpo e bem-estar, mantendo a ingestão mínima de <strong>dois litros de água</strong> por dia, praticando o autocuidado e respeitando o descanso como parte essencial do progresso.</p>
                <p>Fica registrado o compromisso com o repouso adequado, buscando ao menos <strong>seis horas de sono</strong> por noite, entendendo que a mente afiada nasce de um corpo cuidado e que a ambição verdadeira é sustentável.</p>
             </div>
          </div>
        </div>

        {/* ================= CAMADA 3: FOTO NAYARA & CONTRATO MAYRON ================= */}
        <div className={`absolute inset-0 w-full h-full origin-left transition-transform duration-1000 transform-style-3d shadow-xl ${bookStep === 3 ? 'z-50' : (bookStep > 3 ? 'z-30' : 'z-30')}`}
             style={{ transform: bookStep >= 3 ? 'rotateY(-180deg)' : 'rotateY(0deg)' }}>
          
          {/* FRENTE: IMAGEM DA BRUXA */}
          <div className="absolute inset-0 w-full h-full bg-[#f4e4bc] rounded-r-md backface-hidden flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>
             <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-20"></div>
             <div className="relative z-10 p-2 w-full h-full flex flex-col items-center justify-center">
                <img 
                  src={bruxaImg} 
                  alt="Bruxa" 
                  className="max-h-[90%] max-w-[90%] object-contain drop-shadow-xl filter sepia-[0.2]" 
                />
             </div>
          </div>

          {/* VERSO: CONTRATO MAYRON */}
          <div className="absolute inset-0 w-full h-full bg-[#e8d5a8] rounded-l-md backface-hidden flex flex-col p-6 overflow-y-auto custom-scrollbar text-yellow-900"
               style={{ transform: 'rotateY(180deg)' }}>
             <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>
             
             <div className="relative z-10 text-[10px] md:text-[11px] leading-relaxed font-serif space-y-3 text-justify pointer-events-none">
                <div className="border-b border-yellow-900/20 pb-2 mb-2 text-center">
                </div>
                <p><strong>Nome do Trouxa:</strong> Mayron Tubas</p>
                <p><strong>Casa Original:</strong> Lufa-Lufa</p>

                <p><strong>Intenção com a maratona:</strong> Busca por estabilidade financeira e reorganização da rotina pessoal ao longo do mês de janeiro, compreendendo este período como um marco de mudança de vida.</p>

                <p><strong>Foco principal nos estudos:</strong> Programação.</p>

                <p><strong>Tempo diário destinado aos estudos:</strong> 1 hora e 30 minutos.</p>

                <div>
                   <p className="font-bold mb-1 flex items-center gap-1"><Feather className="w-3 h-3"/> Leituras indicadas para o período:</p>
                   <ul className="list-disc list-inside pl-2 space-y-0.5 italic">
                     <li>Os Três Porquinhos.</li>
                   </ul>
                </div>

                <p><strong>Hábitos a serem fortalecidos:</strong> Consolidação do hábito de estudo diário, reconhecendo a constância como base do progresso.</p>

                <p><strong>Meta pessoal para o mês:</strong> Conquistar uma oportunidade de trabalho.</p>

                <p>Ao final da maratona, o participante deseja sentir-se realizado, tendo o esforço como palavra-guia de sua jornada.</p>

                <p className="italic border-t border-yellow-900/20 pt-2 mt-2">
                  "Fica registrado o compromisso com a participação na Maratona Hogwarts — Janeiro 2026, assumido com leveza, respeitando o próprio ritmo e entendendo que a transformação acontece por meio de passos consistentes."
                </p>
             </div>
          </div>
        </div>

        {/* ================= CAMADA 4 (NOVA): FOTO MAYRON & CONTRATO HERMIONE ================= */}
        <div className={`absolute inset-0 w-full h-full origin-left transition-transform duration-1000 transform-style-3d shadow-xl ${bookStep === 4 ? 'z-50' : 'z-20'}`}
             style={{ transform: bookStep >= 4 ? 'rotateY(-180deg)' : 'rotateY(0deg)' }}>
          
          {/* FRENTE: IMAGEM DO TROUXA (MAYRON) - Movida para cá */}
          <div className="absolute inset-0 w-full h-full bg-[#f4e4bc] rounded-r-md backface-hidden flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>
             <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-20"></div>
             <div className="relative z-10 p-2 w-full h-full flex flex-col items-center justify-center">
                <img 
                  src={trouxaImg} 
                  alt="Trouxa" 
                  className="max-h-[90%] max-w-[90%] object-contain drop-shadow-xl filter sepia-[0.2]" 
                />
             </div>
          </div>

          {/* VERSO: CONTRATO HERMIONE (NOVO) */}
          <div className="absolute inset-0 w-full h-full bg-[#e8d5a8] rounded-l-md backface-hidden flex flex-col p-6 overflow-y-auto custom-scrollbar text-yellow-900"
               style={{ transform: 'rotateY(180deg)' }}>
             <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>
             
             <div className="relative z-10 text-[10px] md:text-[11px] leading-relaxed font-serif space-y-3 text-justify pointer-events-none">
                
                <p><strong>Nome no Castelo:</strong> Hermione</p>
                <p><strong>Casa Original:</strong> Sonserina</p>

                <p><strong>Intenção com a maratona:</strong> Desenvolver maior constância nos hábitos ao longo do mês de janeiro, utilizando a força do coletivo como estímulo para manter o planejamento e a disciplina.</p>

                <p><strong>Foco principal nos estudos:</strong> Preparação para concurso.</p>

                <p><strong>Tempo diário destinado aos estudos:</strong> 2 horas.</p>

                <div>
                   <p className="font-bold mb-1 flex items-center gap-1"><Feather className="w-3 h-3"/> Leituras indicadas para o período:</p>
                   <ul className="list-disc list-inside pl-2 space-y-0.5 italic">
                     <li>Não-ficção: Ensaios de Despedida.</li>
                   </ul>
                </div>

                <p><strong>Hábitos a serem fortalecidos:</strong> Manutenção da rotina de estudos, prática regular da leitura e atenção à hidratação diária, reconhecendo o hábito de beber água como um ponto-chave para o bem-estar.</p>

                <p><strong>Meta pessoal para o mês:</strong> Escrever com mais frequência.</p>

                <p>Ao final da maratona, a participante deseja sentir-se impulsionada a continuar, tendo a consistência como palavra-guia de sua jornada.</p>

                <p className="italic border-t border-yellow-900/20 pt-2 mt-2 text-[#2e4a3d]">
                  "Fica registrado o compromisso com a participação na Maratona Hogwarts — Janeiro 2026, assumido de forma consciente e ativa, com presença integral ao desafio proposto."
                </p>
             </div>
          </div>
        </div>

        {/* ================= CAMADA FINAL: FUNDO/BASE (IMAGEM HERMIONE) ================= */}
        <div className="absolute inset-0 w-full h-full bg-[#f4e4bc] rounded-r-md z-10 flex items-center justify-center shadow-[-5px_5px_15px_rgba(0,0,0,0.3)]">
           <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>
           <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>

           <div className="relative z-10 p-2 w-full h-full flex flex-col items-center justify-center">
              <img 
                src={hermioneImg} 
                alt="Hermione Final" 
                className="max-h-[90%] max-w-[90%] object-contain drop-shadow-xl filter sepia-[0.2]" 
              />
           </div>
        </div>

        {/* LOMBADA */}
        <div className="absolute top-0 bottom-0 left-0 w-6 bg-yellow-950 -translate-x-full rounded-l-sm shadow-inner z-0"
             style={{ transform: 'rotateY(-90deg) translateX(-3px)' }}></div>

      </div>

      <style>{`
        .perspective-1000 { perspective: 1500px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .font-headline { font-family: 'Cinzel', serif; }
        .font-script { font-family: 'Dancing Script', cursive; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(120, 53, 15, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}