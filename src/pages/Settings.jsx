import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider"; 
import { 
  Settings as SettingsIcon, 
  Snowflake, 
  Music, 
  Lightbulb, 
  Palette, 
  RefreshCw, 
  Sparkles,
  AlertTriangle,
  Check,
  User,
  Mail,
  LogOut,
  Volume2,
  Camera, 
  Loader2
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Settings() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null); // Referência para o input de arquivo

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const result = await base44.entities.Settings.list();
      return result[0] || { snow_enabled: true, music_enabled: false, music_volume: 0.5, lights_enabled: true, theme: 'vermelho' };
    },
  });

  const [localSettings, setLocalSettings] = useState({
    snow_enabled: true,
    music_enabled: false,
    music_volume: 0.5,
    lights_enabled: true,
    theme: 'vermelho'
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        ...settings,
        music_volume: settings.music_volume ?? 0.5
      });
    }
  }, [settings]);

  // --- MUTAÇÃO: Salvar Configurações (Neve, Música, etc) ---
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const existing = await base44.entities.Settings.list();
      if (existing.length > 0 && existing[0].id) {
        return base44.entities.Settings.update(existing[0].id, data);
      } else {
        return base44.entities.Settings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (error) => {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar: " + error.message);
    }
  });

  // --- MUTAÇÃO: Salvar Foto de Perfil ---
  const profileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      alert("Foto de perfil atualizada!");
    },
    onError: () => alert("Erro ao atualizar foto. Tente uma imagem menor (max 500kb).")
  });

  // --- MUTAÇÃO: Resetar ---
  const resetMutation = useMutation({
    mutationFn: async () => {
      const goals = await base44.entities.Goal.list();
      const marathons = await base44.entities.Marathon.list();
      for (const goal of goals) await base44.entities.Goal.delete(goal.id);
      for (const marathon of marathons) await base44.entities.Marathon.delete(marathon.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      alert('Progresso resetado com sucesso!');
    },
  });

  // Lógica de Upload de Imagem
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1000000 * 1024) { // 500KB
        alert("A imagem é muito grande! Use uma imagem menor que 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        profileMutation.mutate({ avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar todo o progresso? Esta ação não pode ser desfeita!')) {
      resetMutation.mutate();
    }
  };

  const themes = [
    { value: 'vermelho', label: 'Vermelho Natalino', color: 'bg-red-500' },
    { value: 'verde', label: 'Verde Pinheiro', color: 'bg-green-600' },
    { value: 'dourado', label: 'Dourado Festivo', color: 'bg-yellow-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-gray-600" />
            Configurações
          </h1>
          <p className="text-gray-500 mt-1">Personalize sua experiência natalina ⚙️</p>
        </div>

        {saved && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Salvo!</AlertTitle>
            <AlertDescription className="text-green-700">
              Suas configurações foram salvas com sucesso.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          
          {/* --- BLOCO DA CONTA COM FOTO --- */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-100 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                <User className="w-5 h-5" /> Minha Conta
              </CardTitle>
              <CardDescription>Informações do seu perfil</CardDescription>
            </CardHeader>
            <CardContent>
              {currentUser ? (
                <div className="flex items-center gap-6">
                  {/* Área do Avatar */}
                  <div className="relative group">
                    <Avatar className="w-24 h-24 border-4 border-blue-100 shadow-lg">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback className="bg-blue-600 text-white text-3xl font-bold">
                        {currentUser.full_name?.slice(0, 2).toUpperCase() || currentUser.email?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Botão de Câmera (Upload) */}
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                      disabled={profileMutation.isPending}
                    >
                      {profileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Camera className="w-4 h-4 text-blue-600" />}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-xl">{currentUser.full_name || 'Usuário'}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <Mail className="w-4 h-4" /> {currentUser.email}
                    </div>
                    <div className="mt-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        currentUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {currentUser.role === 'admin' ? '👑 Administrador' : '🎄 Participante'}
                      </span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => base44.auth.logout()}>
                    <LogOut className="w-4 h-4 mr-2" /> Sair
                  </Button>
                </div>
              ) : <div className="text-center text-gray-500">Carregando informações...</div>}
            </CardContent>
          </Card>

          {/* --- MODO FESTIVO COM VOLUME --- */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-red-100 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                <Sparkles className="w-5 h-5" /> Modo Festivo
              </CardTitle>
              <CardDescription>Controle os efeitos visuais natalinos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100"><Snowflake className="w-5 h-5 text-blue-600" /></div>
                  <div><Label htmlFor="snow" className="font-medium">Neve Caindo</Label></div>
                </div>
                <Switch id="snow" checked={localSettings.snow_enabled} onCheckedChange={(c) => setLocalSettings({ ...localSettings, snow_enabled: c })} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-yellow-100"><Lightbulb className="w-5 h-5 text-yellow-600" /></div>
                  <div><Label htmlFor="lights" className="font-medium">Luzes Piscando</Label></div>
                </div>
                <Switch id="lights" checked={localSettings.lights_enabled} onCheckedChange={(c) => setLocalSettings({ ...localSettings, lights_enabled: c })} />
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-100"><Music className="w-5 h-5 text-purple-600" /></div>
                    <div>
                      <Label htmlFor="music" className="font-medium">Música Natalina</Label>
                      <p className="text-sm text-gray-500">Música ambiente suave</p>
                    </div>
                  </div>
                  <Switch id="music" checked={localSettings.music_enabled} onCheckedChange={(c) => setLocalSettings({ ...localSettings, music_enabled: c })} />
                </div>

                {localSettings.music_enabled && (
                  <div className="pl-12 pr-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                      <Slider 
                        defaultValue={[localSettings.music_volume * 100]} 
                        max={100} 
                        step={1} 
                        onValueChange={(val) => setLocalSettings({ ...localSettings, music_volume: val[0] / 100 })}
                      />
                      <span className="text-xs font-bold text-gray-500 w-8 text-right">
                        {Math.round(localSettings.music_volume * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-100 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                <Palette className="w-5 h-5" /> Tema de Cores
              </CardTitle>
              <CardDescription>Escolha o tema principal do site</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={localSettings.theme} onValueChange={(v) => setLocalSettings({ ...localSettings, theme: v })} className="grid grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <Label key={theme.value} htmlFor={theme.value} className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${localSettings.theme === theme.value ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <RadioGroupItem value={theme.value} id={theme.value} className="sr-only" />
                    <div className={`w-10 h-10 rounded-full ${theme.color} mb-2 shadow-lg`} />
                    <span className="text-sm font-medium text-gray-700">{theme.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Reset */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-orange-100 shadow-xl">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2 text-orange-700"><RefreshCw className="w-5 h-5" /> Resetar Progresso</CardTitle></CardHeader>
            <CardContent>
              <Alert className="bg-orange-50 border-orange-200 mb-4"><AlertTriangle className="h-4 w-4 text-orange-600" /><AlertTitle className="text-orange-800">Atenção!</AlertTitle><AlertDescription className="text-orange-700">Esta ação apaga tudo. Não pode ser desfeita.</AlertDescription></Alert>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50" onClick={handleReset} disabled={resetMutation.isPending}>{resetMutation.isPending ? 'Resetando...' : 'Resetar Tudo'}</Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => saveMutation.mutate(localSettings)} disabled={saveMutation.isPending} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-8">{saveMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}