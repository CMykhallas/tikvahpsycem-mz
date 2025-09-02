import { motion } from "framer-motion";
import { PromoVideo } from "./PromoVideo";
import { Button } from "./ui/button";
import { Play, Calendar, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const VideoHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/10 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          
          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm"
            >
              🎬 Apresentação Institucional
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
              >
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Tikvah
                </span>
                <br />
                <span className="text-foreground">
                  Psycem
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-xl md:text-2xl text-muted-foreground font-light max-w-lg"
              >
                Cruzando Saberes, Curando Feridas, Construindo Futuros
              </motion.p>
            </div>

            {/* Key Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="space-y-3"
            >
              {[
                "Inovação com Identidade",
                "Ciência com Propósito", 
                "Humanidade com Técnica"
              ].map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground font-medium">{point}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link to="/appointment">
                <Button size="lg" className="w-full sm:w-auto group">
                  <Calendar className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Agendar Consulta
                </Button>
              </Link>
              
              <Link to="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto group">
                  <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Falar com Especialista
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50"
            >
              {[
                { value: "8+", label: "Áreas de Especialização" },
                { value: "2019", label: "Ano de Constituição" },
                { value: "100%", label: "Compromisso com Excelência" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Video Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <PromoVideo 
                autoPlay={false}
                showControls={true}
                className="w-full h-full"
              />
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-xl" />
            </div>

            {/* Video Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="mt-6 p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl"
            >
              <div className="flex items-center space-x-3 mb-2">
                <Play className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">
                  Protocolo Tikvah Psycem
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Conheça nossa metodologia híbrida proprietária que integra psicologia, 
                filosofia, sociologia e valores cristãos para transformar vidas e organizações.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-primary/70 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};