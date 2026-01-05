import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Brain, 
  Building, 
  GraduationCap, 
  Users, 
  Stethoscope,
  Heart,
  DollarSign,
  Scale,
  Code,
  Shield,
  TreePine,
  Globe,
  Target,
  Briefcase,
  TrendingUp,
  Lightbulb,
  HeadphonesIcon,
  BookOpen,
  Award,
  Wrench,
  MessageCircle
} from "lucide-react";
import consultoriaNegocios from "@/assets/consultoria-negocios.jpg";
import formacaoDesenvolvimento from "@/assets/formacao-desenvolvimento.jpg";

const Services = () => {
  const mainServices = [
    {
      icon: Brain,
      title: "Psicoterapia",
      description: "Atendimento psicológico especializado para indivíduos, casais e famílias",
      link: "/services/psicoterapia",
      services: [
        "Psicoterapia Individual",
        "Terapia de Casal", 
        "Terapia Familiar Sistêmica",
        "Avaliação Psicológica"
      ]
    },
    {
      icon: Building,
      title: "Consultoria",
      description: "Soluções especializadas para desenvolvimento organizacional",
      link: "/services/consultoria", 
      services: [
        "Consultoria Organizacional",
        "Gestão de Recursos Humanos",
        "Coaching Executivo",
        "Assessment Psicológico"
      ]
    },
    {
      icon: GraduationCap,
      title: "Cursos",
      description: "Programas de formação e desenvolvimento profissional",
      link: "/services/cursos",
      services: [
        "Inteligência Emocional",
        "Liderança e Gestão", 
        "Comunicação Eficaz",
        "Desenvolvimento Pessoal"
      ]
    },
    {
      icon: Users,
      title: "Workshops",
      description: "Experiências práticas de aprendizado e desenvolvimento",
      link: "/services/workshops",
      services: [
        "Mindfulness e Bem-estar",
        "Gestão de Stress",
        "Trabalho em Equipe",
        "Resolução de Conflitos"
      ]
    }
  ];

  const comprehensiveServices = [
    {
      category: "Saúde e Bem-estar",
      icon: Stethoscope,
      services: [
        "Psicologia",
        "Terapia da Fala", 
        "Terapia Ocupacional",
        "Apoio em Crises",
        "Terapias",
        "Primeiros Socorros Psicológicos (PSP)"
      ]
    },
    {
      category: "Consultoria e Negócios",
      icon: Briefcase,
      services: [
        "Consultoria Científica",
        "Consultoria Técnica", 
        "Consultoria de Negócios",
        "Coaching",
        "Mentoria"
      ]
    },
    {
      category: "Financeiro e Jurídico",
      icon: DollarSign,
      services: [
        "Contabilidade",
        "Auditoria",
        "Fiscalidade",
        "Jurisprudência"
      ]
    },
    {
      category: "Tecnologia e Suporte",
      icon: Code,
      services: [
        "TI (Tecnologia da Informação)",
        "Assessoria",
        "Help-Desk"
      ]
    },
    {
      category: "Educação e Desenvolvimento",
      icon: BookOpen,
      services: [
        "Cursos e Treinamentos",
        "Estágios",
        "Reciclagem",
        "Pesquisa e Desenvolvimento (P&D)"
      ]
    },
    {
      category: "Sustentabilidade e Comunidade",
      icon: TreePine,
      services: [
        "Sustentabilidade e Responsabilidade Social",
        "Outreach e Suporte Comunitário",
        "Parcerias e Colaborações"
      ]
    },
    {
      category: "Comunicação e Mídia",
      icon: MessageCircle,
      services: [
        "Publicações e Mídia",
        "Marketing e Publicidade",
        "Gestão de Redes Sociais"
      ]
    },
    {
      category: "Gestão e Administração",
      icon: Target,
      services: [
        "Administração e Operações",
        "Gestão de Projetos",
        "Monitoria e Avaliação de Projetos"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Image */}
      <section className="services-hero relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${consultoriaNegocios})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Serviços <span className="text-gradient-accent">Tikvah</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              O Seu Ecossistema de Apoio e Crescimento
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto mt-4">
              A Tikvah oferece um leque abrangente de serviços, desenhados para promover o bem-estar, a eficiência e o desenvolvimento em diversas esferas, seja para indivíduos, empresas ou comunidades.
            </p>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Serviços <span className="text-gradient-primary">Principais</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Nossos serviços principais que formam a base do nosso atendimento especializado
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {mainServices.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="hover-elegant group">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-foreground mb-4">{category.title}</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{category.description}</p>
                    
                    <ul className="space-y-2 mb-6">
                      {category.services.map((service, serviceIndex) => (
                        <li key={serviceIndex} className="flex items-center text-foreground">
                          <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                          {service}
                        </li>
                      ))}
                    </ul>
                    
                    <Link to={category.link}>
                      <Button variant="gradient" className="w-full">
                        Saiba Mais
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Training Image Banner */}
          <div className="relative mb-12 rounded-2xl overflow-hidden shadow-xl">
            <img 
              src={formacaoDesenvolvimento} 
              alt="Sessão de formação profissional em Maputo"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-bold mb-2">Formação de Excelência</h3>
              <p className="text-white/90">Desenvolvimento profissional contínuo para sua equipe</p>
            </div>
          </div>

          {/* Comprehensive Services */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-foreground mb-12 text-center">
              Ecossistema <span className="text-gradient-primary">Completo</span> de Serviços
            </h3>
            <p className="text-muted-foreground text-center mb-12 max-w-4xl mx-auto">
              Nossa oferta abrangente de serviços especializados para atender todas as suas necessidades de desenvolvimento pessoal, profissional e organizacional.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {comprehensiveServices.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Card key={index} className="hover-elegant">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <IconComponent className="w-6 h-6 text-primary mr-3" />
                        <h4 className="text-lg font-semibold text-foreground">{category.category}</h4>
                      </div>
                      <ul className="space-y-2">
                        {category.services.map((service, idx) => (
                          <li key={idx} className="flex items-start">
                            <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 mr-2 flex-shrink-0"></div>
                            <span className="text-muted-foreground text-sm">{service}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Service Quality Commitment */}
          <div className="bg-card rounded-3xl p-12 border border-border">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Compromisso com a <span className="text-gradient-primary">Excelência</span>
              </h3>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Todos os nossos serviços são desenvolvidos com base em evidências científicas, melhores práticas internacionais e adaptados à realidade moçambicana.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-3">Qualidade Certificada</h4>
                <p className="text-sm text-muted-foreground">
                  Serviços baseados em padrões internacionais de qualidade
                </p>
              </div>
              
              <div className="text-center">
                <Target className="w-12 h-12 text-accent mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-3">Abordagem Personalizada</h4>
                <p className="text-sm text-muted-foreground">
                  Soluções adaptadas às necessidades específicas de cada cliente
                </p>
              </div>
              
              <div className="text-center">
                <Lightbulb className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-3">Inovação Contínua</h4>
                <p className="text-sm text-muted-foreground">
                  Constantemente atualizados com as últimas metodologias
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/contact">
                <Button variant="gradient" size="lg">
                  Solicitar Orçamento
                </Button>
              </Link>
              <Link to="/appointment">
                <Button variant="outline" size="lg">
                  Agendar Consulta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;