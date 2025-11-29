import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Film, Book, Tv, Activity, Target, Heart, BookOpen, Footprints,
  CheckCircle2, Clock, Circle, Trash2, Edit, XCircle // <--- 1. Adicione XCircle aqui
} from 'lucide-react';

const categoryIcons = {
  filmes: Film,
  livros: Book,
  series: Tv,
  atividades: Activity,
  desafios: Target,
  autocuidado: Heart,
  leitura: BookOpen,
  fisicas: Footprints
};

const categoryColors = {
  filmes: "bg-purple-100 text-purple-700 border-purple-200",
  livros: "bg-blue-100 text-blue-700 border-blue-200",
  series: "bg-pink-100 text-pink-700 border-pink-200",
  atividades: "bg-green-100 text-green-700 border-green-200",
  desafios: "bg-orange-100 text-orange-700 border-orange-200",
  autocuidado: "bg-red-100 text-red-700 border-red-200",
  leitura: "bg-indigo-100 text-indigo-700 border-indigo-200",
  fisicas: "bg-teal-100 text-teal-700 border-teal-200"
};

const statusConfig = {
  nao_iniciado: { icon: Circle, color: "text-gray-400", label: "Não iniciado", bg: "bg-gray-100" },
  em_progresso: { icon: Clock, color: "text-yellow-500", label: "Em progresso", bg: "bg-yellow-100" },
  concluido: { icon: CheckCircle2, color: "text-green-500", label: "Concluído", bg: "bg-green-100" },
  // 2. Adicionando a configuração do VERMELHO aqui:
  cancelado: { icon: XCircle, color: "text-red-500", label: "Cancelado", bg: "bg-red-100" } 
};

const priorityColors = {
  baixa: "bg-blue-50 text-blue-600 border-blue-200",
  media: "bg-yellow-50 text-yellow-600 border-yellow-200",
  alta: "bg-red-50 text-red-600 border-red-200"
};

export default function GoalCard({ goal, onStatusChange, onEdit, onDelete }) {
  const CategoryIcon = categoryIcons[goal.category] || Target;
  // Fallback seguro caso o status não exista no config
  const currentStatusConfig = statusConfig[goal.status] || statusConfig.nao_iniciado;
  const StatusIcon = currentStatusConfig.icon;

  const cycleStatus = () => {
    // 3. Adicione 'cancelado' nesta lista para ele aparecer no clique
    const statuses = ['nao_iniciado', 'em_progresso', 'concluido', 'cancelado'];
    const currentIndex = statuses.indexOf(goal.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    onStatusChange(goal.id, nextStatus);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-red-200 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button 
            onClick={cycleStatus}
            className={`p-2 rounded-full ${currentStatusConfig.bg} transition-all hover:scale-110`}
            title={currentStatusConfig.label}
          >
            <StatusIcon className={`w-5 h-5 ${currentStatusConfig.color}`} />
          </button>
          
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-gray-800 truncate ${goal.status === 'concluido' || goal.status === 'cancelado' ? 'line-through text-gray-400' : ''}`}>
              {goal.title}
            </h4>
            {goal.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{goal.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge className={`${categoryColors[goal.category]} border text-xs`}>
                <CategoryIcon className="w-3 h-3 mr-1" />
                {goal.category}
              </Badge>
              <Badge className={`${priorityColors[goal.priority]} border text-xs`}>
                {goal.priority}
              </Badge>
              {goal.due_date && (
                <Badge variant="outline" className="text-xs">
                  📅 {new Date(goal.due_date).toLocaleDateString('pt-BR')}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(goal)}>
              <Edit className="w-4 h-4 text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(goal.id)}>
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}