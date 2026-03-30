import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, translations, Translations } from "@/lib/translations";

interface LanguageContextValue {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
  isArabic: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return (localStorage.getItem("bahar_lang") as Lang) || "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    localStorage.setItem("bahar_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => setLang(prev => prev === "en" ? "ar" : "en");

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLang, isArabic: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
