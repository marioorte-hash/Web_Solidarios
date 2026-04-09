import { createContext, useContext, useState } from "react";

export type Lang = "ES" | "EN" | "DE" | "FR";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ES",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("lang") as Lang) || "ES";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function localizedText(
  es: string | null | undefined,
  en: string | null | undefined,
  de: string | null | undefined,
  lang: Lang,
  fr?: string | null | undefined
): string {
  if (lang === "EN" && en) return en;
  if (lang === "DE" && de) return de;
  if (lang === "FR" && fr) return fr;
  return es || "";
}

type TS = { ES: string; EN: string; DE: string; FR: string };

export const T = {
  nav: {
    home:            { ES: "Inicio",           EN: "Home",            DE: "Startseite",          FR: "Accueil" } as TS,
    razonDeSer:      { ES: "Razón de ser",     EN: "Our Mission",     DE: "Unsere Mission",       FR: "Notre Mission" } as TS,
    apadrinamiento:  { ES: "Apadrinamiento",   EN: "Sponsorship",     DE: "Patenschaft",          FR: "Parrainage" } as TS,
    news:            { ES: "Noticias",         EN: "News",            DE: "Nachrichten",          FR: "Actualités" } as TS,
    activities:      { ES: "Actividades",      EN: "Activities",      DE: "Aktivitäten",          FR: "Activités" } as TS,
    store:           { ES: "Tienda",           EN: "Store",           DE: "Shop",                 FR: "Boutique" } as TS,
    contact:         { ES: "Contacto",         EN: "Contact",         DE: "Kontakt",              FR: "Contact" } as TS,
    access:          { ES: "Acceder",          EN: "Sign in",         DE: "Anmelden",             FR: "Se connecter" } as TS,
    myPanel:         { ES: "Mi panel de socio",EN: "My member panel", DE: "Mein Mitgliederbereich",FR: "Mon espace membre" } as TS,
    adminPanel:      { ES: "Panel Admin",      EN: "Admin Panel",     DE: "Admin-Panel",          FR: "Panneau Admin" } as TS,
    logout:          { ES: "Cerrar sesión",    EN: "Log out",         DE: "Abmelden",             FR: "Se déconnecter" } as TS,
    search:          { ES: "Buscar...",        EN: "Search...",       DE: "Suchen...",            FR: "Rechercher..." } as TS,
    cart:            { ES: "Carrito",          EN: "Cart",            DE: "Warenkorb",            FR: "Panier" } as TS,
    sessionClosed:   { ES: "Sesión cerrada",   EN: "Session closed",  DE: "Sitzung beendet",      FR: "Session fermée" } as TS,
    sessionClosedDesc:{ ES: "Has cerrado sesión correctamente.", EN: "You have logged out successfully.", DE: "Du hast dich erfolgreich abgemeldet.", FR: "Vous avez été déconnecté avec succès." } as TS,
  },
  footer: {
    tagline:      { ES: "Construyendo un futuro lleno de esperanza y oportunidades para quienes más lo necesitan. Tu apoyo marca la diferencia.", EN: "Building a future full of hope and opportunities for those who need it most. Your support makes a difference.", DE: "Eine Zukunft voller Hoffnung und Chancen für die Bedürftigsten aufbauen. Deine Unterstützung macht den Unterschied.", FR: "Construire un avenir plein d'espoir et d'opportunités pour ceux qui en ont le plus besoin. Votre soutien fait la différence." } as TS,
    contactTitle: { ES: "Contacto",             EN: "Contact",              DE: "Kontakt",                    FR: "Contact" } as TS,
    legalTitle:   { ES: "Información Legal",    EN: "Legal Information",    DE: "Rechtliche Informationen",   FR: "Informations Légales" } as TS,
    legalNotice:  { ES: "Aviso Legal",          EN: "Legal Notice",         DE: "Impressum",                  FR: "Mentions Légales" } as TS,
    privacy:      { ES: "Política de Privacidad",EN: "Privacy Policy",      DE: "Datenschutzrichtlinie",      FR: "Politique de Confidentialité" } as TS,
    cookies:      { ES: "Política de Cookies",  EN: "Cookie Policy",        DE: "Cookie-Richtlinie",          FR: "Politique de Cookies" } as TS,
    contactUs:    { ES: "Contactar",            EN: "Contact us",           DE: "Kontakt aufnehmen",          FR: "Nous contacter" } as TS,
    rights:       { ES: "Todos los derechos reservados.", EN: "All rights reserved.", DE: "Alle Rechte vorbehalten.", FR: "Tous droits réservés." } as TS,
    devBy:        { ES: "Desarrollado por",     EN: "Developed by",         DE: "Entwickelt von",             FR: "Développé par" } as TS,
  },
  home: {
    badge:             { ES: "Juntos cambiamos vidas",          EN: "Together we change lives",         DE: "Gemeinsam verändern wir Leben",           FR: "Ensemble nous changeons des vies" } as TS,
    heroTitle1:        { ES: "Pequeños gestos,",                EN: "Small gestures,",                  DE: "Kleine Gesten,",                          FR: "Petits gestes," } as TS,
    heroTitle2:        { ES: "grandes sonrisas.",               EN: "great smiles.",                    DE: "große Lächeln.",                           FR: "grands sourires." } as TS,
    heroDesc:          { ES: "Trabajamos cada día para construir un futuro lleno de oportunidades, amor y esperanza para quienes más lo necesitan.", EN: "We work every day to build a future full of opportunities, love and hope for those who need it most.", DE: "Wir arbeiten täglich daran, eine Zukunft voller Chancen, Liebe und Hoffnung für die Bedürftigsten zu gestalten.", FR: "Nous travaillons chaque jour pour construire un avenir plein d'opportunités, d'amour et d'espoir pour ceux qui en ont le plus besoin." } as TS,
    collaborate:       { ES: "Colabora hoy",                   EN: "Collaborate today",                DE: "Jetzt mitmachen",                         FR: "Collaborer aujourd'hui" } as TS,
    learnAboutUs:      { ES: "Conócenos",                      EN: "Learn about us",                   DE: "Über uns",                                FR: "Qui sommes-nous" } as TS,
    commitment:        { ES: "Compromiso",                     EN: "Commitment",                       DE: "Engagement",                              FR: "Engagement" } as TS,
    commitmentDesc:    { ES: "Dedicación total al bienestar y desarrollo integral de cada niño.", EN: "Total dedication to the well-being and integral development of each child.", DE: "Vollständiges Engagement für das Wohlergehen jedes Kindes.", FR: "Dévouement total au bien-être et au développement intégral de chaque enfant." } as TS,
    community:         { ES: "Comunidad",                      EN: "Community",                        DE: "Gemeinschaft",                            FR: "Communauté" } as TS,
    communityDesc:     { ES: "Creamos lazos fuertes entre familias, voluntarios y padrinos.", EN: "We create strong bonds between families, volunteers and sponsors.", DE: "Wir schaffen starke Verbindungen zwischen Familien, Freiwilligen und Paten.", FR: "Nous créons des liens forts entre les familles, les bénévoles et les parrains." } as TS,
    transparency:      { ES: "Transparencia",                  EN: "Transparency",                     DE: "Transparenz",                             FR: "Transparence" } as TS,
    transparencyDesc:  { ES: "Claridad total en la gestión de recursos y el impacto generado.", EN: "Total clarity in resource management and the impact generated.", DE: "Volle Klarheit bei der Ressourcenverwaltung und den Auswirkungen.", FR: "Transparence totale dans la gestion des ressources et l'impact généré." } as TS,
    upcomingActivities:{ ES: "Próximas Actividades",           EN: "Upcoming Activities",              DE: "Kommende Aktivitäten",                    FR: "Prochaines Activités" } as TS,
    activitiesSubDesc: { ES: "Participa en nuestros eventos y forma parte de la comunidad.", EN: "Join our events and be part of the community.", DE: "Nimm an unseren Veranstaltungen teil und werde Teil der Gemeinschaft.", FR: "Participez à nos événements et faites partie de la communauté." } as TS,
    seeAll:            { ES: "Ver todas",                      EN: "See all",                          DE: "Alle anzeigen",                           FR: "Voir tout" } as TS,
    comingSoon:        { ES: "Próximamente nuevas actividades",EN: "New activities coming soon",        DE: "Bald neue Aktivitäten",                   FR: "Nouvelles activités bientôt" } as TS,
    latestNews:        { ES: "Últimas Noticias",               EN: "Latest News",                      DE: "Neueste Nachrichten",                     FR: "Dernières Actualités" } as TS,
    newsSubDesc:       { ES: "Mantente al día de nuestras acciones y logros.", EN: "Stay up to date with our actions and achievements.", DE: "Bleibe über unsere Aktivitäten auf dem Laufenden.", FR: "Restez informé de nos actions et réalisations." } as TS,
    solidarityStore:   { ES: "Tienda Solidaria",               EN: "Solidarity Store",                 DE: "Solidaritätsladen",                       FR: "Boutique Solidaire" } as TS,
    storeDesc:         { ES: "Compra con propósito. Cada artículo ayuda a financiar nuestros proyectos.", EN: "Shop with purpose. Every item helps fund our projects.", DE: "Kaufe mit Sinn. Jeder Artikel hilft, unsere Projekte zu finanzieren.", FR: "Achetez avec un but. Chaque article aide à financer nos projets." } as TS,
    seeStore:          { ES: "Ver tienda",                     EN: "See store",                        DE: "Shop ansehen",                            FR: "Voir la boutique" } as TS,
    comingSoonStore:   { ES: "Próximamente artículos en la tienda", EN: "Store items coming soon",      DE: "Bald Artikel im Shop",                    FR: "Articles bientôt disponibles" } as TS,
    ctaTitle:          { ES: "¿Quieres ser parte del cambio?", EN: "Do you want to be part of the change?", DE: "Möchtest du Teil des Wandels sein?",    FR: "Voulez-vous faire partie du changement ?" } as TS,
    ctaDesc:           { ES: "Tu apoyo hace posible que sigamos creando historias con final feliz. Descubre cómo puedes colaborar.", EN: "Your support makes it possible for us to keep creating stories with happy endings. Find out how you can help.", DE: "Deine Unterstützung ermöglicht es uns, weiterhin Geschichten mit glücklichem Ende zu schaffen.", FR: "Votre soutien nous permet de continuer à créer des histoires à heureux dénouement. Découvrez comment collaborer." } as TS,
    ctaBtn:            { ES: "Contáctanos ahora",              EN: "Contact us now",                   DE: "Kontaktiere uns jetzt",                   FR: "Contactez-nous maintenant" } as TS,
    seeAllActivities:  { ES: "Ver todas las actividades",      EN: "See all activities",               DE: "Alle Aktivitäten ansehen",                FR: "Voir toutes les activités" } as TS,
    seeAllNewsBtn:     { ES: "Ver todas las noticias",         EN: "See all news",                     DE: "Alle Nachrichten ansehen",                FR: "Voir toutes les actualités" } as TS,
    seeAllStore:       { ES: "Ver toda la tienda",             EN: "See full store",                   DE: "Gesamten Shop ansehen",                   FR: "Voir toute la boutique" } as TS,
  },
  activities: {
    pageTitle: { ES: "Un Recorrido por Nuestra Historia", EN: "A Journey Through Our History", DE: "Eine Reise durch unsere Geschichte", FR: "Un Parcours à Travers Notre Histoire" } as TS,
    pageDesc:  { ES: "A lo largo de los años, impulsados desde la Dirección del Colegio madrileño JOYFE, hemos realizado infinidad de acciones de sensibilización con todo tipo de fines.", EN: "Over the years, driven by the leadership of the Madrid school JOYFE, we have carried out countless awareness actions for all kinds of purposes.", DE: "Im Laufe der Jahre haben wir unzählige Sensibilisierungsaktionen für alle Arten von Zwecken durchgeführt.", FR: "Au fil des années, nous avons réalisé d'innombrables actions de sensibilisation pour toutes sortes de causes." } as TS,
    noActivities: { ES: "No hay actividades programadas próximamente.", EN: "No activities scheduled soon.", DE: "Keine Aktivitäten demnächst geplant.", FR: "Pas d'activités programmées prochainement." } as TS,
  },
  news: {
    pageTitle: { ES: "Noticias y Actualidad",  EN: "News & Updates",       DE: "Neuigkeiten & Aktuelles",   FR: "Actualités & Nouvelles" } as TS,
    pageDesc:  { ES: "Descubre nuestras últimas historias, logros y novedades. Transparencia y cercanía en cada paso que damos.", EN: "Discover our latest stories, achievements and news. Transparency and closeness in every step we take.", DE: "Entdecke unsere neuesten Geschichten und Neuigkeiten. Transparenz bei jedem Schritt.", FR: "Découvrez nos dernières histoires, réalisations et actualités. Transparence à chaque étape." } as TS,
    noNews:    { ES: "No hay noticias disponibles en este momento.", EN: "No news available at the moment.", DE: "Derzeit keine Nachrichten verfügbar.", FR: "Aucune actualité disponible pour le moment." } as TS,
  },
  store: {
    badge:          { ES: "Tienda Solidaria",         EN: "Solidarity Store",       DE: "Solidaritätsladen",        FR: "Boutique Solidaire" } as TS,
    title:          { ES: "Compra con propósito",     EN: "Shop with purpose",      DE: "Sinnvoll einkaufen",       FR: "Achetez avec un but" } as TS,
    desc:           { ES: "Cada compra contribuye directamente a nuestros proyectos educativos y solidarios.", EN: "Every purchase directly contributes to our educational and solidarity projects.", DE: "Jeder Kauf trägt direkt zu unseren Projekten bei.", FR: "Chaque achat contribue directement à nos projets éducatifs et solidaires." } as TS,
    searchPlaceholder:{ ES: "Buscar productos...",    EN: "Search products...",     DE: "Produkte suchen...",       FR: "Rechercher des produits..." } as TS,
    all:            { ES: "Todos",                    EN: "All",                    DE: "Alle",                     FR: "Tous" } as TS,
    outOfStock:     { ES: "Agotado",                  EN: "Out of stock",           DE: "Ausverkauft",              FR: "Épuisé" } as TS,
    addToCart:      { ES: "Añadir",                   EN: "Add",                    DE: "Hinzufügen",               FR: "Ajouter" } as TS,
    noProducts:     { ES: "No se encontraron productos", EN: "No products found",   DE: "Keine Produkte gefunden",  FR: "Aucun produit trouvé" } as TS,
    addedToCart:    { ES: "Añadido al carrito",       EN: "Added to cart",          DE: "Zum Warenkorb hinzugefügt",FR: "Ajouté au panier" } as TS,
  },
  contact: {
    pageTitle:        { ES: "Estamos aquí para ti",         EN: "We are here for you",          DE: "Wir sind für dich da",               FR: "Nous sommes là pour vous" } as TS,
    pageDesc:         { ES: "¿Tienes preguntas, ideas o quieres colaborar? Escríbenos, nos encantará escucharte.", EN: "Do you have questions, ideas or want to collaborate? Write to us, we will be happy to hear from you.", DE: "Hast du Fragen oder möchtest du mitarbeiten? Schreib uns!", FR: "Vous avez des questions ou souhaitez collaborer ? Écrivez-nous !" } as TS,
    infoTitle:        { ES: "Información de contacto",     EN: "Contact information",           DE: "Kontaktinformationen",               FR: "Informations de contact" } as TS,
    email:            { ES: "Email",                       EN: "Email",                         DE: "E-Mail",                             FR: "E-mail" } as TS,
    phone:            { ES: "Teléfono",                    EN: "Phone",                         DE: "Telefon",                            FR: "Téléphone" } as TS,
    address:          { ES: "Dirección",                   EN: "Address",                       DE: "Adresse",                            FR: "Adresse" } as TS,
    hours:            { ES: "Horario de atención",         EN: "Office hours",                  DE: "Öffnungszeiten",                     FR: "Horaires d'ouverture" } as TS,
    hoursValue:       { ES: "Lunes a Viernes: 9:00 – 17:00", EN: "Monday to Friday: 9:00 – 17:00", DE: "Mo–Fr: 9:00 – 17:00",            FR: "Lun–Ven : 9h00 – 17h00" } as TS,
    formTitle:        { ES: "Envíanos un mensaje",         EN: "Send us a message",             DE: "Schick uns eine Nachricht",          FR: "Envoyez-nous un message" } as TS,
    formDesc:         { ES: "Completa el formulario y te contactaremos.", EN: "Fill out the form and we will contact you.", DE: "Füll das Formular aus und wir melden uns.", FR: "Remplissez le formulaire et nous vous contacterons." } as TS,
    name:             { ES: "Nombre completo",             EN: "Full name",                     DE: "Vollständiger Name",                 FR: "Nom complet" } as TS,
    namePlaceholder:  { ES: "Tu nombre",                   EN: "Your name",                     DE: "Dein Name",                          FR: "Votre nom" } as TS,
    emailLabel:       { ES: "Correo electrónico",          EN: "Email address",                 DE: "E-Mail-Adresse",                     FR: "Adresse e-mail" } as TS,
    message:          { ES: "Mensaje",                     EN: "Message",                       DE: "Nachricht",                          FR: "Message" } as TS,
    messagePlaceholder:{ ES: "¿En qué podemos ayudarte?", EN: "How can we help you?",           DE: "Wie können wir dir helfen?",         FR: "Comment pouvons-nous vous aider ?" } as TS,
    send:             { ES: "Enviar Mensaje",              EN: "Send Message",                  DE: "Nachricht senden",                   FR: "Envoyer le Message" } as TS,
    sending:          { ES: "Enviando...",                 EN: "Sending...",                    DE: "Senden...",                          FR: "Envoi en cours..." } as TS,
    successTitle:     { ES: "¡Mensaje enviado!",           EN: "Message sent!",                 DE: "Nachricht gesendet!",                FR: "Message envoyé !" } as TS,
    successDesc:      { ES: "Gracias por contactarnos. Te responderemos lo antes posible.", EN: "Thank you for contacting us. We will respond as soon as possible.", DE: "Danke! Wir antworten so bald wie möglich.", FR: "Merci de nous avoir contactés. Nous vous répondrons dès que possible." } as TS,
    errorTitle:       { ES: "Error al enviar",             EN: "Error sending",                 DE: "Fehler beim Senden",                 FR: "Erreur d'envoi" } as TS,
  },
  auth: {
    welcome:           { ES: "¡Bienvenido!",              EN: "Welcome!",                DE: "Willkommen!",                  FR: "Bienvenue !" } as TS,
    loginSuccess:      { ES: "Has iniciado sesión correctamente.", EN: "You have successfully logged in.", DE: "Du hast dich erfolgreich angemeldet.", FR: "Vous êtes connecté avec succès." } as TS,
    accountCreated:    { ES: "¡Cuenta creada!",           EN: "Account created!",        DE: "Konto erstellt!",              FR: "Compte créé !" } as TS,
    registerSuccess:   { ES: "Te has registrado correctamente.", EN: "You have registered successfully.", DE: "Du hast dich erfolgreich registriert.", FR: "Vous vous êtes inscrit avec succès." } as TS,
    loginTitle:        { ES: "Iniciar Sesión",            EN: "Sign In",                 DE: "Anmelden",                     FR: "Se connecter" } as TS,
    registerTitle:     { ES: "Crear Cuenta",              EN: "Create Account",          DE: "Konto erstellen",              FR: "Créer un compte" } as TS,
    loginSubtitle:     { ES: "Accede a tu espacio de socio", EN: "Access your member space", DE: "Zugang zu deinem Mitgliederbereich", FR: "Accédez à votre espace membre" } as TS,
    registerSubtitle:  { ES: "Únete a la comunidad solidaria", EN: "Join the solidarity community", DE: "Trete der Solidaritätsgemeinschaft bei", FR: "Rejoignez la communauté solidaire" } as TS,
    email:             { ES: "Email",                     EN: "Email",                   DE: "E-Mail",                       FR: "E-mail" } as TS,
    password:          { ES: "Contraseña",                EN: "Password",                DE: "Passwort",                     FR: "Mot de passe" } as TS,
    username:          { ES: "Nombre de usuario",         EN: "Username",                DE: "Benutzername",                 FR: "Nom d'utilisateur" } as TS,
    loginBtn:          { ES: "Iniciar Sesión",            EN: "Sign In",                 DE: "Anmelden",                     FR: "Se connecter" } as TS,
    registerBtn:       { ES: "Crear Cuenta",              EN: "Create Account",          DE: "Konto erstellen",              FR: "Créer un compte" } as TS,
    loggingIn:         { ES: "Iniciando sesión...",       EN: "Signing in...",           DE: "Anmelden...",                  FR: "Connexion..." } as TS,
    registering:       { ES: "Creando cuenta...",         EN: "Creating account...",     DE: "Konto wird erstellt...",       FR: "Création du compte..." } as TS,
    haveAccount:       { ES: "¿Ya tienes cuenta?",        EN: "Already have an account?",DE: "Bereits ein Konto?",           FR: "Vous avez déjà un compte ?" } as TS,
    noAccount:         { ES: "¿No tienes cuenta?",        EN: "Don't have an account?",  DE: "Noch kein Konto?",             FR: "Pas encore de compte ?" } as TS,
    signIn:            { ES: "Inicia sesión",             EN: "Sign in",                 DE: "Anmelden",                     FR: "Se connecter" } as TS,
    signUp:            { ES: "Regístrate",                EN: "Sign up",                 DE: "Registrieren",                 FR: "S'inscrire" } as TS,
    privacyLabel:      { ES: "Acepto la",                 EN: "I accept the",            DE: "Ich akzeptiere die",           FR: "J'accepte la" } as TS,
    privacyLink:       { ES: "Política de Privacidad",    EN: "Privacy Policy",          DE: "Datenschutzrichtlinie",        FR: "Politique de confidentialité" } as TS,
    minChars3:         { ES: "Mínimo 3 caracteres",       EN: "At least 3 characters",   DE: "Mindestens 3 Zeichen",         FR: "Au moins 3 caractères" } as TS,
    minChars6:         { ES: "Mínimo 6 caracteres",       EN: "At least 6 characters",   DE: "Mindestens 6 Zeichen",         FR: "Au moins 6 caractères" } as TS,
    invalidEmail:      { ES: "Email inválido",            EN: "Invalid email",           DE: "Ungültige E-Mail",             FR: "E-mail invalide" } as TS,
    requiredPassword:  { ES: "Introduce tu contraseña",   EN: "Enter your password",     DE: "Bitte Passwort eingeben",      FR: "Entrez votre mot de passe" } as TS,
    acceptTerms:       { ES: "Debes aceptar la política de privacidad para registrarte", EN: "You must accept the privacy policy to register", DE: "Du musst die Datenschutzrichtlinie akzeptieren", FR: "Vous devez accepter la politique de confidentialité" } as TS,
  },
  sponsorship: {
    pageTitle:   { ES: "Apadrinamiento",            EN: "Sponsorship",             DE: "Patenschaft",                   FR: "Parrainage" } as TS,
    pageDesc:    { ES: "Crea un vínculo único y transforma el futuro de un niño.", EN: "Create a unique bond and transform a child's future.", DE: "Schaffe ein einzigartiges Band und transformiere die Zukunft eines Kindes.", FR: "Créez un lien unique et transformez l'avenir d'un enfant." } as TS,
    what:        { ES: "¿Qué significa apadrinar?", EN: "What does sponsorship mean?", DE: "Was bedeutet Patenschaft?",  FR: "Que signifie parrainer ?" } as TS,
    whatDesc:    { ES: "Apadrinar es mucho más que una aportación económica. Es crear un lazo afectivo y solidario que permite a un niño acceder a educación, salud y nutrición adecuada. Tu apoyo no solo ayuda al niño, sino que impacta positivamente en toda su comunidad.", EN: "Sponsorship is much more than a financial contribution. It creates an affective and solidarity bond that allows a child to access education, health and adequate nutrition. Your support not only helps the child but positively impacts their entire community.", DE: "Eine Patenschaft ist viel mehr als eine finanzielle Beteiligung. Sie schafft ein affektives Band, das einem Kind Zugang zu Bildung, Gesundheit und Ernährung ermöglicht. Deine Unterstützung hilft nicht nur dem Kind, sondern der ganzen Gemeinschaft.", FR: "Le parrainage est bien plus qu'une contribution financière. Il crée un lien affectif et solidaire permettant à un enfant d'accéder à l'éducation, la santé et une alimentation adéquate. Votre soutien profite à toute sa communauté." } as TS,
    includes:    { ES: "Tu aportación incluye:",   EN: "Your contribution includes:", DE: "Dein Beitrag beinhaltet:",    FR: "Votre contribution comprend :" } as TS,
    item1:       { ES: "Material escolar y apoyo educativo.", EN: "School supplies and educational support.", DE: "Schulmaterial und Bildungsunterstützung.", FR: "Fournitures scolaires et soutien éducatif." } as TS,
    item2:       { ES: "Revisiones médicas periódicas.", EN: "Regular medical check-ups.", DE: "Regelmäßige Arztuntersuchungen.", FR: "Bilans médicaux réguliers." } as TS,
    item3:       { ES: "Apoyo nutricional.",        EN: "Nutritional support.",        DE: "Ernährungsunterstützung.",       FR: "Soutien nutritionnel." } as TS,
    item4:       { ES: "Actividades recreativas y de integración.", EN: "Recreational and integration activities.", DE: "Freizeit- und Integrationsaktivitäten.", FR: "Activités récréatives et d'intégration." } as TS,
    cta:         { ES: "Quiero apadrinar ahora",   EN: "I want to sponsor now",       DE: "Jetzt Pate werden",              FR: "Je veux parrainer maintenant" } as TS,
    loginRequired:{ ES: "Inicia sesión para continuar", EN: "Sign in to continue",    DE: "Anmelden um fortzufahren",       FR: "Connectez-vous pour continuer" } as TS,
    loginRequiredDesc:{ ES: "Debes tener una cuenta para enviar una solicitud de apadrinamiento.", EN: "You must have an account to submit a sponsorship request.", DE: "Du musst ein Konto haben, um eine Patenschaftsanfrage zu stellen.", FR: "Vous devez avoir un compte pour soumettre une demande de parrainage." } as TS,
    goToLogin:   { ES: "Ir a iniciar sesión",      EN: "Go to sign in",               DE: "Zum Anmelden",                   FR: "Aller se connecter" } as TS,
    formTitle:   { ES: "Formulario de Apadrinamiento", EN: "Sponsorship Form",        DE: "Patenschaftsformular",           FR: "Formulaire de Parrainage" } as TS,
    formDesc:    { ES: "Responde las preguntas para que podamos ponernos en contacto contigo.", EN: "Answer the questions so we can get in touch with you.", DE: "Beantworte die Fragen, damit wir uns mit dir in Verbindung setzen können.", FR: "Répondez aux questions pour que nous puissions vous contacter." } as TS,
    shareInfo:   { ES: "Al enviar este formulario, aceptas compartir tu información de usuario (nombre y correo electrónico) con el equipo de administración.", EN: "By submitting this form, you agree to share your user information (name and email) with the admin team.", DE: "Durch das Absenden dieses Formulars stimmst du zu, deine Benutzerinformationen (Name und E-Mail) mit dem Admin-Team zu teilen.", FR: "En soumettant ce formulaire, vous acceptez de partager vos informations utilisateur (nom et e-mail) avec l'équipe d'administration." } as TS,
    submit:      { ES: "Enviar solicitud",         EN: "Submit application",          DE: "Bewerbung absenden",             FR: "Soumettre la demande" } as TS,
    submitting:  { ES: "Enviando...",              EN: "Submitting...",               DE: "Senden...",                      FR: "Envoi..." } as TS,
    successTitle:{ ES: "¡Solicitud enviada!",      EN: "Application submitted!",      DE: "Bewerbung gesendet!",            FR: "Demande envoyée !" } as TS,
    successDesc: { ES: "El equipo revisará tu solicitud y se pondrá en contacto contigo pronto.", EN: "The team will review your application and contact you soon.", DE: "Das Team wird deine Bewerbung prüfen und sich bald melden.", FR: "L'équipe examinera votre demande et vous contactera bientôt." } as TS,
    close:       { ES: "Cerrar",                  EN: "Close",                       DE: "Schließen",                      FR: "Fermer" } as TS,
    cancel:      { ES: "Cancelar",                EN: "Cancel",                      DE: "Abbrechen",                      FR: "Annuler" } as TS,
    yourInfo:    { ES: "Tu información de usuario:", EN: "Your user information:",    DE: "Deine Benutzerinformationen:",   FR: "Vos informations utilisateur :" } as TS,
    noFields:    { ES: "El equipo configurará pronto el formulario. Vuelve a intentarlo más tarde.", EN: "The team will configure the form soon. Please try again later.", DE: "Das Team konfiguriert das Formular bald. Bitte versuche es später erneut.", FR: "L'équipe configurera bientôt le formulaire. Veuillez réessayer plus tard." } as TS,
    requiredField:{ ES: "Este campo es obligatorio", EN: "This field is required",   DE: "Dieses Feld ist erforderlich",   FR: "Ce champ est obligatoire" } as TS,
  },
};

export function t(ts: TS, lang: Lang): string {
  return ts[lang] || ts.ES || "";
}

export function useT() {
  const { lang } = useLanguage();
  return (ts: TS) => t(ts, lang);
}
