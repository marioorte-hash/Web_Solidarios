import { Link } from "wouter";
import logo from "@assets/logo.png";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-border/40">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col items-start gap-6">
            <Link href="/">
              <img src={logo} alt="Logo" className="h-16 w-auto grayscale hover:grayscale-0 transition-all duration-500 opacity-90" />
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Construyendo un futuro lleno de esperanza y oportunidades para quienes más lo necesitan. Tu apoyo marca la diferencia.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Facebook className="w-5 h-5" />} href="#" />
              <SocialIcon icon={<Instagram className="w-5 h-5" />} href="#" />
              <SocialIcon icon={<Twitter className="w-5 h-5" />} href="#" />
            </div>
          </div>

          {/* Column 2: Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-display text-foreground">Contacto</h3>
            <ul className="space-y-4">
              <ContactItem icon={<Mail className="w-5 h-5" />} text="info@alumnossolidarios.org" />
              <ContactItem icon={<Phone className="w-5 h-5" />} text="+34 620 363 285" />
              <ContactItem icon={<MapPin className="w-5 h-5" />} text="Calle Vital Aza 65, Madrid" />
            </ul>
          </div>

          {/* Column 3: Legal & Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 font-display text-foreground">Información Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/aviso-legal" className="text-muted-foreground hover:text-primary transition-colors">
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-muted-foreground hover:text-primary transition-colors">
                  Contactar
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Alumnos Solidarios. Todos los derechos reservados. · Desarrollado por Mario Orte</p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground/70 hover:bg-primary hover:text-white transition-all duration-300"
    >
      {icon}
    </a>
  );
}

function ContactItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3 text-muted-foreground">
      <span className="text-primary mt-0.5">{icon}</span>
      <span>{text}</span>
    </li>
  );
}
