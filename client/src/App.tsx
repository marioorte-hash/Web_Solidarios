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
import Auth from "@/pages/Auth";
import Store from "@/pages/Store";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Admin from "@/pages/Admin";
import Search from "@/pages/Search";
import Orders from "@/pages/Orders";
import NewsDetail from "@/pages/NewsDetail";
import UserPanel from "@/pages/UserPanel";
import Mensajes from "@/pages/Mensajes";

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
      <Route path="/noticias/:id" component={NewsDetail} />
      <Route path="/blog" component={News} />
      <Route path="/actividades" component={Activities} />
      <Route path="/agenda" component={Activities} />
      <Route path="/contacto" component={Contact} />

      {/* Auth */}
      <Route path="/auth" component={Auth} />

      {/* Store */}
      <Route path="/tienda" component={Store} />
      <Route path="/tienda/:id" component={ProductDetail} />

      {/* Cart & Orders */}
      <Route path="/carrito" component={Cart} />
      <Route path="/mis-pedidos" component={Orders} />

      {/* User Panel & Messaging */}
      <Route path="/mi-panel" component={UserPanel} />
      <Route path="/mensajes" component={Mensajes} />

      {/* Admin */}
      <Route path="/admin" component={Admin} />

      {/* Search */}
      <Route path="/buscar" component={Search} />

      {/* Static Content Pages */}
      <Route path="/razon-de-ser" component={RazonDeSer} />
      <Route path="/apadrinamiento" component={Apadrinamiento} />

      {/* Legal */}
      <Route path="/aviso-legal" component={AvisoLegal} />
      <Route path="/privacidad" component={Privacidad} />
      <Route path="/cookies" component={Privacidad} />

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
