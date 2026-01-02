import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Camera, Save, Sparkles, LogOut, Upload } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState({ name: '', email: '', avatar: '' });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await base44.auth.me();
      if (data) setUser(data);
    } catch (error) {
      console.error("Erro ao carregar perfil", error);
    }
  };

  // --- MÁGICA DE CONVERTER IMAGEM PARA TEXTO (BASE64) ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // O resultado é uma string longa que representa a imagem
        setUser(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  // -----------------------------------------------------

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await base44.auth.updateProfile(user);
      alert("✨ Perfil e Foto atualizados com sucesso!");
    } catch (error) {
      alert("Erro ao atualizar perfil. A imagem pode ser muito grande (máx 10MB).");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-[#0a0500] text-[#E2D1C3] font-serif p-6 flex justify-center items-center relative overflow-hidden">
      
      {/* Fundo Atmosférico */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_#3E2723_0%,_#1a0f0a_60%,_#000000_100%)] opacity-80 pointer-events-none"></div>
      <div className="fixed inset-0 opacity-20 pointer-events-none mix-blend-screen" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

      <div className="w-full max-w-2xl relative z-10 animate-in fade-in zoom-in duration-700">
        
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold font-headline uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#bf953f] drop-shadow-md">
            Configurações do Mago
          </h1>
          <p className="text-[#bf953f]/60 italic">"Personalize sua identidade no castelo."</p>
        </div>

        <Card className="bg-black/40 backdrop-blur-md border border-[#bf953f]/30 shadow-2xl">
          <CardHeader className="border-b border-[#bf953f]/10 pb-6">
            <div className="flex flex-col items-center gap-4">
              
              {/* ÁREA DO AVATAR CLICÁVEL */}
              <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                <div className="absolute inset-0 bg-[#bf953f] rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                
                <Avatar className="w-32 h-32 border-2 border-[#bf953f] shadow-xl transition-transform group-hover:scale-105">
                  <AvatarImage src={user.avatar} className="object-cover" />
                  <AvatarFallback className="bg-[#1a0f0a] text-[#bf953f] text-3xl font-headline">
                    {user.name?.slice(0,2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Overlay de Câmera ao passar o mouse */}
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                </div>
                
                {/* Ícone de upload fixo */}
                <div className="absolute bottom-1 right-1 bg-[#bf953f] text-black rounded-full p-2 shadow-lg hover:bg-[#d4a74c] transition-colors">
                  <Upload size={14} />
                </div>
              </div>
              
              {/* Input de arquivo escondido */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />

              <div className="text-center">
                <p className="text-lg font-bold text-[#E2D1C3]">{user.name || 'Feiticeiro Anônimo'}</p>
                <p className="text-sm text-[#E2D1C3]/50">{user.email}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            
            {/* Input Nome */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[#bf953f] font-bold flex items-center gap-2">
                <User size={14} /> Nome de Bruxo
              </label>
              <Input 
                value={user.name} 
                onChange={(e) => setUser({...user, name: e.target.value})}
                className="bg-white/5 border-[#bf953f]/20 text-[#E2D1C3] h-12 focus:border-[#bf953f] focus:ring-[#bf953f]/20 font-serif text-lg"
              />
            </div>

            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[#bf953f] font-bold flex items-center gap-2">
                <Mail size={14} /> Email Mágico
              </label>
              <Input 
                value={user.email} 
                onChange={(e) => setUser({...user, email: e.target.value})}
                className="bg-white/5 border-[#bf953f]/20 text-[#E2D1C3] h-12 focus:border-[#bf953f] font-serif text-lg"
              />
            </div>

            <div className="pt-4 flex gap-4">
              <Button 
                onClick={handleUpdate} 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#bf953f] to-[#8c6b2d] hover:from-[#d4a74c] hover:to-[#a67f36] text-black font-bold uppercase tracking-widest h-12 shadow-[0_0_15px_rgba(191,149,63,0.3)] transition-all hover:scale-[1.02]"
              >
                {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Salvar Alterações</>}
              </Button>

              <Button 
                variant="outline"
                onClick={handleLogout} 
                className="border-red-900/30 text-red-400 hover:bg-red-950/30 hover:text-red-300 uppercase tracking-widest h-12 px-6"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');
        .font-headline { font-family: 'Cinzel', serif; }
      `}</style>
    </div>
  );
}