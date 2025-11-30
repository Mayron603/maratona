import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Film, Book, Calendar, Star, Trash2, Play, Edit, User, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const typeConfig = {
  filmes_natal: { icon: Film, label: 'Filmes de Natal', color: 'bg-purple-100 text-purple-700' },
  literaria: { icon: Book, label: 'Literária', color: 'bg-blue-100 text-blue-700' },
  '12_dias': { icon: Calendar, label: '12 Dias de Natal', color: 'bg-red-100 text-red-700' },
  personalizada: { icon: Star, label: 'Personalizada', color: 'bg-yellow-100 text-yellow-700' }
};

export default function MarathonCard({ marathon, userProgress, participants = [], onDelete, onEdit, onSubscribe }) {
  const TypeIcon = typeConfig[marathon.type]?.icon || Star;
  const isSubscribed = !!userProgress;

  const totalTasks = marathon.rounds?.reduce((acc, round) => acc + (round.tasks?.length || 0), 0) || 0;
  const completedTasks = isSubscribed ? userProgress.tasks?.filter(t => t.completed).length || 0 : 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getCreatorName = () => {
    if (marathon.created_by_name) return marathon.created_by_name.split(' ')[0];
    return 'Admin';
  };

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 border-2 overflow-hidden ${
      isSubscribed ? 'bg-gradient-to-br from-white to-green-50 border-green-100 hover:border-green-300' : 'bg-white border-gray-100 hover:border-blue-200'
    }`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-bl-full ${
        isSubscribed ? 'from-green-200/30 to-transparent' : 'from-gray-100 to-transparent'
      }`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isSubscribed ? 'bg-green-100' : 'bg-gray-100'}`}>
              <TypeIcon className={`w-6 h-6 ${isSubscribed ? 'text-green-700' : 'text-gray-500'}`} />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-800">{marathon.name}</CardTitle>
              <Badge className={`${typeConfig[marathon.type]?.color} mt-1 text-xs`}>
                {typeConfig[marathon.type]?.label}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-yellow-50" onClick={() => onEdit(marathon)}>
                <Edit className="w-4 h-4 text-yellow-600" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={() => onDelete(marathon.id)}>
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {marathon.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{marathon.description}</p>
        )}

        {/* --- MOSTRAR PARTICIPANTES --- */}
        {participants.length > 0 && (
          <div className="flex items-center gap-2 mb-4 pl-1">
            <div className="flex -space-x-2">
              {participants.slice(0, 4).map((user) => (
                <Avatar key={user.id} className="w-6 h-6 border-2 border-white">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700 font-bold">
                    {user.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {participants.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-medium">
                  +{participants.length - 4}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {participants.length} {participants.length === 1 ? 'participante' : 'participantes'}
            </span>
          </div>
        )}
        {/* ----------------------------- */}

        <div className="space-y-3">
          {isSubscribed ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Seu Progresso</span>
                <span className="font-semibold text-green-700">{completedTasks}/{totalTasks}</span>
              </div>
              <Progress value={progress} className="h-2 bg-green-100" />
            </>
          ) : (
            <div className="text-sm text-gray-400 italic mb-2">
              Junte-se para começar!
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1 text-xs text-gray-400 bg-white/50 px-2 py-1 rounded-full">
              <User className="w-3 h-3" />
              <span>Por: {getCreatorName()}</span>
            </div>

            {isSubscribed ? (
              <Link to={createPageUrl(`MarathonDetail?id=${marathon.id}`)}>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-1" /> Continuar
                </Button>
              </Link>
            ) : (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onSubscribe(marathon.id)}>
                <PlusCircle className="w-4 h-4 mr-1" /> Participar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}