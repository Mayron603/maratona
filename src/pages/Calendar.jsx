import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Plus, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import CalendarView from '@/components/calendar/CalendarView';
import GoalForm from '@/components/goals/GoalForm';
import GoalCard from '@/components/goals/GoalCard';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const handleDayClick = (date) => {
    setSelectedDate(date);
  };

  const handleCreateGoal = (data) => {
    createMutation.mutate({
      ...data,
      due_date: format(selectedDate, 'yyyy-MM-dd')
    });
  };

  const handleStatusChange = (id, status) => {
    updateMutation.mutate({ 
      id, 
      data: { 
        status,
        completed_date: status === 'concluido' ? new Date().toISOString().split('T')[0] : null
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Excluir esta meta?')) {
      deleteMutation.mutate(id);
    }
  };

  const selectedDayGoals = goals.filter(goal => {
    if (!goal.due_date) return false;
    // CORREÇÃO: Adiciona T00:00 para garantir interpretação local correta
    const goalDate = new Date(goal.due_date + 'T00:00:00');
    return isSameDay(goalDate, selectedDate);
  });

  const statusConfig = {
    nao_iniciado: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100' },
    em_progresso: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    concluido: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-red-500" />
            Calendário
          </h1>
          <p className="text-gray-500 mt-1">Organize suas metas dia a dia 📅</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <CalendarView
              goals={goals}
              onDayClick={handleDayClick}
              selectedDate={selectedDate}
            />
          </div>

          {/* Selected Day Panel */}
          <div>
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-red-100 shadow-xl sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowForm(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-8 h-8 text-red-300 mx-auto animate-pulse" />
                  </div>
                ) : selectedDayGoals.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma meta para este dia</p>
                    <Button 
                      variant="link" 
                      className="text-red-600 text-sm"
                      onClick={() => setShowForm(true)}
                    >
                      Adicionar meta
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayGoals.map(goal => {
                      const StatusIcon = statusConfig[goal.status]?.icon || Circle;
                      return (
                        <div 
                          key={goal.id}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            goal.status === 'concluido' 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-white border-gray-100 hover:border-red-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleStatusChange(goal.id, goal.status === 'concluido' ? 'nao_iniciado' : 'concluido')}
                              className={`p-1.5 rounded-full ${statusConfig[goal.status]?.bg} transition-all`}
                            >
                              <StatusIcon className={`w-4 h-4 ${statusConfig[goal.status]?.color}`} />
                            </button>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium text-sm ${goal.status === 'concluido' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                {goal.title}
                              </h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {goal.category}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-400 hover:text-red-600"
                              onClick={() => handleDelete(goal.id)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Stats */}
                {selectedDayGoals.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-around text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-700">{selectedDayGoals.length}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {selectedDayGoals.filter(g => g.status === 'concluido').length}
                        </div>
                        <div className="text-xs text-gray-500">Concluídas</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {selectedDayGoals.filter(g => g.status !== 'concluido').length}
                        </div>
                        <div className="text-xs text-gray-500">Pendentes</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-lg p-0 border-0 bg-transparent">
            <GoalForm
              onSubmit={handleCreateGoal}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}