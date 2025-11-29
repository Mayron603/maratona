import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await base44.auth.login(formData.email, formData.password);
        navigate('/dashboard'); // Vai para o dashboard após login
      } else {
        await base44.auth.register(formData.name, formData.email, formData.password);
        alert('Conta criada! Faça login agora.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-red-600 font-bold">
            {isLogin ? '🎅 Login Natalino' : '🎄 Criar Conta'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input 
                placeholder="Seu Nome" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required 
              />
            )}
            <Input 
              type="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required 
            />
            <Input 
              type="password" 
              placeholder="Senha" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required 
            />
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-600">
            {isLogin ? 'Não tem conta?' : 'Já tem conta?'}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="ml-2 text-green-600 font-bold hover:underline"
            >
              {isLogin ? 'Cadastre-se' : 'Fazer Login'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}