import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckCircle2, Clock, Calendar, TrendingUp, Plus, Sparkles, Film, Book, Tv, Trophy } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import ProgressCircle from '@/components/ui/ProgressCircle';
import GoalCard from '@/components/goals/GoalCard';
import ChristmasCountdown from '@/components/christmas/ChristmasCountdown';

export default function Dashboard() {
  const { data: goals = [], refetch: refetchGoals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
  });

  const { data: marathons = [] } = useQuery({
    queryKey: ['marathons'],
    queryFn: () => base44.entities.Marathon.list('-created_date'),
  });

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'concluido').length,
    inProgress: goals.filter(g => g.status === 'em_progresso').length,
    pending: goals.filter(g => g.status === 'nao_iniciado').length
  };

  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const todayGoals = goals.filter(goal => {
    if (!goal.due_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return goal.due_date === today;
  });

  const handleStatusChange = async (goalId, newStatus) => {
    await base44.entities.Goal.update(goalId, { 
      status: newStatus,
      completed_date: newStatus === 'concluido' ? new Date().toISOString().split('T')[0] : null
    });
    refetchGoals();
  };

  const recentGoals = goals.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Acompanhe seu progresso natalino ✨</p>
          </div>
          <Link to={createPageUrl('Goals')}>
            <Button className="mt-4 md:mt-0 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
              <Plus className="w-4 h-4 mr-2" /> Nova Meta
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total de Metas" value={stats.total} icon={Target} color="blue" />
          <StatsCard title="Concluídas" value={stats.completed} icon={CheckCircle2} color="green" subtitle={`${Math.round(progress)}% do total`} />
          <StatsCard title="Em Progresso" value={stats.inProgress} icon={Clock} color="yellow" />
          <StatsCard title="Pendentes" value={stats.pending} icon={Calendar} color="red" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Progress Overview */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-red-100 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                <TrendingUp className="w-5 h-5" />
                Progresso Geral
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <ProgressCircle percentage={progress} size={160} strokeWidth={14} color="#dc2626" />
              <p className="mt-4 text-gray-500">
                {stats.completed} de {stats.total} metas concluídas
              </p>
            </CardContent>
          </Card>

          {/* Today's Goals */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-100 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                <Calendar className="w-5 h-5" />
                Metas de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayGoals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma meta para hoje</p>
                  <Link to={createPageUrl('Goals')} className="text-green-600 text-sm hover:underline">
                    Adicionar meta
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayGoals.slice(0, 4).map(goal => (
                    <div key={goal.id} className="flex items-center gap-3 p-2 rounded-lg bg-green-50">
                      <button
                        onClick={() => handleStatusChange(goal.id, goal.status === 'concluido' ? 'nao_iniciado' : 'concluido')}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          goal.status === 'concluido' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {goal.status === 'concluido' && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <span className={`flex-1 text-sm ${goal.status === 'concluido' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {goal.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Christmas Countdown */}
          <ChristmasCountdown />
        </div>

        {/* Recent Goals & Marathons */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Goals */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-red-100 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                <Target className="w-5 h-5" />
                Metas Recentes
              </CardTitle>
              <Link to={createPageUrl('Goals')} className="text-sm text-red-600 hover:underline">
                Ver todas
              </Link>
            </CardHeader>
            <CardContent>
              {recentGoals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma meta criada ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentGoals.map(goal => (
                    <GoalCard 
                      key={goal.id} 
                      goal={goal} 
                      onStatusChange={handleStatusChange}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Marathons */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-100 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                <Trophy className="w-5 h-5" />
                Maratonas Ativas
              </CardTitle>
              <Link to={createPageUrl('Marathons')} className="text-sm text-green-600 hover:underline">
                Ver todas
              </Link>
            </CardHeader>
            <CardContent>
              {marathons.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma maratona ativa</p>
                  <Link to={createPageUrl('Marathons')} className="text-green-600 text-sm hover:underline">
                    Criar maratona
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {marathons.slice(0, 3).map(marathon => {
                    const totalTasks = marathon.rounds?.reduce((acc, r) => acc + (r.tasks?.length || 0), 0) || 0;
                    const completedTasks = marathon.rounds?.reduce((acc, r) => 
                      acc + (r.tasks?.filter(t => t.completed)?.length || 0), 0) || 0;
                    
                    return (
                      <Link key={marathon.id} to={createPageUrl(`MarathonDetail?id=${marathon.id}`)}>
                        <div className="p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-800">{marathon.name}</h4>
                              <p className="text-sm text-gray-500">{completedTasks}/{totalTasks} tarefas</p>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}