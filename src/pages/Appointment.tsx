
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, CreditCard, Smartphone, User, Phone, Mail, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Appointment = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    documentType: "",
    documentNumber: "",
    serviceType: "",
    attendanceType: "",
    appointmentDate: "",
    appointmentTime: "",
    paymentMethod: "",
    questionnaire: {} as Record<string, string[]>,
    additionalNotes: ""
  });

  const services = [
    { id: "psicoterapia-individual", name: "Psicoterapia Individual", price: "2500 MT" },
    { id: "terapia-casal", name: "Terapia de Casal", price: "3000 MT" },
    { id: "consultoria-organizacional", name: "Consultoria Organizacional", price: "5000 MT" },
    { id: "workshop-mindfulness", name: "Workshop de Mindfulness", price: "1500 MT" },
    { id: "curso-inteligencia-emocional", name: "Curso de Inteligência Emocional", price: "4000 MT" }
  ];

  const questionnaires = {
    "psicoterapia-individual": [
      {
        question: "Qual é o principal motivo que o trouxe aqui hoje?",
        options: ["Ansiedade", "Depressão", "Problemas de relacionamento", "Autoestima", "Outros"]
      },
      {
        question: "Há quanto tempo você sente que precisa de ajuda?",
        options: ["Menos de 1 mês", "1-3 meses", "3-6 meses", "Mais de 6 meses"]
      },
      {
        question: "Você já fez terapia antes?",
        options: ["Sim, recentemente", "Sim, há muito tempo", "Não, é a primeira vez"]
      },
      {
        question: "Como você avalia seu nível de estresse atual?",
        options: ["Muito baixo", "Baixo", "Moderado", "Alto", "Muito alto"]
      },
      {
        question: "Você tem alguma condição médica ou toma medicamentos?",
        options: ["Sim", "Não", "Prefiro discutir pessoalmente"]
      }
    ],
    "terapia-casal": [
      {
        question: "Há quanto tempo vocês estão juntos?",
        options: ["Menos de 1 ano", "1-3 anos", "3-5 anos", "5-10 anos", "Mais de 10 anos"]
      },
      {
        question: "Qual é o principal desafio no relacionamento?",
        options: ["Comunicação", "Confiança", "Intimidade", "Finanças", "Outros"]
      },
      {
        question: "Vocês já fizeram terapia de casal antes?",
        options: ["Sim", "Não"]
      },
      {
        question: "Ambos estão comprometidos com a terapia?",
        options: ["Sim, ambos", "Um mais que o outro", "Ainda não sei"]
      },
      {
        question: "Como avaliam a comunicação entre vocês?",
        options: ["Excelente", "Boa", "Regular", "Ruim", "Muito ruim"]
      }
    ]
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      // Here you would integrate with your payment processing
      toast({
        title: "Agendamento realizado com sucesso!",
        description: "Você receberá uma confirmação por email em breve.",
      });
      
      // Reset form or redirect
      setStep(1);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        documentType: "",
        documentNumber: "",
        serviceType: "",
        attendanceType: "",
        appointmentDate: "",
        appointmentTime: "",
        paymentMethod: "",
        questionnaire: {},
        additionalNotes: ""
      });
    } catch (error) {
      toast({
        title: "Erro ao processar agendamento",
        description: "Tente novamente ou entre em contato conosco.",
        variant: "destructive"
      });
    }
  };

  const updateQuestionnaire = (questionIndex: number, selectedOptions: string[]) => {
    setFormData(prev => ({
      ...prev,
      questionnaire: {
        ...prev.questionnaire,
        [questionIndex]: selectedOptions
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Agendar <span className="text-teal-600">Consulta</span>
          </h1>
          <p className="text-xl text-slate-600">
            Complete o formulário para agendar sua consulta personalizada
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= num ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {num}
                </div>
                {num < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step > num ? "bg-teal-600" : "bg-slate-200"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-slate-600 mt-2 max-w-md mx-auto">
            <span>Dados Pessoais</span>
            <span>Serviço</span>
            <span>Questionário</span>
            <span>Pagamento</span>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              {step === 1 && <><User className="w-6 h-6 mr-2" />Dados Pessoais</>}
              {step === 2 && <><Calendar className="w-6 h-6 mr-2" />Seleção de Serviço</>}
              {step === 3 && <><FileText className="w-6 h-6 mr-2" />Questionário Específico</>}
              {step === 4 && <><CreditCard className="w-6 h-6 mr-2" />Pagamento e Confirmação</>}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Personal Data */}
            {step === 1 && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+258 84 123 4567"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="documentType">Tipo de Documento *</Label>
                  <Select value={formData.documentType} onValueChange={(value) => setFormData({...formData, documentType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bi">Bilhete de Identidade</SelectItem>
                      <SelectItem value="passaporte">Passaporte</SelectItem>
                      <SelectItem value="carta_conducao">Carta de Condução</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="documentNumber">Número do Documento *</Label>
                  <Input
                    id="documentNumber"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
                    placeholder="Número do documento"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Service Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label>Selecione o Serviço *</Label>
                  <RadioGroup 
                    value={formData.serviceType} 
                    onValueChange={(value) => setFormData({...formData, serviceType: value})}
                    className="mt-3"
                  >
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50">
                        <RadioGroupItem value={service.id} id={service.id} />
                        <div className="flex-1">
                          <Label htmlFor={service.id} className="font-medium cursor-pointer">
                            {service.name}
                          </Label>
                          <p className="text-sm text-slate-600">Preço: {service.price}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label>Tipo de Atendimento *</Label>
                  <RadioGroup 
                    value={formData.attendanceType} 
                    onValueChange={(value) => setFormData({...formData, attendanceType: value})}
                    className="mt-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="presencial" id="presencial" />
                      <Label htmlFor="presencial" className="cursor-pointer">Presencial</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="cursor-pointer">Online</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="hibrido" id="hibrido" />
                      <Label htmlFor="hibrido" className="cursor-pointer">Híbrido</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appointmentDate">Data Preferida *</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="appointmentTime">Horário Preferido *</Label>
                    <Select value={formData.appointmentTime} onValueChange={(value) => setFormData({...formData, appointmentTime: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">08:00</SelectItem>
                        <SelectItem value="09:00">09:00</SelectItem>
                        <SelectItem value="10:00">10:00</SelectItem>
                        <SelectItem value="11:00">11:00</SelectItem>
                        <SelectItem value="14:00">14:00</SelectItem>
                        <SelectItem value="15:00">15:00</SelectItem>
                        <SelectItem value="16:00">16:00</SelectItem>
                        <SelectItem value="17:00">17:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Service-specific Questionnaire */}
            {step === 3 && formData.serviceType && questionnaires[formData.serviceType as keyof typeof questionnaires] && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-slate-800">
                    Questionário Específico
                  </h3>
                  <p className="text-slate-600">
                    Estas informações nos ajudam a preparar melhor o atendimento
                  </p>
                </div>

                {questionnaires[formData.serviceType as keyof typeof questionnaires].map((q, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <Label className="font-medium mb-3 block">{q.question}</Label>
                    <div className="space-y-2">
                      {q.options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={`q${index}-${option}`}
                            checked={formData.questionnaire[index]?.includes(option) || false}
                            onCheckedChange={(checked) => {
                              const currentAnswers = formData.questionnaire[index] || [];
                              if (checked) {
                                updateQuestionnaire(index, [...currentAnswers, option]);
                              } else {
                                updateQuestionnaire(index, currentAnswers.filter(a => a !== option));
                              }
                            }}
                          />
                          <Label htmlFor={`q${index}-${option}`} className="cursor-pointer text-sm">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div>
                  <Label htmlFor="additionalNotes">Informações Adicionais (Opcional)</Label>
                  <Textarea
                    id="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                    placeholder="Qualquer informação adicional que considere importante..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Resumo do Agendamento</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Cliente:</strong> {formData.fullName}</p>
                    <p><strong>Serviço:</strong> {services.find(s => s.id === formData.serviceType)?.name}</p>
                    <p><strong>Tipo:</strong> {formData.attendanceType}</p>
                    <p><strong>Data:</strong> {formData.appointmentDate}</p>
                    <p><strong>Horário:</strong> {formData.appointmentTime}</p>
                    <p><strong>Preço:</strong> {services.find(s => s.id === formData.serviceType)?.price}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold">Método de Pagamento *</Label>
                  <RadioGroup 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
                    className="mt-3"
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value="cartao_debito" id="cartao_debito" />
                      <CreditCard className="w-5 h-5 text-slate-600" />
                      <Label htmlFor="cartao_debito" className="cursor-pointer">Cartão de Débito</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value="m_pesa" id="m_pesa" />
                      <Smartphone className="w-5 h-5 text-slate-600" />
                      <Label htmlFor="m_pesa" className="cursor-pointer">M-Pesa</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value="e_mola" id="e_mola" />
                      <Smartphone className="w-5 h-5 text-slate-600" />
                      <Label htmlFor="e_mola" className="cursor-pointer">E-mola</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Após confirmar o agendamento, você receberá instruções de pagamento via email/SMS conforme o método selecionado.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={step === 1}
              >
                Voltar
              </Button>
              
              {step < 4 ? (
                <Button 
                  onClick={handleNext}
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                  disabled={
                    (step === 1 && (!formData.fullName || !formData.email || !formData.phone || !formData.documentType || !formData.documentNumber)) ||
                    (step === 2 && (!formData.serviceType || !formData.attendanceType || !formData.appointmentDate || !formData.appointmentTime)) ||
                    (step === 3 && Object.keys(formData.questionnaire).length === 0)
                  }
                >
                  Próximo
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  disabled={!formData.paymentMethod}
                >
                  Confirmar Agendamento
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Appointment;
