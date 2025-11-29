import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Film, Book, Calendar, Star, Trash2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const typeConfig = {
  filmes_natal: { icon: Film, label: 'Filmes de Natal', color: 'bg-purple-100 text-purple-700' },
  literaria: { icon: Book, label: 'Literária', color: 'bg-blue-100 text-blue-700' },
  '12_dias': { icon: Calendar, label: '12 Dias de Natal', color: 'bg-red-100 text-red-700' },
  personalizada: { icon: Star, label: 'Personalizada', color: 'bg-yellow-100 text-yellow-700' }
};

export default function MarathonCard({ marathon, onDelete }) {
  const TypeIcon = typeConfig[marathon.type]?.icon || Star;
  
  const totalTasks = marathon.rounds?.reduce((acc, round) => acc + (round.tasks?.length || 0), 0) || 0;
  const completedTasks = marathon.rounds?.reduce((acc, round) => 
    acc + (round.tasks?.filter(t => t.completed)?.length || 0), 0) || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50 border-2 border-green-100 hover:border-green-300 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-transparent rounded-bl-full" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-100">
              <TypeIcon className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-800">{marathon.name}</CardTitle>
              <Badge className={`${typeConfig[marathon.type]?.color} mt-1 text-xs`}>
                {typeConfig[marathon.type]?.label}
              </Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(marathon.id)}
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {marathon.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{marathon.description}</p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Progresso</span>
            <span className="font-semibold text-green-700">{completedTasks}/{totalTasks} tarefas</span>
          </div>
          <Progress value={progress} className="h-2 bg-green-100" />

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-400">
              {marathon.rounds?.length || 0} rounds
            </div>
            <Link to={createPageUrl(`MarathonDetail?id=${marathon.id}`)}>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-1" /> Continuar
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}