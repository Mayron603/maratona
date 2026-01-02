import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2, Scroll, KeyRound, User, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Alternar entre Login e Cadastro
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN ---
        await base44.auth.login(formData.email, formData.password);
        // Se der certo, vai para a Home ou Sprints
        navigate('/');
      } else {
        // --- CADASTRO ---
        await base44.auth.register(formData.name, formData.email, formData.password);
        // Após cadastrar, faz login automático
        await base44.auth.login(formData.email, formData.password);
        navigate('/');
      }
    } catch (error) {
      alert("O feitiço falhou! Verifique suas credenciais.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0500] text-[#E2D1C3] font-serif flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Fundo Atmosférico */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_#3E2723_0%,_#1a0f0a_60%,_#000000_100%)] opacity-80 pointer-events-none"></div>
      <div className="fixed inset-0 opacity-20 pointer-events-none mix-blend-screen" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        
        {/* Logo / Título */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-block p-4 rounded-full bg-[#bf953f]/10 border border-[#bf953f]/30 mb-4 shadow-[0_0_20px_rgba(191,149,63,0.2)]">
            <Wand2 className="w-8 h-8 text-[#bf953f]" />
          </div>
          <h1 className="text-4xl font-bold font-headline uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#bf953f] drop-shadow-md">
            {isLogin ? 'Entrar no Castelo' : 'Assinar Matrícula'}
          </h1>
          <p className="text-[#bf953f]/60 italic font-serif">
            {isLogin ? '"A senha, por favor..."' : '"Onde a magia começa."'}
          </p>
        </div>

        <Card className="bg-black/40 backdrop-blur-md border border-[#bf953f]/30 shadow-2xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Nome (Só aparece no cadastro) */}
              {!isLogin && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-xs uppercase tracking-widest text-[#bf953f] font-bold flex items-center gap-2">
                    <User size={14} /> Nome do Bruxo
                  </label>
                  <Input 
                    required={!isLogin}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-white/5 border-[#bf953f]/20 text-[#E2D1C3] h-12 focus:border-[#bf953f] font-serif text-lg"
                    placeholder="Ex: Harry Potter"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-[#bf953f] font-bold flex items-center gap-2">
                  <Scroll size={14} /> Email Mágico
                </label>
                <Input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-white/5 border-[#bf953f]/20 text-[#E2D1C3] h-12 focus:border-[#bf953f] font-serif text-lg"
                  placeholder="seu@coruja.com"
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-[#bf953f] font-bold flex items-center gap-2">
                  <KeyRound size={14} /> Palavra-Chave
                </label>
                <Input 
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="bg-white/5 border-[#bf953f]/20 text-[#E2D1C3] h-12 focus:border-[#bf953f] font-serif text-lg"
                  placeholder="••••••••"
                />
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#bf953f] to-[#8c6b2d] hover:from-[#d4a74c] hover:to-[#a67f36] text-black font-bold uppercase tracking-widest h-14 shadow-[0_0_15px_rgba(191,149,63,0.3)] transition-all hover:scale-[1.02] mt-4"
              >
                {loading ? <Sparkles className="w-5 h-5 animate-spin" /> : (isLogin ? 'Alohomora (Entrar)' : 'Firmar Pacto')}
              </Button>

            </form>

            {/* Alternar entre Login/Cadastro */}
            <div className="mt-6 text-center">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-[#bf953f]/80 hover:text-[#bf953f] underline decoration-[#bf953f]/30 underline-offset-4 transition-colors font-serif italic"
              >
                {isLogin ? 'Ainda não possui matrícula? Cadastre-se' : 'Já é um bruxo? Faça login'}
              </button>
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