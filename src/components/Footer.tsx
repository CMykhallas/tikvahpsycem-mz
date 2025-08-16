
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, MessageCircle, Phone, Mail, MapPin, Linkedin, ChevronUp, Clock, Globe, Shield, Award } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

export const Footer = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-12">
            
            {/* Company Branding & Mission - Enhanced */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-gradient-accent rounded-xl flex items-center justify-center shadow-accent">
                  <span className="text-white font-bold text-2xl">T</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gradient-elegant">Tikvah</span>
                  <span className="text-sm text-white/80 font-medium">Psychological Center & Multiservice</span>
                </div>
              </div>
              
              <p className="text-white/90 leading-relaxed max-w-md">
                Saúde Mental e Bem-Estar Integral: Nosso Ecossistema Estratégico de Soluções, capacitando o Florescimento do Capital Humano e Impulsionando a Excelência Sistémica.
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-white/80">Abordagem Científica</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="text-white/80">Excelência Profissional</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Globe className="w-4 h-4 text-accent" />
                  <span className="text-white/80">Impacto Social</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-white/80">Disponibilidade 24/7</span>
                </div>
              </div>

              {/* Enhanced Social Media Links */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Conecte-se Conosco</h4>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="https://www.facebook.com/consultoriotikvah" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    title="Tikvah Psychological Center Facebook"
                  >
                    <Facebook className="w-4 h-4 text-accent group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium text-white/90 group-hover:text-white">Facebook</span>
                  </a>
                  
                  <a 
                    href="https://linkedin.com/company/tikvah-psychological-center-multiservice" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    title="Tikvah Psycem LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 text-accent group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium text-white/90 group-hover:text-white">LinkedIn</span>
                  </a>
                  
                  <a 
                    href="https://instagram.com/opm_moz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    <Instagram className="w-4 h-4 text-accent group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium text-white/90 group-hover:text-white">Instagram</span>
                  </a>
                  
                  <a 
                    href="https://twitter.com/opm_moz" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    <Twitter className="w-4 h-4 text-accent group-hover:text-white transition-colors" />
                    <span className="text-sm font-medium text-white/90 group-hover:text-white">Twitter</span>
                  </a>
                  
                  <a 
                    href="https://wa.me/258827592980" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 bg-gradient-accent hover:shadow-accent px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Links - Enhanced */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-1 h-6 bg-accent rounded-full mr-3"></span>
                Navegação
              </h3>
              <div className="space-y-3">
                <Link to="/about" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                  Sobre a Tikvah
                </Link>
                <Link to="/team" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                  Nossa Equipe
                </Link>
                <Link to="/values" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                  Valores
                </Link>
                <Link to="/mission" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                  Missão e Visão
                </Link>
                <Link to="/career" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                  Carreira
                </Link>
                <Link to="/testimonials" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                  Testemunhos
                </Link>
                <Link to="/blog" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                  Blog & Recursos
                </Link>
              </div>
            </div>

            {/* Services - Enhanced */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-1 h-6 bg-accent rounded-full mr-3"></span>
                Serviços Especializados
              </h3>
              <div className="space-y-3">
                <Link to="/services/psicoterapia" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                  Psicoterapia Individual
                </Link>
                <Link to="/services/consultoria" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                  Consultoria Organizacional
                </Link>
                <Link to="/services/cursos" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                  Cursos & Formação
                </Link>
                <Link to="/services/workshops" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                  Workshops Especializados
                </Link>
                <Link to="/appointment" className="block text-accent hover:text-accent-light hover:translate-x-1 transition-all duration-200 text-sm font-medium">
                  Agendamento Online
                </Link>
                <Link to="/location" className="block text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                  Localização
                </Link>
              </div>
            </div>

            {/* Contact Information - Ultra Professional */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-1 h-6 bg-accent rounded-full mr-3"></span>
                Contacto Institucional
              </h3>
              
              {/* Phone Numbers */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white/90">Linhas Diretas</p>
                      <div className="space-y-1 text-sm text-white/80">
                        <a href="tel:+258827592980" className="block hover:text-accent transition-colors">
                          +258 82 759 2980 <span className="text-xs">(Técnico)</span>
                        </a>
                        <a href="tel:+258828926020" className="block hover:text-accent transition-colors">
                          +258 82 892 6020 <span className="text-xs">(Operacional)</span>
                        </a>
                        <a href="tel:+2587785043" className="block hover:text-accent transition-colors">
                          +258 778 5043 <span className="text-xs">(Apoio)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Addresses */}
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white/90">Correio Corporativo</p>
                      <div className="space-y-1 text-sm text-white/80">
                        <a href="mailto:suporte.oficina.psicologo@proton.me" className="block hover:text-accent transition-colors break-all">
                          suporte.oficina.psicologo@proton.me
                        </a>
                        <a href="mailto:geral.consultoriotekvah@gmail.com" className="block hover:text-accent transition-colors break-all">
                          geral.consultoriotekvah@gmail.com
                        </a>
                        <a href="mailto:ceo.consultoriotekvah@gmail.com" className="block hover:text-accent transition-colors break-all">
                          ceo.consultoriotekvah@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Locations */}
                <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-white/90">Escritórios</p>
                      <div className="space-y-3 text-sm text-white/80">
                        <div>
                          <p className="font-medium text-accent text-xs uppercase tracking-wide">Central</p>
                          <p className="mt-1">Av. 24 de Julho, 767<br />B/ Polana Cimento, Maputo</p>
                        </div>
                        <div>
                          <p className="font-medium text-accent text-xs uppercase tracking-wide">Técnico</p>
                          <p className="mt-1">Av. Vlademir Lenine<br />B/ Maxaquene "C", Maputo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-wrap gap-4">
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white hover:text-primary"
                >
                  <Link to="/appointment">Agendar Consulta</Link>
                </Button>
                <Button 
                  asChild 
                  className="bg-gradient-accent hover:shadow-accent hover:scale-105 transition-all duration-300"
                >
                  <Link to="/contact">Contactar Agora</Link>
                </Button>
              </div>
              
              {/* Back to top button */}
              <Button
                onClick={scrollToTop}
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <ChevronUp className="w-4 h-4 mr-2" />
                Voltar ao Topo
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-white/80 text-sm">
                © 2024 <span className="font-semibold text-white">Tikvah Psychological Center & Multiservice</span>
              </p>
              <p className="text-white/60 text-xs mt-1">
                Todos os direitos reservados. Licenciado em Moçambique.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-xs text-white/60">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Termos de Serviço
              </Link>
              <Link to="/cookies" className="hover:text-white transition-colors">
                Política de Cookies
              </Link>
              <span className="hidden sm:inline">•</span>
              <span className="font-medium text-accent">
                ISO 27001 Certified
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
