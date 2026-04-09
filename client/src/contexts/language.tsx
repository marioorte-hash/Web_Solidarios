import { createContext, useContext, useState, useEffect } from "react";

export type Lang = "ES" | "EN" | "DE";

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
  lang: Lang
): string {
  if (lang === "EN" && en) return en;
  if (lang === "DE" && de) return de;
  return es || "";
}
