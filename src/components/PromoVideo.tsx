import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface PromoVideoProps {
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

export const PromoVideo = ({ 
  autoPlay = false, 
  showControls = true, 
  className = "" 
}: PromoVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [currentScene, setCurrentScene] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Scenes data based on the storyboard
  const scenes = [
    {
      title: "Tikvah Psychological Center & Multiservice",
      subtitle: "Inovação, Ciência e Transformação",
      description: "Cidade de Maputo - Onde a transformação acontece"
    },
    {
      title: "Soluções Reais",
      subtitle: "Para Desafios Complexos",
      description: "Você precisa de soluções reais para os seus desafios pessoais, empresariais ou institucionais?"
    },
    {
      title: "Consultorias Especializadas",
      subtitle: "Expertise Multidisciplinar",
      description: "Empresarial & Negócios • Científica & Técnica • Administração, IT & Jurisprudência • Nutrição & Saúde Corporativa"
    },
    {
      title: "Psicologia & Terapias Integradas",
      subtitle: "Cuidado Humanizado",
      description: "Psicoterapia • Terapia da Fala • Terapia Ocupacional • Atendimento: Infantil, Adolescente, Adulto e Institucional"
    },
    {
      title: "Gestão & Formação",
      subtitle: "Desenvolvimento Estratégico",
      description: "Negócios e Projetos • Administração & RH • Monitoria & Avaliação • Contabilidade, Finanças, Auditoria & Fiscalidade"
    },
    {
      title: "Impacto Social",
      subtitle: "Transformação Sustentável",
      description: "Coaching • Estágios • Parcerias • Responsabilidade Social"
    },
    {
      title: "Tikvah Psycem",
      subtitle: "Cruzando Saberes, Curando Feridas, Construindo Futuros",
      description: "Inovação com Identidade • Ciência com Propósito • Humanidade com Técnica"
    }
  ];

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  // Auto-advance scenes for demo purposes (when no actual video)
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % scenes.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPlaying, scenes.length]);

  // Hide overlay after video starts
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => setShowOverlay(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowOverlay(true);
    }
  }, [isPlaying]);

  return (
    <div className={`relative w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-background overflow-hidden rounded-2xl ${className}`}>
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay={autoPlay}
        muted={isMuted}
        loop
        playsInline
        poster="/placeholder-video-poster.jpg"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        {/* Placeholder for actual video file */}
        <source src="/tikvah-promo-video.mp4" type="video/mp4" />
        {/* Fallback content */}
      </video>

      {/* Animated Scene Overlay (Demo) */}
      <AnimatePresence mode="wait">
        {!videoRef.current?.src && (
          <motion.div
            key={currentScene}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/80 via-accent/60 to-background/80"
          >
            <div className="text-center text-white max-w-4xl px-8">
              <motion.h1
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-accent-foreground bg-clip-text text-transparent"
              >
                {scenes[currentScene].title}
              </motion.h1>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl md:text-2xl font-semibold mb-6 text-accent-foreground"
              >
                {scenes[currentScene].subtitle}
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-base md:text-lg leading-relaxed max-w-3xl mx-auto text-muted-foreground"
              >
                {scenes[currentScene].description}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play Button Overlay */}
      <AnimatePresence>
        {showOverlay && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm cursor-pointer"
            onClick={handlePlayPause}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Controls */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/40 backdrop-blur-md rounded-lg p-3"
        >
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMuteToggle}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <span className="text-white text-sm">
              Protocolo Tikvah Psycem - Apresentação Institucional
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreen}
            className="text-white hover:bg-white/20"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Scene Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {scenes.map((_, index) => (
          <motion.div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentScene ? 'bg-white' : 'bg-white/40'
            }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>

      {/* Tikvah Logo Watermark */}
      <div className="absolute top-4 right-4 text-white/80 text-sm font-semibold bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
        Tikvah Psycem
      </div>
    </div>
  );
};