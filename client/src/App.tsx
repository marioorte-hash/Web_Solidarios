import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

// Pages
import Home from "@/pages/Home";
import News from "@/pages/News";
import Activities from "@/pages/Activities";
import Contact from "@/pages/Contact";
import { RazonDeSer, Apadrinamiento } from "@/pages/GenericPage";
import { AvisoLegal, Privacidad } from "@/pages/Legal";
import NotFound from "@/pages/not-found";

// Scroll to top on route change
function ScrollToTop() {
  const [pathname] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/noticias" component={News} />
      <Route path="/blog" component={News} /> {/* Reuse News for Blog initially */}
      <Route path="/actividades" component={Activities} />
      <Route path="/agenda" component={Activities} /> {/* Reuse Activities for Agenda */}
      <Route path="/contacto" component={Contact} />
      
      {/* Static Content Pages */}
      <Route path="/razon-de-ser" component={RazonDeSer} />
      <Route path="/apadrinamiento" component={Apadrinamiento} />
      
      {/* Legal */}
      <Route path="/aviso-legal" component={AvisoLegal} />
      <Route path="/privacidad" component={Privacidad} />
      <Route path="/cookies" component={Privacidad} /> {/* Reuse Privacidad for now */}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen font-sans">
          <Navigation />
          <main className="flex-grow pt-0">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
