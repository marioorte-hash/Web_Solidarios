import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Search, ShoppingCart, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@assets/logo.png";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/razon-de-ser", label: "Razón de ser" },
  { href: "/apadrinamiento", label: "Apadrinamiento" },
  { href: "/noticias", label: "Noticias" },
  { href: "/agenda", label: "Agenda" },
  { href: "/actividades", label: "Actividades" },
  { href: "/contacto", label: "Contacto" },
];

const flags = {
  ES: "🇪🇸",
  DE: "🇩🇪",
  GB: "🇬🇧",
  FR: "🇫🇷",
};

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<keyof typeof flags>("ES");
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setIsOpen(false), [location]);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || isOpen ? "bg-white/90 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative z-50 flex-shrink-0">
          <img 
            src={logo} 
            alt="Logo" 
            className={`transition-all duration-300 ${isScrolled ? "h-12 w-auto" : "h-16 w-auto"}`}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                location === link.href
                  ? "text-primary bg-primary/10"
                  : "text-foreground/70 hover:text-primary hover:bg-primary/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors border border-black/5 bg-white/50">
              <span className="text-xl leading-none">{flags[currentLang]}</span>
              <span className="text-xs font-bold text-foreground/60">{currentLang}</span>
            </button>
            <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 p-1 z-[60]">
              {Object.entries(flags).map(([code, flag]) => (
                <button
                  key={code}
                  onClick={() => setCurrentLang(code as keyof typeof flags)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors ${
                    currentLang === code ? "bg-primary/5 text-primary" : "text-foreground/70"
                  }`}
                >
                  <span className="text-xl leading-none">{flag}</span>
                  <span className="font-medium">{code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative flex items-center">
             <AnimatePresence>
              {isSearchOpen && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="absolute right-10 bg-gray-100 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Buscar..."
                  autoFocus
                />
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full hover:bg-black/5 text-foreground/70 hover:text-primary transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Cart */}
          <button className="p-2 rounded-full hover:bg-black/5 text-foreground/70 hover:text-primary transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
            {/* Badge example */}
            {/* <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" /> */}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 relative z-50 text-foreground"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-white shadow-lg lg:hidden border-t border-gray-100 p-4 flex flex-col gap-2"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-lg text-base font-medium ${
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-gray-100 my-2" />
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-xl mt-2">
                <div className="flex gap-3">
                  {Object.entries(flags).map(([code, flag]) => (
                    <button
                      key={code}
                      onClick={() => setCurrentLang(code as keyof typeof flags)}
                      className={`text-2xl p-2 rounded-lg transition-all ${
                        currentLang === code 
                          ? "bg-white shadow-sm scale-110 border border-black/5" 
                          : "opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
                      }`}
                      title={code}
                    >
                      {flag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                   <button className="p-2.5 rounded-full bg-white shadow-sm border border-black/5 text-foreground/70">
                     <Search className="w-5 h-5" />
                   </button>
                   <button className="p-2.5 rounded-full bg-white shadow-sm border border-black/5 text-foreground/70">
                     <ShoppingCart className="w-5 h-5" />
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
