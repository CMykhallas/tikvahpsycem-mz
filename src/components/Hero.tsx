
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-blue-50 to-slate-100"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-slate-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8 animate-fade-in">
          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-800 leading-tight">
              Empoderar para
              <span className="block bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Transformar
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Integrando psicologia, filosofia e valores cristãos para o desenvolvimento humano integral em Moçambique
            </p>
          </div>

          {/* Mission statement */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-white/20 shadow-lg">
            <p className="text-lg text-slate-700 italic">
              "Nossa missão é empoderar indivíduos, famílias e organizações para o autoconhecimento, 
              crescimento pessoal e transformação sustentável através de uma abordagem integrada e humanizada."
            </p>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/appointment">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Agendar Consulta
              </Button>
            </Link>
            <Link to="/services">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300"
              >
                Conheça Nossos Serviços
              </Button>
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-teal-600">2019</div>
              <div className="text-slate-600">Fundada em</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-blue-600">50+</div>
              <div className="text-slate-600">Serviços Especializados</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-slate-600">100%</div>
              <div className="text-slate-600">Comprometidos</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <ArrowDown className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </div>
    </section>
  );
};
