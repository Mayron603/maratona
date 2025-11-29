import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Trophy, Sparkles, Lock } from 'lucide-react';
import MarathonCard from '@/components/marathon/MarathonCard';
import MarathonForm from '@/components/marathon/MarathonForm';

export default function Marathons() {
  const [showForm, setShowForm] = useState(false);
  const [editingMarathon, setEditingMarathon] = useState(null); // Estado para edição
  const queryClient = useQueryClient();

  // 1. Busca usuário atual
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // 2. Busca lista de maratonas
  const { data: marathons = [], isLoading } = useQuery({
    queryKey: ['marathons'],
    queryFn: () => base44.entities.Marathon.list(),
  });

  // 3. NOVO: Busca lista de inscrições do usuário para saber qual botão mostrar
  const { data: myProgressList = [] } = useQuery({
    queryKey: ['my-progress'],
    queryFn: () => base44.entities.Marathon.getMyProgressList(),
  });

  // Mutações (Criar, Atualizar, Deletar, Inscrever)
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Marathon.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marathons'] });
      setShowForm(false);
      alert('Maratona criada com sucesso!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Marathon.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marathons'] });
      setShowForm(false);
      setEditingMarathon(null);
      alert('Maratona atualizada com sucesso!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Marathon.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marathons'] });
    },
  });

  // NOVO: Mutação para se inscrever
  const subscribeMutation = useMutation({
    mutationFn: (id) => base44.entities.Marathon.subscribe(id),
    onSuccess: () => {
      // Atualiza a lista de progresso para o botão mudar na hora
      queryClient.invalidateQueries({ queryKey: ['my-progress'] });
    },
  });

  // Handlers (Funções de clique)
  const handleSubmit = (data) => {
    if (editingMarathon) {
      updateMutation.mutate({ id: editingMarathon.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (marathon) => {
    setEditingMarathon(marathon);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta maratona?')) deleteMutation.mutate(id);
  };

  // NOVO: Handler de inscrição
  const handleSubscribe = (id) => {
    subscribeMutation.mutate(id);
  };

  const isAdmin = currentUser?.role === 'admin';

  // --- MODELOS PRONTOS ---
  const templates = [
    {
      name: '🎬 Maratona de Filmes de Natal',
      type: 'filmes_natal',
      description: 'Os clássicos que não podem faltar!',
      rounds: [
        { id: '1', title: 'Clássicos Obrigatórios', tasks: [
          { id: '1-1', text: 'Esqueceram de Mim' },
          { id: '1-2', text: 'O Grinch' },
          { id: '1-3', text: 'Um Conto de Natal' }
        ]},
        { id: '2', title: 'Animações', tasks: [
          { id: '2-1', text: 'Klaus' },
          { id: '2-2', text: 'Expresso Polar' }
        ]}
      ]
    },
    {
      name: '📚 Maratona Literária de Inverno',
      type: 'literaria',
      description: 'Leituras aconchegantes para o fim de ano',
      rounds: [
        { id: '1', title: 'Romances de Natal', tasks: [
          { id: '1-1', text: 'Ler um livro com "Natal" no título' },
          { id: '1-2', text: 'Ler um romance que se passa na neve' }
        ]},
        { id: '2', title: 'Desafios', tasks: [
          { id: '2-1', text: 'Ler um livro de capa vermelha' },
          { id: '2-2', text: 'Ler um livro de capa verde' }
        ]}
      ]
    },
    {
      name: '🎄 12 Dias de Natal',
      type: '12_dias',
      description: 'Um desafio especial de 12 dias!',
      rounds: [
        { id: '1', title: 'Preparação', tasks: [
          { id: '1-1', text: 'Montar a árvore' },
          { id: '1-2', text: 'Fazer lista de presentes' }
        ]},
        { id: '2', title: 'Celebração', tasks: [
          { id: '2-1', text: 'Assistir filme de Natal' },
          { id: '2-2', text: 'Ceia em família' }
        ]}
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho e Botão de Criar (Admin) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Maratonas
            </h1>
            <p className="text-gray-500 mt-1">Desafios temáticos para o fim de ano 🏆</p>
          </div>
          
          {isAdmin ? (
            <Button 
              onClick={() => { setEditingMarathon(null); setShowForm(true); }} 
              className="mt-4 md:mt-0 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Plus className="w-4 h-4 mr-2" /> Nova Maratona
            </Button>
          ) : (
             <div className="mt-4 md:mt-0 flex items-center gap-2 text-gray-400 text-sm bg-gray-100 px-3 py-1 rounded-full">
                <Lock className="w-3 h-3" /> <span>Apenas admins criam</span>
             </div>
          )}
        </div>

        {/* Templates (Apenas Admin) */}
        {isAdmin && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 mb-8 border-2 border-yellow-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Modelos Prontos
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {templates.map((template, i) => (
                <button
                  key={i}
                  onClick={() => createMutation.mutate(template)}
                  className="text-left p-4 bg-white rounded-xl hover:shadow-lg transition-all border-2 border-transparent hover:border-yellow-300 group"
                >
                  <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-yellow-600 transition-colors">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                  <p className="text-xs text-yellow-600 mt-2 font-medium">Clique para criar →</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grid de Maratonas */}
        {isLoading ? (
          <div className="text-center py-12"><Sparkles className="w-12 h-12 text-green-400 mx-auto animate-pulse" /></div>
        ) : marathons.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl border-2 border-dashed border-green-200">
            <p className="text-gray-500">Nenhuma maratona ativa.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marathons.map(marathon => {
              // Verifica se o usuário já está inscrito nesta maratona
              const userProgress = myProgressList.find(p => p.marathonId === marathon.id);
              
              return (
                <MarathonCard 
                  key={marathon.id} 
                  marathon={marathon} 
                  userProgress={userProgress} // Passa o progresso (ou undefined)
                  onDelete={isAdmin ? handleDelete : null} 
                  onEdit={isAdmin ? handleEdit : null}
                  onSubscribe={handleSubscribe} // Passa a função de inscrição
                />
              );
            })}
          </div>
        )}

        {/* Formulário de Criação/Edição */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl p-0 border-0 bg-transparent max-h-[90vh]">
            <MarathonForm 
              marathon={editingMarathon} 
              onSubmit={handleSubmit} 
              onCancel={() => { setShowForm(false); setEditingMarathon(null); }} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}