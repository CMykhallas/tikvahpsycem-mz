
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Contact = () => {
  const contactInfo = [
    {
      title: "Linha Técnica Principal",
      value: "+258 82 759 2980",
      description: "Atendimento técnico e agendamentos"
    },
    {
      title: "Linha de Apoio Operacional",
      value: "+258 82 892 6020 / 778 5043",
      description: "Informações operacionais e suporte"
    },
    {
      title: "Escritório Central",
      value: "Av. 24 de Julho, 767, B/ Polana Cimento",
      description: "Sede Principal - Cidade de Maputo"
    },
    {
      title: "Escritório Técnico", 
      value: "Av. Vlademir Lenine, B/ Maxaquene 'C'",
      description: "Atendimento Especializado - Maputo"
    },
    {
      title: "Email Suporte Geral",
      value: "suporte.oficina.psicologo@proton.me",
      description: "Gestão de questões gerais e suporte técnico"
    },
    {
      title: "Email Administrativo",
      value: "geral.consultoriotekvah@gmail.com",
      description: "Correspondência administrativa e agendamentos"
    },
    {
      title: "Email Institucional",
      value: "ceo.consultoriotekvah@gmail.com",
      description: "Comunicação institucional e parcerias estratégicas"
    }
  ];

  const socialChannels = [
    { name: "Facebook", handle: "Oficina do Psicólogo Moçambique" },
    { name: "Instagram", handle: "@opm_moz" },
    { name: "Twitter", handle: "@opm_moz" },
    { name: "TikTok", handle: "@opm_moz" },
    { name: "WhatsApp", handle: "+258 82 759 2980" }
  ];

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Entre em <span className="text-teal-600">Contato</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Estamos aqui para ajudá-lo. Entre em contato conosco através dos nossos canais oficiais
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Envie sua Mensagem</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nome Completo
                      </label>
                      <Input 
                        placeholder="Seu nome completo"
                        className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Telefone
                      </label>
                      <Input 
                        placeholder="Seu telefone"
                        className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <Input 
                      type="email"
                      placeholder="seu@email.com"
                      className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Assunto
                    </label>
                    <Input 
                      placeholder="Assunto da mensagem"
                      className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mensagem
                    </label>
                    <Textarea 
                      placeholder="Descreva como podemos ajudá-lo..."
                      rows={5}
                      className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition-all duration-300"
                  >
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800">Informações de Contato</h3>
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">{info.title}</h4>
                  <p className="text-teal-600 font-medium text-lg mb-1">{info.value}</p>
                  <p className="text-slate-600 text-sm">{info.description}</p>
                </div>
              ))}
            </div>

            {/* Social Channels */}
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Canais Digitais</h3>
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <p className="text-slate-600 mb-4">Siga-nos nas redes sociais:</p>
                <div className="space-y-3">
                  {socialChannels.map((channel, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
                      <span className="font-medium text-slate-700">{channel.name}</span>
                      <span className="text-teal-600">{channel.handle}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-xl">
              <h4 className="text-lg font-bold mb-2">Emergência 24h</h4>
              <p className="text-red-100 mb-3">Para situações de emergência psicológica:</p>
              <p className="text-xl font-bold">+258 82 759 2980</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
