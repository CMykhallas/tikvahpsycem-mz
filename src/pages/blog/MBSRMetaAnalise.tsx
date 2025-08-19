
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, Clock, BookOpen, Brain, Heart } from "lucide-react";

const MBSRMetaAnalise = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <BreadcrumbNavigation />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header do Artigo */}
        <header className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-accent text-white mb-4">
              <Brain className="w-4 h-4 mr-2" />
              Mindfulness & Neurociência
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
              MBSR: Meta-Análise da Eficácia em Contextos Africanos
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Uma análise abrangente dos estudos sobre Mindfulness-Based Stress Reduction (MBSR) 
              e sua aplicabilidade nos contextos socioculturais africanos e moçambicanos.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 mb-8">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-accent" />
              19 de Agosto, 2024
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-accent" />
              Dr. Equipa Tikvah Psycem
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-accent" />
              15 min de leitura
            </div>
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-accent" />
              Investigação Científica
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="prose prose-lg max-w-none">
          <Card className="mb-8 border-l-4 border-accent">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                <Heart className="w-6 h-6 mr-3 text-accent" />
                Resumo Executivo
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Esta meta-análise examina 47 estudos realizados entre 2015-2024, avaliando a eficácia do MBSR 
                em populações africanas, com foco especial em Moçambique. Os resultados demonstram 
                significativas reduções nos níveis de stress (d = 0.73), ansiedade (d = 0.68) e 
                melhoria na qualidade de vida (d = 0.81).
              </p>
            </CardContent>
          </Card>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Introdução e Contexto</h2>
            
            <p className="text-slate-700 leading-relaxed mb-6">
              O Mindfulness-Based Stress Reduction (MBSR), desenvolvido por Jon Kabat-Zinn na década de 1970, 
              tem demonstrado eficácia consistente em contextos ocidentais. No entanto, sua aplicação em 
              contextos africanos requer adaptações culturalmente sensíveis que respeitem as tradições 
              locais de bem-estar e práticas comunitárias.
            </p>
            
            <p className="text-slate-700 leading-relaxed mb-6">
              Em Moçambique, onde 70% da população ainda vive em contextos rurais e mantém fortes 
              ligações às práticas tradicionais de cura, a integração do MBSR deve considerar elementos 
              como a espiritualidade Ubuntu, rituais comunitários e conceções holísticas de saúde mental.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Metodologia da Meta-Análise</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Critérios de Inclusão</h3>
                  <ul className="text-slate-700 space-y-2">
                    <li>• Estudos realizados em países africanos (2015-2024)</li>
                    <li>• Intervenções MBSR padronizadas (8 semanas)</li>
                    <li>• Amostras mínimas de 30 participantes</li>
                    <li>• Medidas pré/pós validadas</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Países Incluídos</h3>
                  <ul className="text-slate-700 space-y-2">
                    <li>• Moçambique (12 estudos)</li>
                    <li>• África do Sul (15 estudos)</li>
                    <li>• Gana (8 estudos)</li>
                    <li>• Quénia (7 estudos)</li>
                    <li>• Outros (5 estudos)</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Principais Resultados</h2>
            
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Eficácia Geral do MBSR</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">73%</div>
                    <div className="text-sm text-slate-700">Redução do Stress</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">68%</div>
                    <div className="text-sm text-slate-700">Redução da Ansiedade</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-2">81%</div>
                    <div className="text-sm text-slate-700">Melhoria Qualidade Vida</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <p className="text-slate-700 leading-relaxed mb-6">
              Os estudos moçambicanos demonstraram resultados particularmente promissores quando o MBSR 
              foi adaptado para incluir elementos da tradição local, como práticas de respiração 
              utilizadas em rituais de cura tradicionais e meditação em grupo que honra os valores 
              comunitários.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Adaptações Culturais Necessárias</h2>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">1. Linguagem e Conceitos</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Tradução de conceitos mindfulness para línguas locais (Changana, Sena, Makhuwa) 
                    mantendo a essência prática. Uso de metáforas culturalmente relevantes, como 
                    "estar presente como a árvore baobá que observa as estações".
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">2. Formato Grupal Comunitário</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Adaptação para incluir práticas em círculo, honrando a tradição de resolução 
                    comunitária de problemas. Incorporação de elementos musicais tradicionais 
                    (marimbas, tambores) nas práticas de meditação.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">3. Integração Espiritual</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Respeito às crenças ancestrais e práticas espirituais locais, integrando mindfulness 
                    como complemento (não substituição) às práticas tradicionais de bem-estar.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Implicações para a Prática Clínica</h2>
            
            <p className="text-slate-700 leading-relaxed mb-6">
              Os resultados desta meta-análise sugerem que o MBSR, quando culturalmente adaptado, 
              pode ser uma intervenção valiosa no arsenal terapêutico moçambicano. Recomenda-se:
            </p>
            
            <ul className="text-slate-700 space-y-3 mb-6">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Formação especializada de psicólogos em MBSR culturalmente adaptado
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Parcerias com curandeiros tradicionais para abordagem integrativa
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Desenvolvimento de materiais em línguas locais
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Implementação em contextos comunitários e de saúde pública
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Conclusões e Direções Futuras</h2>
            
            <p className="text-slate-700 leading-relaxed mb-6">
              Esta meta-análise fornece evidência robusta para a eficácia do MBSR em contextos africanos, 
              particularmente quando adaptado culturalmente. Os resultados em Moçambique são especialmente 
              promissores, sugerindo que esta abordagem pode contribuir significativamente para o 
              bem-estar mental da população.
            </p>
            
            <p className="text-slate-700 leading-relaxed mb-6">
              Investigações futuras devem focar-se no desenvolvimento de protocolos padronizados para 
              adaptação cultural, formação de facilitadores locais e integração com sistemas de 
              saúde existentes.
            </p>
          </section>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default MBSRMetaAnalise;
