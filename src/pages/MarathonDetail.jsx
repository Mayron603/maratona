import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle2, Circle, StickyNote, Save, Trophy, Camera, Image as ImageIcon, Loader2, Trash2, RefreshCw } from 'lucide-react';

export default function MarathonDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const marathonId = urlParams.get('id');
  const queryClient = useQueryClient();
  
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempNote, setTempNote] = useState('');
  
  // Estados para upload de foto
  const fileInputRef = useRef(null);
  const [activeTaskIdForPhoto, setActiveTaskIdForPhoto] = useState(null);
  const [compressing, setCompressing] = useState(false);

  // 1. Busca a estrutura da Maratona
  const { data: marathon, isLoading: loadingMarathon } = useQuery({
    queryKey: ['marathon', marathonId],
    queryFn: async () => {
      const marathons = await base44.entities.Marathon.filter({ id: marathonId });
      return marathons[0];
    },
    enabled: !!marathonId,
  });

  // 2. Busca o progresso do usuário
  const { data: userProgress } = useQuery({
    queryKey: ['marathon-progress', marathonId],
    queryFn: () => base44.entities.Marathon.getProgress(marathonId),
    enabled: !!marathonId,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, completed, note, photo }) => 
      base44.entities.Marathon.updateTask(marathonId, taskId, completed, note, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marathon-progress', marathonId] });
      setEditingNoteId(null);
      setCompressing(false);
      setActiveTaskIdForPhoto(null);
    },
    onError: () => {
      setCompressing(false);
      alert("Erro ao salvar a tarefa.");
    }
  });

  const getTaskData = (taskId) => {
    return userProgress?.tasks?.find(t => t.taskId === taskId) || {};
  };

  const handleToggle = (taskId) => {
    const taskData = getTaskData(taskId);
    updateTaskMutation.mutate({ taskId, completed: !taskData.completed });
  };

  const handleSaveNote = (taskId) => {
    updateTaskMutation.mutate({ taskId, note: tempNote });
  };

  // --- LÓGICA DE FOTOS ---
  
  // Abrir seletor de arquivos
  const triggerPhotoUpload = (taskId) => {
    setActiveTaskIdForPhoto(taskId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Processar arquivo selecionado
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !activeTaskIdForPhoto) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Imagem muito grande! Escolha uma menor que 10MB.");
      return;
    }

    setCompressing(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // 0.6 para leveza
        
        // Atualiza a foto (sobrescreve se já existir)
        updateTaskMutation.mutate({ 
          taskId: activeTaskIdForPhoto, 
          photo: dataUrl,
          completed: true 
        });
      };
    };
  };

  // Deletar foto
  const handleDeletePhoto = (taskId) => {
    if (confirm("Tem certeza que deseja remover esta foto?")) {
      updateTaskMutation.mutate({ 
        taskId, 
        photo: "" // Envia string vazia para limpar no banco
      });
    }
  };
  // -----------------------

  if (loadingMarathon || !marathon) return <div className="p-8 text-center">Carregando maratona...</div>;

  const totalTasks = marathon.rounds?.reduce((acc, r) => acc + (r.tasks?.length || 0), 0) || 0;
  const completedTasks = marathon.rounds?.reduce((acc, r) => 
    acc + (r.tasks?.filter(t => getTaskData(t.id).completed)?.length || 0), 0) || 0;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 p-4 md:p-8">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />

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
                  const taskData = getTaskData(task.id);
                  const isCompleted = taskData.completed;
                  const note = taskData.note;
                  const photo = taskData.photo;
                  const isUploadingThis = compressing && activeTaskIdForPhoto === task.id;

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
                        
                        <div className="flex-1 min-w-0">
                          <span className={`block font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {task.text}
                          </span>
                          
                          <div className="mt-2 flex flex-wrap items-center gap-4">
                            {/* Nota */}
                            <div className="flex-1 min-w-[200px]">
                              {editingNoteId === task.id ? (
                                <div className="flex gap-2">
                                  <Input 
                                    value={tempNote}
                                    onChange={(e) => setTempNote(e.target.value)}
                                    placeholder="Descrição"
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
                                  <span className="truncate">{note || "Adicionar nota..."}</span>
                                </div>
                              )}
                            </div>

                            {/* Foto */}
                            <div className="flex items-center gap-2">
                              {photo ? (
                                <Dialog>
                                  <DialogTrigger>
                                    <div className="relative group cursor-pointer">
                                      <img src={photo} alt="Prova" className="w-8 h-8 rounded-lg object-cover border border-green-200 shadow-sm" />
                                      <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ImageIcon className="w-4 h-4 text-white" />
                                      </div>
                                    </div>
                                  </DialogTrigger>
                                  <DialogContent className="p-0 bg-transparent border-0 max-w-3xl flex flex-col items-center">
                                    <img src={photo} alt="Prova Full" className="max-h-[70vh] w-auto rounded-lg shadow-2xl mb-4" />
                                    
                                    {/* Botões de Ação na Foto */}
                                    <div className="flex gap-3">
                                      <Button 
                                        onClick={() => triggerPhotoUpload(task.id)}
                                        className="bg-white text-gray-800 hover:bg-gray-100"
                                      >
                                        <RefreshCw className="w-4 h-4 mr-2" /> Trocar Foto
                                      </Button>
                                      <Button 
                                        onClick={() => handleDeletePhoto(task.id)}
                                        variant="destructive"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" /> Apagar Foto
                                      </Button>
                                    </div>

                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className={`h-8 px-2 text-xs text-gray-400 hover:text-green-600 hover:bg-green-50 gap-1 ${isUploadingThis ? 'opacity-50 pointer-events-none' : ''}`}
                                  onClick={() => triggerPhotoUpload(task.id)}
                                >
                                  {isUploadingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                                  {isUploadingThis ? 'Enviando...' : 'Adicionar foto'}
                                </Button>
                              )}
                            </div>
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