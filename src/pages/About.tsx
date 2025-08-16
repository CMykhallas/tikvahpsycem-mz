
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Sobre a <span className="text-teal-600">Tikvah</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Constituída em 2019 como sucessora da OPM, somos afiliados à Plp-Alleluia
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-slate-700">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Nossa História</h2>
            <p className="mb-4">
              A Tikvah Psychological Center & Multiservice foi constituída em 2019 como sucessora da 
              Organização de Psicologia de Moçambique (OPM), mantendo nossa afiliação com a Plp-Alleluia 
              e consolidando nossa presença em Maputo.
            </p>
            <p className="mb-4">
              Localizada na Av. Vlademir Lenine n. 4649, Maxaquene "C", Maputo, nossa organização 
              representa uma evolução natural no campo da psicologia e desenvolvimento humano em Moçambique.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Nossa Abordagem</h2>
            <p className="mb-4">
              Somos pioneiros na integração de psicologia, filosofia, sociologia e valores cristãos 
              em Moçambique, oferecendo uma metodologia híbrida proprietária que combina conhecimento 
              científico com valores humanos fundamentais.
            </p>
            <p>
              Nossa equipe multidisciplinar inclui Psicólogos Clínicos, Organizacionais, Educacionais, 
              Psicanalistas, Terapeutas e Consultores especializados em diversas áreas como Agropecuária, 
              TI e Gestão Financeira.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
