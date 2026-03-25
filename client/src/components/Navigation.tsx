import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Search, ShoppingCart, Globe, User, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@assets/logo.png";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { useCart, useCartTotal } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/razon-de-ser", label: "Razón de ser" },
  { href: "/apadrinamiento", label: "Apadrinamiento" },
  { href: "/noticias", label: "Noticias" },
  { href: "/agenda", label: "Agenda" },
  { href: "/actividades", label: "Actividades" },
  { href: "/tienda", label: "Tienda" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLang, setCurrentLang] = useState<keyof typeof flags>("ES");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { user, isAdmin } = useAuth();
  const { data: cartItems } = useCart();
  const { count: cartCount } = useCartTotal(cartItems);
  const logout = useLogout();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus();
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
    setUserMenuOpen(false);
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
    navigate("/");
  };

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
              className={`px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
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
        <div className="hidden lg:flex items-center gap-3">
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
                <motion.form
                  onSubmit={handleSearch}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="absolute right-10 overflow-hidden"
                >
                  <input
                    ref={searchRef}
                    data-testid="input-nav-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Buscar..."
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <button
              data-testid="button-toggle-search"
              onClick={() => {
                if (isSearchOpen && searchQuery.trim()) {
                  navigate(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery("");
                }
                setIsSearchOpen(!isSearchOpen);
              }}
              className="p-2 rounded-full hover:bg-black/5 text-foreground/70 hover:text-primary transition-colors"
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          </div>

          {/* Cart */}
          <Link
            href="/carrito"
            data-testid="link-cart"
            className="p-2 rounded-full hover:bg-black/5 text-foreground/70 hover:text-primary transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span data-testid="badge-cart-count" className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white rounded-full text-xs font-bold flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* User */}
          {user ? (
            <div className="relative">
              <button
                data-testid="button-user-menu"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors border border-black/5 bg-white/50"
              >
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{user.username[0].toUpperCase()}</span>
                </div>
                <span className="text-xs font-bold text-foreground/70 max-w-20 truncate">{user.username}</span>
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-black/5 p-1 z-[60]"
                  >
                    {isAdmin && (
                      <Link
                        href="/admin"
                        data-testid="link-admin-panel"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors text-foreground/70 hover:text-foreground"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Panel Admin
                      </Link>
                    )}
                    <Link
                      href="/mis-pedidos"
                      data-testid="link-my-orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors text-foreground/70 hover:text-foreground"
                    >
                      <User className="w-4 h-4" />
                      Mis pedidos
                    </Link>
                    <div className="h-px bg-gray-100 my-1" />
                    <button
                      data-testid="button-logout"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/auth"
              data-testid="link-auth"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
            >
              <User className="w-4 h-4" />
              Acceder
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 relative z-50 text-foreground"
          data-testid="button-mobile-menu"
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
              <div className="flex flex-col gap-2">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    data-testid="input-mobile-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none"
                  />
                </form>
                <div className="flex gap-2">
                  <Link href="/carrito" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors relative">
                    <ShoppingCart className="w-4 h-4" />
                    Carrito
                    {cartCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-primary text-white rounded-full text-xs font-bold">{cartCount}</span>}
                  </Link>
                  {user ? (
                    <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-medium">
                      <LogOut className="w-4 h-4" /> Salir
                    </button>
                  ) : (
                    <Link href="/auth" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-bold">
                      <User className="w-4 h-4" /> Acceder
                    </Link>
                  )}
                </div>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center justify-center gap-2 py-2.5 bg-primary/5 text-primary rounded-xl text-sm font-bold">
                    <LayoutDashboard className="w-4 h-4" /> Panel Admin
                  </Link>
                )}
              </div>
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
                    >
                      {flag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click-away for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-[55]" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  );
}
