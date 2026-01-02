import React, { useState } from 'react';
import hogwartsVideo from '@/assets/video.mp4'; 
import { X } from 'lucide-react';

// Importe suas imagens aqui (certifique-se de que estão na pasta assets)
import img1 from '@/assets/1.png'; // Vermelho
import img2 from '@/assets/3.png'; // Amarelo
import img3 from '@/assets/2.png'; // Azul
import img4 from '@/assets/4.png'; // Verde

export default function Home() {
  // Estado para controlar qual imagem está aberta (null = nenhuma)
  const [openImage, setOpenImage] = useState(null);

  // Função para fechar o modal
  const handleClose = () => setOpenImage(null);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-serif overflow-hidden">
      
      {/* Vídeo de Fundo */}
      <video 
        src={hogwartsVideo} 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center scale-[1.15]" 
      />

      {/* --- ÁREAS CLICÁVEIS (Agora abrem imagens) --- */}
      
      {/* 1. Vermelho -> 1.png */}
      <div 
        onClick={() => setOpenImage(img1)}
        className="absolute top-[10%] bottom-[10%] left-[12%] w-[16%] z-20 group cursor-pointer"
      >
          <div className="w-full h-full bg-red-500/0 group-hover:bg-red-500/10 transition-all duration-500 rounded-b-xl"></div>
      </div>

      {/* 2. Amarelo -> 2.png */}
      <div 
        onClick={() => setOpenImage(img2)}
        className="absolute top-[10%] bottom-[10%] left-[31%] w-[16%] z-20 group cursor-pointer"
      >
          <div className="w-full h-full bg-yellow-500/0 group-hover:bg-yellow-500/10 transition-all duration-500 rounded-b-xl"></div>
      </div>

      {/* 3. Azul -> 3.png */}
      <div 
        onClick={() => setOpenImage(img3)}
        className="absolute top-[10%] bottom-[10%] left-[50%] w-[16%] z-20 group cursor-pointer"
      >
          <div className="w-full h-full bg-blue-500/0 group-hover:bg-blue-500/10 transition-all duration-500 rounded-b-xl"></div>
      </div>

      {/* 4. Verde -> 4.png */}
      <div 
        onClick={() => setOpenImage(img4)}
        className="absolute top-[10%] bottom-[10%] left-[69%] w-[16%] z-20 group cursor-pointer"
      >
          <div className="w-full h-full bg-green-500/0 group-hover:bg-green-500/10 transition-all duration-500 rounded-b-xl"></div>
      </div>

      {/* --- MODAL DE VISUALIZAÇÃO DA IMAGEM --- */}
      {openImage && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          
          {/* Container da Imagem */}
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            
            {/* Botão Fechar */}
            <button 
              onClick={handleClose}
              className="absolute -top-12 right-0 md:-right-12 text-white hover:text-red-400 transition-colors"
            >
              <X className="w-10 h-10" />
            </button>

            {/* A Imagem */}
            <img 
              src={openImage} 
              alt="Detalhe" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10"
            />
          </div>

          {/* Clicar fora também fecha */}
          <div className="absolute inset-0 -z-10" onClick={handleClose}></div>
        </div>
      )}

    </div>
  );
}