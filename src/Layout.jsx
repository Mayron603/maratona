import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { 
  Home, Trophy, Settings, Menu, X, 
  Users, Calendar as CalendarIcon 
} from 'lucide-react';
// Ícone mantido
import iconeImg from '@/assets/icone.png';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = currentPageName === 'Home';

  // Navegação
  const navItems = [
    { name: 'Home', icon: Home, label: 'Início' },
        { name: 'Lista', icon: CalendarIcon, label: 'Lista de Convocados' },  
    { name: 'Sprint', icon: Trophy, label: 'Sprint' }, // Nome mais genérico 
    { name: 'Admin', icon: Users, label: 'Registro' }, 
    { name: 'Settings', icon: Settings, label: 'Configurações' },
  ];

  const displayNavItems = navItems;
  const isActive = (name) => currentPageName === name;

  const getPath = (name) => {
    if (name === 'Home') return '/';
    return `/${name.toLowerCase()}`;
  };

  return (
    // Fundo: Se for Home, Preto. Se for interno, um cinza claro elegante.
    <div className={`min-h-screen ${isHome ? 'bg-black' : 'bg-gray-50'}`}>
      
      {/* NAVBAR */}
      <nav 
        className={`top-0 z-[60] transition-all duration-300 w-full
        ${isHome 
          ? 'fixed bg-white/5 backdrop-blur-sm border-b border-white/10' 
          : 'sticky bg-white border-b border-gray-200 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group mr-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md p-1 group-hover:scale-110 transition-transform border border-gray-100">
                <img src={iconeImg} alt="Ícone" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:block">
                {/* Texto Neutro */}
                <span className={`font-bold text-lg ${isHome ? 'text-white' : 'text-gray-800'}`}>
                  Hogwarts Maratona
                </span>
              </div>
            </Link>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {displayNavItems.map((item) => (
                <Link key={item.name} to={getPath(item.name)}>
                  <Button
                    variant={isActive(item.name) ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 ${
                      isActive(item.name) 
                        // Ativo: Amarelo/Dourado escuro (estilo Hogwarts) ou Preto
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : isHome 
                          ? 'text-white/80 hover:text-white hover:bg-white/10' 
                          : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Botão Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden ml-auto ${isHome ? 'text-white hover:bg-white/10' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-3 space-y-1">
              {displayNavItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={getPath(item.name)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.name) ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      isActive(item.name) 
                        ? 'bg-yellow-600 text-white' 
                        : 'text-gray-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}