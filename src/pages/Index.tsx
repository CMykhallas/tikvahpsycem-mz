
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { BackToTop } from "@/components/BackToTop";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ChatbotTriagem } from "@/components/ChatbotTriagem";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Contact />
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
      <ChatbotTriagem />
      <PerformanceMonitor />
    </div>
  );
};

export default Index;
