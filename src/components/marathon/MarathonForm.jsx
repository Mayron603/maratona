import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2, Sparkles, Save } from 'lucide-react';

const marathonTypes = [
  { value: 'filmes_natal', label: '🎬 Maratona de Filmes de Natal' },
  { value: 'literaria', label: '📚 Maratona Literária' },
  { value: '12_dias', label: '🎄 12 Dias de Natal' },
  { value: 'personalizada', label: '⭐ Personalizada' }
];

// Recebe a prop 'marathon' (opcional) para edição
export default function MarathonForm({ marathon, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'personalizada',
    start_date: '',
    end_date: '',
    rounds: [{ id: '1', title: 'Round 1', tasks: [{ id: '1-1', text: '', completed: false }] }]
  });

  // Preenche o formulário se estiver editando
  useEffect(() => {
    if (marathon) {
      setFormData({
        name: marathon.name || '',
        description: marathon.description || '',
        type: marathon.type || 'personalizada',
        start_date: marathon.start_date || '',
        end_date: marathon.end_date || '',
        // Garante que rounds e tasks existam para não quebrar
        rounds: marathon.rounds?.length ? marathon.rounds : [{ id: '1', title: 'Round 1', tasks: [{ id: '1-1', text: '', completed: false }] }]
      });
    }
  }, [marathon]);

  const addRound = () => {
    const newRoundId = String(formData.rounds.length + 1);
    setFormData({
      ...formData,
      rounds: [...formData.rounds, { 
        id: newRoundId, 
        title: `Round ${newRoundId}`, 
        tasks: [{ id: `${newRoundId}-1`, text: '', completed: false }] 
      }]
    });
  };

  const removeRound = (roundIndex) => {
    setFormData({
      ...formData,
      rounds: formData.rounds.filter((_, i) => i !== roundIndex)
    });
  };

  const updateRoundTitle = (roundIndex, title) => {
    const newRounds = [...formData.rounds];
    newRounds[roundIndex].title = title;
    setFormData({ ...formData, rounds: newRounds });
  };

  const addTask = (roundIndex) => {
    const newRounds = [...formData.rounds];
    const taskId = `${roundIndex + 1}-${newRounds[roundIndex].tasks.length + 1}`;
    newRounds[roundIndex].tasks.push({ id: taskId, text: '', completed: false });
    setFormData({ ...formData, rounds: newRounds });
  };

  const removeTask = (roundIndex, taskIndex) => {
    const newRounds = [...formData.rounds];
    newRounds[roundIndex].tasks = newRounds[roundIndex].tasks.filter((_, i) => i !== taskIndex);
    setFormData({ ...formData, rounds: newRounds });
  };

  const updateTaskText = (roundIndex, taskIndex, text) => {
    const newRounds = [...formData.rounds];
    newRounds[roundIndex].tasks[taskIndex].text = text;
    setFormData({ ...formData, rounds: newRounds });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="bg-gradient-to-br from-white to-green-50 border-2 border-green-100 shadow-xl max-h-[80vh] overflow-y-auto">
      <CardHeader className="pb-4 sticky top-0 bg-gradient-to-br from-white to-green-50 z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Sparkles className="w-5 h-5" />
            {marathon ? 'Editar Maratona' : 'Nova Maratona Natalina'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Maratona 🎄</Label>
            <Input
              id="name"
              placeholder="Ex: Maratona de Filmes de Natal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-green-200 focus:border-green-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Sobre o que é essa maratona..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border-green-200 focus:border-green-400 h-20"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo da Maratona</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
              <SelectTrigger className="border-green-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {marathonTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="border-green-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Término</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="border-green-200"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Rounds & Desafios 🏆</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRound} className="border-green-300">
                <Plus className="w-4 h-4 mr-1" /> Add Round
              </Button>
            </div>

            {formData.rounds.map((round, roundIndex) => (
              <div key={round.id} className="bg-white rounded-xl p-4 border-2 border-green-100 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={round.title}
                    onChange={(e) => updateRoundTitle(roundIndex, e.target.value)}
                    className="font-semibold border-green-200"
                    placeholder="Nome do Round"
                  />
                  {formData.rounds.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeRound(roundIndex)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2 pl-4">
                  {round.tasks.map((task, taskIndex) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <span className="text-green-500">☐</span>
                      <Input
                        value={task.text}
                        onChange={(e) => updateTaskText(roundIndex, taskIndex, e.target.value)}
                        placeholder="Descreva a tarefa..."
                        className="flex-1 border-green-100"
                      />
                      {round.tasks.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeTask(roundIndex, taskIndex)}>
                          <X className="w-3 h-3 text-gray-400" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="ghost" size="sm" onClick={() => addTask(roundIndex)} className="text-green-600">
                    <Plus className="w-3 h-3 mr-1" /> Adicionar tarefa
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
              {marathon ? <><Save className="w-4 h-4 mr-2" /> Salvar Alterações</> : 'Criar Maratona 🎁'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}