
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Services = () => {
  const serviceCategories = [
    {
      title: "Psicoterapia Individual",
      description: "Atendimento personalizado para desenvolvimento pessoal e superação de desafios emocionais.",
      services: [
        "Terapia Individual",
        "Terapia de Casal",
        "Terapia Familiar Sistêmica",
        "Avaliação Psicológica Integrada"
      ],
      color: "from-teal-500 to-green-500"
    },
    {
      title: "Saúde Mental Especializada",
      description: "Serviços especializados em reabilitação e tratamento integrativo.",
      services: [
        "Reabilitação Neuropsicológica",
        "Psiquiatria Integrativa",
        "Nutrição Psicocomportamental",
        "Intervenções Corpo-Mente"
      ],
      color: "from-blue-500 to-teal-500"
    },
    {
      title: "Desenvolvimento Profissional",
      description: "Coaching e orientação para crescimento na carreira e liderança.",
      services: [
        "Coaching Psicológico",
        "Orientação Vocacional",
        "Coaching Executivo",
        "Treinamento em Inteligência Emocional"
      ],
      color: "from-purple-500 to-blue-500"
    },
    {
      title: "Consultoria Organizacional",
      description: "Soluções integradas para organizações e desenvolvimento corporativo.",
      services: [
        "Consultoria em Saúde Mental Organizacional",
        "Treinamento Corporativo",
        "Assessment Psicológico",
        "Intervenção em Crises"
      ],
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Programas Especializados",
      description: "Programas estruturados para grupos e necessidades específicas.",
      services: [
        "Programa de Mindfulness",
        "Grupos Terapêuticos Temáticos",
        "Programa de Envelhecimento Ativo",
        "Prevenção e Manejo do Burnout"
      ],
      color: "from-green-500 to-teal-500"
    },
    {
      title: "Formação e Educação",
      description: "Cursos, workshops e programas de capacitação profissional.",
      services: [
        "Cursos de Alta Performance",
        "Workshops Especializados",
        "Programas de Imersão Prática",
        "Certificação em Mediação de Conflitos"
      ],
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Nossos <span className="text-teal-600">Serviços</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Um ecossistema estratégico integrado de serviços para o desenvolvimento humano integral
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {serviceCategories.map((category, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <CardHeader className={`bg-gradient-to-r ${category.color} text-white p-6`}>
                <CardTitle className="text-xl font-bold">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {category.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {category.services.map((service, serviceIndex) => (
                    <li key={serviceIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-slate-700 text-sm">{service}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/services" className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-teal-50 group-hover:border-teal-300 transition-all duration-300"
                  >
                    Saiba Mais
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-2">
                  Nossa equipe multidisciplinar inclui Psicólogos Clínicos, Organizacionais, Educacionais, Psicanalistas, Terapeutas e Consultores especializados em diversas áreas como Agropecuária, TI e Gestão Financeira.{" "}
                  <a 
                    href="/services" 
                    className="text-primary hover:underline"
                  >
                    Saiba mais
                  </a>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-3xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-slate-800 mb-4">
            Pronto para Transformar sua Vida?
          </h3>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e descubra como podemos ajudá-lo em sua jornada de desenvolvimento pessoal e profissional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/appointment">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Agendar Consulta
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-full text-lg font-semibold"
              >
                Falar com Especialista
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
