import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { 
  Home, LayoutDashboard, Target, Trophy, Calendar, Settings, Menu, X, TreePine, Volume2, VolumeX,
  ShieldCheck // <--- 1. NOVO ÍCONE IMPORTADO
} from 'lucide-react';
import SnowEffect from '@/components/christmas/SnowEffect';
import ChristmasLights from '@/components/christmas/ChristmasLights';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const audioRef = useRef(null);

  const [snowEnabled, setSnowEnabled] = useState(true);
  const [lightsEnabled, setLightsEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const result = await base44.entities.Settings.list();
      return result[0] || {};
    },
  });

  // --- 2. BUSCAR USUÁRIO ATUAL PARA VERIFICAR PERMISSÃO ---
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    if (settings) {
      setSnowEnabled(settings.snow_enabled ?? true);
      setLightsEnabled(settings.lights_enabled ?? true);
      setMusicEnabled(settings.music_enabled ?? false);
      setMusicVolume(settings.music_volume ?? 0.5);
    }
  }, [settings]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  useEffect(() => {
    if (audioRef.current) {
      if (musicEnabled) {
        audioRef.current.volume = musicVolume;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [musicEnabled]);

  const navItems = [
    { name: 'Home', icon: Home, label: 'Início' },
    { name: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { name: 'Goals', icon: Target, label: 'Metas' },
    { name: 'Marathons', icon: Trophy, label: 'Maratonas' },
    { name: 'Calendar', icon: Calendar, label: 'Calendário' },
    { name: 'Ranking', icon: Trophy, label: 'Ranking' },
    { name: 'Settings', icon: Settings, label: 'Configurações' },
  ];

  // --- 3. LÓGICA PARA MOSTRAR BOTÃO ADMIN ---
  // Se for admin, insere o botão "Admin" antes do último item (Settings)
  const displayNavItems = currentUser?.role === 'admin' 
    ? [...navItems.slice(0, 6), { name: 'Admin', icon: ShieldCheck, label: 'Admin' }, ...navItems.slice(6)]
    : navItems;

  const isActive = (name) => currentPageName === name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
      <SnowEffect enabled={snowEnabled} />
      <ChristmasLights enabled={lightsEnabled} />
      
      <audio ref={audioRef} loop>
        <source src="/natal.mp3" type="audio/mp3" />
      </audio>

      {musicEnabled && (
        <button 
          onClick={() => {
            if (audioRef.current.paused) {
              audioRef.current.play();
              setIsPlaying(true);
            } else {
              audioRef.current.pause();
              setIsPlaying(false);
            }
          }}
          className="fixed bottom-4 left-4 z-50 bg-white/80 p-3 rounded-full shadow-lg border border-red-200 hover:scale-110 transition-transform animate-bounce"
          title={isPlaying ? "Pausar Música" : "Tocar Música"}
        >
          {isPlaying ? <Volume2 className="w-5 h-5 text-green-600" /> : <VolumeX className="w-5 h-5 text-red-500" />}
        </button>
      )}

      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-red-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-800">Missão</span>
                <span className="text-xs text-red-600 block -mt-1">de Natal 🎄</span>
              </div>
            </Link>

            {/* --- 4. AQUI USAMOS displayNavItems NO MENU DESKTOP --- */}
            <div className="hidden md:flex items-center gap-1">
              {displayNavItems.map((item) => (
                <Link key={item.name} to={createPageUrl(item.name)}>
                  <Button
                    variant={isActive(item.name) ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 ${
                      isActive(item.name) 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-red-100">
            {/* --- 4. AQUI USAMOS displayNavItems NO MENU MOBILE --- */}
            <div className="px-4 py-3 space-y-1">
              {displayNavItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={createPageUrl(item.name)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.name) ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      isActive(item.name) 
                        ? 'bg-red-600 text-white' 
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