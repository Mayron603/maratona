import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TreePine, Gift, Star, ArrowRight, Target, Calendar, Trophy } from 'lucide-react';
import ChristmasCountdown from '@/components/christmas/ChristmasCountdown';

export default function Home() {
  const features = [
    { icon: Target, title: 'Metas Personalizadas', desc: 'Crie metas de filmes, livros, séries e muito mais', color: 'from-red-500 to-red-600' },
    { icon: Trophy, title: 'Maratonas Temáticas', desc: 'Desafios de 12 dias, maratonas de filmes natalinos', color: 'from-green-500 to-green-600' },
    { icon: Calendar, title: 'Calendário Interativo', desc: 'Organize suas atividades dia a dia', color: 'from-yellow-500 to-yellow-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=1920')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
        
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-6 animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Natal 2025</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent">
              Missão
            </span>
            <br />
            <span className="text-gray-800">Natal</span>
            <span className="inline-block ml-3 animate-pulse">🎄</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Organize suas metas de fim de ano, crie maratonas temáticas e celebre 
            cada conquista nesta época mágica!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to={createPageUrl('Dashboard')}>
              <Button size="lg" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg px-8 py-6 rounded-xl shadow-lg shadow-red-200">
                <Gift className="w-5 h-5 mr-2" />
                Começar Maratoninha
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('Marathons')}>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl border-2 border-green-300 text-green-700 hover:bg-green-50">
                <TreePine className="w-5 h-5 mr-2" />
                Ver Maratonas
              </Button>
            </Link>
          </div>

          <div className="max-w-md mx-auto">
            <ChristmasCountdown />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Tudo para um fim de ano incrível ✨
          </h2>
          <p className="text-gray-600">Ferramentas pensadas para tornar sua experiência mais divertida</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories Preview */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Categorias de Metas 🎁</h2>
            <div className="flex flex-wrap gap-3 mb-8">
              {['🎬 Filmes', '📚 Livros', '📺 Séries', '🎯 Atividades', '🏆 Desafios', '💖 Autocuidado', '📖 Leitura', '🏃 Físicas'].map((cat, i) => (
                <span key={i} className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  {cat}
                </span>
              ))}
            </div>
            <Link to={createPageUrl('Goals')}>
              <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
                <Star className="w-5 h-5 mr-2" />
                Criar Minha Primeira Meta
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>Feito com ❤️ por Mayron</p>
        <p className="mt-1">🎄 Boas Festas! 🎄</p>
      </footer>
    </div>
  );
}