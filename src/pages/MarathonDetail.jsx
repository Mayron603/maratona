import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, Circle, StickyNote, Save, Trophy } from 'lucide-react';

export default function MarathonDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const marathonId = urlParams.get('id');
  const queryClient = useQueryClient();
  
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempNote, setTempNote] = useState('');

  // 1. Busca a estrutura da Maratona
  const { data: marathon, isLoading: loadingMarathon } = useQuery({
    queryKey: ['marathon', marathonId],
    queryFn: async () => {
      const marathons = await base44.entities.Marathon.filter({ id: marathonId });
      return marathons[0];
    },
    enabled: !!marathonId,
  });

  // 2. Busca o progresso do usuário (checks e notas)
  const { data: userProgress } = useQuery({
    queryKey: ['marathon-progress', marathonId],
    queryFn: () => base44.entities.Marathon.getProgress(marathonId),
    enabled: !!marathonId,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, completed, note }) => 
      base44.entities.Marathon.updateTask(marathonId, taskId, completed, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marathon-progress', marathonId] });
      setEditingNoteId(null);
    },
  });

  // Funções auxiliares para pegar dados do progresso
  const getTaskStatus = (taskId) => {
    const task = userProgress?.tasks?.find(t => t.taskId === taskId);
    return task ? task.completed : false;
  };

  const getTaskNote = (taskId) => {
    const task = userProgress?.tasks?.find(t => t.taskId === taskId);
    return task ? task.note : '';
  };

  const handleToggle = (taskId) => {
    const currentStatus = getTaskStatus(taskId);
    updateTaskMutation.mutate({ taskId, completed: !currentStatus });
  };

  const handleSaveNote = (taskId) => {
    updateTaskMutation.mutate({ taskId, note: tempNote });
  };

  if (loadingMarathon || !marathon) return <div className="p-8 text-center">Carregando maratona...</div>;

  // Cálculos de progresso visual
  const totalTasks = marathon.rounds?.reduce((acc, r) => acc + (r.tasks?.length || 0), 0) || 0;
  const completedTasks = marathon.rounds?.reduce((acc, r) => 
    acc + (r.tasks?.filter(t => getTaskStatus(t.id))?.length || 0), 0) || 0;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Marathons')}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-yellow-500" />
              {marathon.name}
            </h1>
          </div>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-green-100">Seu Progresso</p>
                <p className="text-3xl font-bold">{completedTasks} / {totalTasks} tarefas</p>
              </div>
              <div className="text-5xl font-bold">{Math.round(progressPercent)}%</div>
            </div>
            <Progress value={progressPercent} className="h-3 bg-green-400" />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {marathon.rounds?.map((round, roundIndex) => (
            <Card key={roundIndex} className="bg-white/90 backdrop-blur-sm border-2 border-green-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                    {roundIndex + 1}
                  </span>
                  {round.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {round.tasks?.map((task) => {
                  const isCompleted = getTaskStatus(task.id);
                  const note = getTaskNote(task.id);

                  return (
                    <div key={task.id} className={`p-3 rounded-xl border transition-all ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggle(task.id)}
                          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </button>
                        
                        <div className="flex-1">
                          <span className={`block font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {task.text}
                          </span>
                          
                          {/* Área da Nota */}
                          <div className="mt-2">
                            {editingNoteId === task.id ? (
                              <div className="flex gap-2">
                                <Input 
                                  value={tempNote}
                                  onChange={(e) => setTempNote(e.target.value)}
                                  placeholder="Qual livro você vai ler?"
                                  className="h-8 text-sm bg-white"
                                  autoFocus
                                />
                                <Button size="sm" onClick={() => handleSaveNote(task.id)} className="h-8 w-8 p-0 bg-green-600">
                                  <Save className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div 
                                onClick={() => { setEditingNoteId(task.id); setTempNote(note || ''); }}
                                className={`text-sm flex items-center gap-2 cursor-pointer hover:bg-black/5 p-1 rounded -ml-1 ${note ? 'text-blue-600' : 'text-gray-400'}`}
                              >
                                <StickyNote className="w-3 h-3" />
                                {note || "Adicionar nota..."}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}