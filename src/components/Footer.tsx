
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, MessageCircle, Phone, Mail, MapPin, Linkedin, ChevronUp, Clock, Globe, Shield, Award } from "lucide-react";
import { Button } from "./ui/button";

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-primary text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:24px_24px]"></div>
      </div>
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
            
            {/* Company Branding & Mission - Compact */}
            <div className="col-span-1 lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center shadow-accent">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gradient-elegant">Tikvah</span>
                  <span className="text-xs text-white/80 font-medium">Psychological Center & Multiservice</span>
                </div>
              </div>
              
              <p className="text-white/90 leading-relaxed text-sm max-w-md">
                Saúde Mental e Bem-Estar Integral: Ecossistema Estratégico de Soluções para o Florescimento do Capital Humano e Excelência Sistémica.
              </p>

              {/* Key Features - Compact */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2 text-xs">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span className="text-white/80">Abordagem Científica</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <Award className="w-3.5 h-3.5 text-accent" />
                  <span className="text-white/80">Excelência Profissional</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <Globe className="w-3.5 h-3.5 text-accent" />
                  <span className="text-white/80">Impacto Social</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span className="text-white/80">Disponibilidade 24/7</span>
                </div>
              </div>

              {/* Social Media - Ultra Compact Icons Only */}
              <div className="flex items-center gap-2">
                <a 
                  href="https://www.facebook.com/consultoriotikvah" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-105"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4 text-accent hover:text-white transition-colors" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/tikvah-psycem/?viewAsMember=true" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-105"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-accent hover:text-white transition-colors" />
                </a>
                <a 
                  href="https://instagram.com/opm_moz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-105"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4 text-accent hover:text-white transition-colors" />
                </a>
                <a 
                  href="https://twitter.com/opm_moz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-105"
                  title="Twitter"
                >
                  <Twitter className="w-4 h-4 text-accent hover:text-white transition-colors" />
                </a>
                <a 
                  href="https://wa.me/258827592980" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 bg-gradient-accent hover:shadow-accent rounded-lg transition-all duration-300 hover:scale-105"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>

            {/* Navigation Links - Compact */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center">
                <span className="w-1 h-5 bg-accent rounded-full mr-2"></span>
                Navegação
              </h3>
              <div className="space-y-2">
                <Link to="/about" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-xs">
                  Sobre a Tikvah
                </Link>
                <Link to="/team" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-xs">
                  Nossa Equipe
                </Link>
                <Link to="/values" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-xs">
                  Valores
                </Link>
                <Link to="/mission" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-xs">
                  Missão e Visão
                </Link>
                <Link to="/career" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-xs">
                  Carreira
                </Link>
                <Link to="/testimonials" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-xs">
                  Testemunhos
                </Link>
                <Link to="/blog" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-xs">
                  Blog & Recursos
                </Link>
              </div>
            </div>

            {/* Services - Compact */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center">
                <span className="w-1 h-5 bg-accent rounded-full mr-2"></span>
                Serviços
              </h3>
              <div className="space-y-2">
                <Link to="/services/psicoterapia" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-xs">
                  Psicoterapia Individual
                </Link>
                <Link to="/services/consultoria" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-xs">
                  Consultoria Organizacional
                </Link>
                <Link to="/services/cursos" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-xs">
                  Cursos & Formação
                </Link>
                <Link to="/services/workshops" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-xs">
                  Workshops Especializados
                </Link>
                <Link to="/appointment" className="block text-accent hover:text-accent-light hover:translate-x-1 transition-all duration-200 text-xs font-medium">
                  Agendamento Online
                </Link>
                <Link to="/location" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-xs">
                  Localização
                </Link>
              </div>
            </div>

            {/* Contact Information - Ultra Compact */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white flex items-center">
                <span className="w-1 h-5 bg-accent rounded-full mr-2"></span>
                Contacto
              </h3>
              
              {/* Phone Numbers - Compact */}
              <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                <div className="flex items-start space-x-2">
                  <Phone className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div className="space-y-0.5 text-xs text-white/80">
                    <a href="tel:+258827592980" className="block hover:text-accent transition-colors">
                      +258 82 759 2980 <span className="text-[10px] opacity-70">(Técnico)</span>
                    </a>
                    <a href="tel:+258828926020" className="block hover:text-accent transition-colors">
                      +258 82 892 6020 <span className="text-[10px] opacity-70">(Operacional)</span>
                    </a>
                    <a href="tel:+258827785043" className="block hover:text-accent transition-colors">
                      +258 82 778 5043 <span className="text-[10px] opacity-70">(Apoio)</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Email - Compact */}
              <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                <div className="flex items-start space-x-2">
                  <Mail className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div className="space-y-0.5 text-xs text-white/80">
                    <a href="mailto:suporte.oficina.psicologo@proton.me" className="block hover:text-accent transition-colors truncate" title="suporte.oficina.psicologo@proton.me">
                      suporte.oficina.psicologo@proton.me
                    </a>
                    <a href="mailto:geral.consultoriotekvah@gmail.com" className="block hover:text-accent transition-colors truncate" title="geral.consultoriotekvah@gmail.com">
                      geral.consultoriotekvah@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Location - Consolidated */}
              <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-white/80">
                    <p className="font-medium text-accent text-[10px] uppercase tracking-wide mb-1">Sede Central</p>
                    <p className="leading-relaxed">Av. 24 de Julho N. 797, 1º andar<br />Polana Cimento "A", Maputo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Compact */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-3">
                <Button 
                  asChild 
                  size="sm"
                  variant="secondary" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary backdrop-blur-sm text-xs"
                >
                  <Link to="/appointment">Agendar Consulta</Link>
                </Button>
                <Button 
                  asChild 
                  size="sm"
                  className="bg-gradient-accent hover:shadow-accent hover:scale-105 transition-all duration-300 text-xs"
                >
                  <Link to="/contact">Contactar Agora</Link>
                </Button>
              </div>
              
              <Button
                onClick={scrollToTop}
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 text-xs"
              >
                <ChevronUp className="w-3.5 h-3.5 mr-1" />
                Topo
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Footer - Compact */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
              <div className="text-center lg:text-left">
                <p className="text-white/80 text-xs">
                  © 2024 <span className="font-semibold text-white">Tikvah Psychological Center & Multiservice</span> · Todos os direitos reservados
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-white/60">
                <Link to="/politica-de-privacidade" className="hover:text-white transition-colors">
                  Privacidade
                </Link>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Termos
                </Link>
                <Link to="/cookies" className="hover:text-white transition-colors">
                  Cookies
                </Link>
                <span className="font-medium text-accent">
                  ISO 27001
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
