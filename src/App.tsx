
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Team from "./pages/Team";
import Values from "./pages/Values";
import Mission from "./pages/Mission";
import Services from "./pages/Services";
import Psicoterapia from "./pages/services/Psicoterapia";
import Consultoria from "./pages/services/Consultoria";
import Cursos from "./pages/services/Cursos";
import Workshops from "./pages/services/Workshops";
import Contact from "./pages/Contact";
import Feedback from "./pages/Feedback";
import Location from "./pages/Location";
import FAQ from "./pages/FAQ";
import Testimonials from "./pages/Testimonials";
import Career from "./pages/Career";
import Appointment from "./pages/Appointment";
import Obrigado from "./pages/Obrigado";
import NotFound from "./pages/NotFound";
import Approach from "./pages/Approach";
import Administration from "./pages/Administration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/values" element={<Values />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/approach" element={<Approach />} />
          <Route path="/administration" element={<Administration />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/psicoterapia" element={<Psicoterapia />} />
          <Route path="/services/consultoria" element={<Consultoria />} />
          <Route path="/services/cursos" element={<Cursos />} />
          <Route path="/services/workshops" element={<Workshops />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/location" element={<Location />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/career" element={<Career />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/obrigado" element={<Obrigado />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
