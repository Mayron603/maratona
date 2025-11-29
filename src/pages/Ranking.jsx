import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Target, 
  CheckCircle2, 
  Flame,
  Sparkles,
  Star,
  TrendingUp
} from 'lucide-react';

export default function Ranking() {
  const { data: allGoals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ['all-goals'],
    queryFn: () => base44.entities.Goal.list(),
  });

  const { data: allMarathons = [], isLoading: loadingMarathons } = useQuery({
    queryKey: ['all-marathons'],
    queryFn: () => base44.entities.Marathon.list(),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Calcular ranking por usuário
  const calculateUserStats = () => {
    const userStats = {};

    // Processar metas
    allGoals.forEach(goal => {
      const email = goal.created_by;
      if (!email) return;
      
      if (!userStats[email]) {
        userStats[email] = {
          email,
          totalGoals: 0,
          completedGoals: 0,
          marathonTasks: 0,
          completedMarathonTasks: 0,
          points: 0
        };
      }
      
      userStats[email].totalGoals++;
      if (goal.status === 'concluido') {
        userStats[email].completedGoals++;
        userStats[email].points += 10; // 10 pontos por meta concluída
      }
    });

    // Processar maratonas
    allMarathons.forEach(marathon => {
      const email = marathon.created_by;
      if (!email) return;
      
      if (!userStats[email]) {
        userStats[email] = {
          email,
          totalGoals: 0,
          completedGoals: 0,
          marathonTasks: 0,
          completedMarathonTasks: 0,
          points: 0
        };
      }

      marathon.rounds?.forEach(round => {
        round.tasks?.forEach(task => {
          userStats[email].marathonTasks++;
          if (task.completed) {
            userStats[email].completedMarathonTasks++;
            userStats[email].points += 5; // 5 pontos por tarefa de maratona
          }
        });
      });
    });

    return Object.values(userStats)
      .map(user => ({
        ...user,
        totalCompleted: user.completedGoals + user.completedMarathonTasks,
        name: user.email.split('@')[0]
      }))
      .sort((a, b) => b.points - a.points);
  };

  const rankings = calculateUserStats();
  const isLoading = loadingGoals || loadingMarathons;

  const getMedalIcon = (position) => {
    if (position === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (position === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-gray-400 font-bold">{position + 1}º</span>;
  };

  const getMedalColor = (position) => {
    if (position === 0) return 'from-yellow-400 to-yellow-500 border-yellow-300';
    if (position === 1) return 'from-gray-300 to-gray-400 border-gray-200';
    if (position === 2) return 'from-amber-500 to-amber-600 border-amber-400';
    return 'from-white to-gray-50 border-gray-200';
  };

  const getInitials = (email) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const currentUserRank = rankings.findIndex(r => r.email === currentUser?.email);
  const currentUserStats = rankings.find(r => r.email === currentUser?.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Ranking Natalino
          </h1>
          <p className="text-gray-500 mt-1">Quem está arrasando nas metas de fim de ano? 🏆</p>
        </div>

        {/* Current User Stats */}
        {currentUserStats && (
          <Card className="mb-8 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-16 h-16 border-4 border-white/30">
                    <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                      {getInitials(currentUserStats.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                    <Star className="w-4 h-4 text-yellow-800" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white/80 text-sm">Sua posição</p>
                  <p className="text-3xl font-bold">{currentUserRank + 1}º lugar</p>
                  <p className="text-white/70 text-sm">{currentUserStats.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm">Pontos</p>
                  <p className="text-4xl font-bold">{currentUserStats.points}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
                <div className="text-center">
                  <p className="text-2xl font-bold">{currentUserStats.completedGoals}</p>
                  <p className="text-white/70 text-xs">Metas Concluídas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{currentUserStats.completedMarathonTasks}</p>
                  <p className="text-white/70 text-xs">Tarefas Maratona</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{currentUserStats.totalCompleted}</p>
                  <p className="text-white/70 text-xs">Total Concluído</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="geral">🏆 Geral</TabsTrigger>
            <TabsTrigger value="metas">🎯 Metas</TabsTrigger>
            <TabsTrigger value="maratonas">🏅 Maratonas</TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-yellow-100 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-700">
                  <Sparkles className="w-5 h-5" />
                  Ranking por Pontos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-yellow-400 mx-auto animate-pulse" />
                    <p className="text-gray-500 mt-4">Carregando ranking...</p>
                  </div>
                ) : rankings.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Nenhum participante ainda</p>
                    <p className="text-sm">Seja o primeiro a completar metas!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rankings.map((user, index) => (
                      <div
                        key={user.email}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 bg-gradient-to-r ${getMedalColor(index)} transition-all hover:shadow-md ${
                          user.email === currentUser?.email ? 'ring-2 ring-red-400 ring-offset-2' : ''
                        }`}
                      >
                        <div className="w-10 h-10 flex items-center justify-center">
                          {getMedalIcon(index)}
                        </div>
                        <Avatar className="w-12 h-12 border-2 border-white shadow">
                          <AvatarFallback className={`${index < 3 ? 'bg-white text-gray-800' : 'bg-gray-100 text-gray-600'} font-bold`}>
                            {getInitials(user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className={`font-semibold ${index < 3 ? 'text-white' : 'text-gray-800'}`}>
                            {user.name}
                            {user.email === currentUser?.email && (
                              <Badge className="ml-2 bg-red-500 text-white text-xs">Você</Badge>
                            )}
                          </p>
                          <p className={`text-sm ${index < 3 ? 'text-white/80' : 'text-gray-500'}`}>
                            {user.totalCompleted} atividades concluídas
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${index < 3 ? 'text-white' : 'text-gray-800'}`}>
                            {user.points}
                          </p>
                          <p className={`text-xs ${index < 3 ? 'text-white/70' : 'text-gray-400'}`}>pontos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-red-100 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                  <Target className="w-5 h-5" />
                  Ranking por Metas Concluídas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankings
                    .sort((a, b) => b.completedGoals - a.completedGoals)
                    .map((user, index) => (
                      <div
                        key={user.email}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                          user.email === currentUser?.email 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-white border-gray-100'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="font-bold text-red-600">{index + 1}</span>
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-red-100 text-red-600">
                            {getInitials(user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{user.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-xl font-bold text-gray-800">{user.completedGoals}</span>
                          <span className="text-gray-400">/ {user.totalGoals}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maratonas">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-100 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                  <Flame className="w-5 h-5" />
                  Ranking por Tarefas de Maratona
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankings
                    .sort((a, b) => b.completedMarathonTasks - a.completedMarathonTasks)
                    .map((user, index) => (
                      <div
                        key={user.email}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                          user.email === currentUser?.email 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-100'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="font-bold text-green-600">{index + 1}</span>
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-green-100 text-green-600">
                            {getInitials(user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{user.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          <span className="text-xl font-bold text-gray-800">{user.completedMarathonTasks}</span>
                          <span className="text-gray-400">/ {user.marathonTasks}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Points Info */}
        <Card className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100">
          <CardContent className="p-4">
            <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Como ganhar pontos?
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <Target className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">Meta concluída</p>
                  <p className="text-purple-600">+10 pontos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">Tarefa maratona</p>
                  <p className="text-purple-600">+5 pontos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}