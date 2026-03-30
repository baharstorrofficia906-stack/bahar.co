import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, User, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { useLikedProducts } from "@/hooks/use-liked-products";
import { useLanguage } from "@/hooks/use-language";
import { useAdminMe } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { likedIds } = useLikedProducts();
  const { t, lang, toggleLang, isArabic } = useLanguage();
  const { data: adminInfo } = useAdminMe({ query: { retry: false } });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.products, href: "/products" },
    { name: t.nav.offers, href: "/offers", special: true },
    { name: t.nav.about, href: "/about" },
    { name: t.nav.contact, href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-center group">
            <span className="font-serif text-3xl font-bold text-secondary tracking-wider group-hover:text-primary transition-colors">
              BAHAR
            </span>
            <span className="arabic-text text-xs text-primary/80 -mt-1 font-medium tracking-widest">
              بـــهـــار
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  location === link.href
                    ? "text-primary border-b-2 border-primary"
                    : "text-secondary/80 hover:text-primary"
                } ${link.special ? "gold-gradient-text font-bold" : ""}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-5">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="hidden sm:flex items-center gap-1 text-xs font-bold uppercase tracking-wider border border-secondary/30 text-secondary px-3 py-1.5 rounded-full hover:bg-secondary hover:text-white transition-colors"
              title={isArabic ? "Switch to English" : "التبديل إلى العربية"}
            >
              {isArabic ? "EN" : "ع"}
            </button>

            {adminInfo?.authenticated && (
              <Link href="/admin/dashboard" className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-secondary text-white px-3 py-1.5 rounded-full hover:bg-primary transition-colors">
                <User size={14} />
                {t.nav.admin}
              </Link>
            )}

            <Link href="/liked" className="relative group p-2">
              <Heart className={`w-6 h-6 transition-colors ${likedIds.length > 0 ? "text-red-500 fill-red-500" : "text-secondary group-hover:text-red-400"}`} />
              {likedIds.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-background shadow-sm">
                  {likedIds.length}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative group p-2">
              <ShoppingBag className="w-6 h-6 text-secondary group-hover:text-primary transition-colors" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-background shadow-sm transform group-hover:scale-110 transition-transform">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              className="md:hidden text-secondary p-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 20 }}
            className="fixed inset-0 z-50 bg-background md:hidden flex flex-col"
          >
            <div className="flex justify-end p-6">
              <button onClick={() => setMobileMenuOpen(false)} className="text-secondary p-2">
                <X className="w-8 h-8" />
              </button>
            </div>
            <nav className="flex flex-col items-center justify-center flex-1 space-y-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-2xl font-serif tracking-wide ${
                    location === link.href ? "text-primary" : "text-secondary"
                  } ${link.special ? "gold-gradient-text font-bold" : ""}`}
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={() => { toggleLang(); setMobileMenuOpen(false); }}
                className="text-lg font-bold border border-secondary/40 text-secondary px-8 py-3 rounded-full hover:bg-secondary hover:text-white transition-colors"
              >
                {isArabic ? "Switch to English" : "التبديل للعربية"}
              </button>
              {adminInfo?.authenticated && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-white bg-secondary px-8 py-3 rounded-full"
                >
                  {t.nav.admin}
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
