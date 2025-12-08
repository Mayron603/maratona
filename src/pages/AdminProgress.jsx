import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, Circle, StickyNote, Image as ImageIcon, Search, ShieldAlert } from 'lucide-react';

export default function AdminProgress() {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedMarathonId, setSelectedMarathonId] = useState(null);

  // 1. Buscas de dados
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.users.list(),
  });

  const { data: marathons = [] } = useQuery({
    queryKey: ['marathons'],
    queryFn: () => base44.entities.Marathon.list(),
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['all-progress'],
    queryFn: () => base44.entities.Marathon.getAllProgress(),
  });

  // Se não for admin, bloqueia visualização (segurança de front-end)
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Acesso Restrito</h2>
        <p>Apenas administradores podem ver esta página.</p>
      </div>
    );
  }

  // Lógica para encontrar o progresso do usuário selecionado na maratona selecionada
  const selectedMarathon = marathons.find(m => m.id === selectedMarathonId);
  const userProgress = allProgress.find(p => p.userId === selectedUserId && p.marathonId === selectedMarathonId);

  // Função auxiliar para pegar dados da tarefa
  const getTaskData = (taskId) => {
    return userProgress?.tasks?.find(t => t.taskId === taskId) || {};
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Search className="w-8 h-8 text-blue-600" />
            Inspetor de Progresso
          </h1>
          <p className="text-gray-500">Visualize as fotos e notas dos participantes 🕵️‍♂️</p>
        </div>

        {/* --- FILTROS --- */}
        <Card className="mb-8 bg-white border-blue-100 shadow-md">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              
              {/* Seleção de Usuário */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Participante</label>
                <Select onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-[10px]">{user.name?.slice(0,2)}</AvatarFallback>
                          </Avatar>
                          {user.name} ({user.email})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Seleção de Maratona */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Maratona</label>
                <Select onValueChange={setSelectedMarathonId} disabled={!selectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a maratona" />
                  </SelectTrigger>
                  <SelectContent>
                    {marathons.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* --- CONTEÚDO --- */}
        {!selectedUserId || !selectedMarathonId ? (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
            Selecione um usuário e uma maratona para ver os detalhes.
          </div>
        ) : !selectedMarathon ? (
           <div className="text-center text-gray-500">Maratona não encontrada.</div>
        ) : (
          <div className="space-y-6">
            {/* Cabeçalho do Resultado */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-blue-800">
                    Visualizando: {selectedMarathon.name}
                </h2>
                {!userProgress && (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                        Este usuário ainda não iniciou esta maratona.
                    </span>
                )}
            </div>

            {selectedMarathon.rounds?.map((round, roundIndex) => (
              <Card key={roundIndex} className="bg-white/90 backdrop-blur-sm border border-gray-200">
                <CardHeader className="bg-gray-50 pb-3 border-b">
                  <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {roundIndex + 1}
                    </span>
                    {round.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {round.tasks?.map((task) => {
                    const taskData = getTaskData(task.id);
                    const isCompleted = taskData.completed;
                    const note = taskData.note;
                    const photo = taskData.photo;

                    return (
                      <div key={task.id} className={`p-3 rounded-xl border flex gap-3 ${isCompleted ? 'bg-green-50/50 border-green-100' : 'bg-white border-gray-100'}`}>
                        {/* Status Icon */}
                        <div className="pt-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                            {task.text}
                          </p>
                          
                          {/* Exibição de Nota e Foto */}
                          {(note || photo) && (
                            <div className="mt-3 flex flex-wrap gap-4 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                              
                              {/* Nota */}
                              {note && (
                                <div className="flex-1 min-w-[200px]">
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                                        <StickyNote className="w-3 h-3" /> Nota do usuário:
                                    </p>
                                    <p className="text-sm text-gray-700 italic">"{note}"</p>
                                </div>
                              )}

                              {/* Foto */}
                              {photo && (
                                <div>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                                        <ImageIcon className="w-3 h-3" /> Foto enviada:
                                    </p>
                                    <Dialog>
                                        <DialogTrigger>
                                            <img 
                                                src={photo} 
                                                alt="Prova" 
                                                className="w-20 h-20 rounded-lg object-cover border border-gray-200 hover:scale-105 transition-transform cursor-pointer" 
                                            />
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl bg-transparent border-0 shadow-none p-0 flex items-center justify-center">
                                            <img src={photo} alt="Prova Full" className="max-h-[85vh] rounded-md shadow-2xl" />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}