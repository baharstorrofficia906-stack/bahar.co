import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Star, Shield, Truck, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useGetProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { useLanguage } from "@/hooks/use-language";
import { PlaneLoader } from "@/components/ui/PlaneLoader";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = useGetProducts(activeCategory ? { category: activeCategory } : {});
  const { t } = useLanguage();

  const categories = ["All", "Dates", "Coffee", "Perfumes", "Incense", "Gifts", "Electrical Devices", "Shoes", "Bags", "Abayas", "Ecoway"];

  const getCategoryLabel = (cat: string) => {
    if (cat === "All") return t.products.all;
    return (t.products.categoryLabels as Record<string, string>)[cat] ?? cat;
  };

  const filtered = search.trim()
    ? (products ?? []).filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.nameAr ?? "").includes(search) ||
        (p.category ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : (products ?? []);

  const features = [
    { icon: <Star className="w-6 h-6 text-primary" />, title: t.home.feature1Title, desc: t.home.feature1Desc },
    { icon: <Shield className="w-6 h-6 text-primary" />, title: t.home.feature2Title, desc: t.home.feature2Desc },
    { icon: <Truck className="w-6 h-6 text-primary" />, title: t.home.feature3Title, desc: t.home.feature3Desc },
  ];

  return (
    <div className="flex flex-col min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Bahar Luxury"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-transparent"></div>
        </div>

        {/* Floating ambient particles */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/40"
              style={{
                left: `${15 + i * 14}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [-12, 12, -12],
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        <div className="container relative z-10 px-4 md:px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.span
              className="inline-flex items-center gap-2 text-primary font-bold tracking-[0.2em] text-sm uppercase mb-6 px-4 py-1.5 border border-primary/30 rounded-full backdrop-blur-sm"
              animate={{ boxShadow: ["0 0 0px rgba(212,175,55,0)", "0 0 18px rgba(212,175,55,0.35)", "0 0 0px rgba(212,175,55,0)"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={13} />
              {t.home.badge}
              <Sparkles size={13} />
            </motion.span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="text-[#e8c97a]">{t.home.hero1}</span> <br />
            <span className="gold-gradient-text">{t.home.hero2}</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="#collection" className="btn-gold px-8 py-4 text-sm tracking-wider w-full sm:w-auto flex justify-center">
              {t.home.explore}
            </a>
            <Link href="/offers" className="px-8 py-4 text-sm font-bold tracking-wider text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all w-full sm:w-auto flex justify-center backdrop-blur-sm">
              {t.home.viewOffers}
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/30 rounded-full" />
        </motion.div>
      </section>

      {/* Features Ribbon */}
      <section className="bg-primary/10 py-12 border-b border-primary/20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-primary/20"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="flex flex-col items-center text-center px-4 pt-6 md:pt-0 first:pt-0"
              >
                <motion.div
                  whileHover={{ scale: 1.12, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 cursor-default"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="font-serif font-bold text-secondary text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Full Collection */}
      <section id="collection" className="py-24 bg-background relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-secondary/5 -z-10"></div>

        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <motion.span variants={fadeUp} className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">
              {t.home.curatedSelection}
            </motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold text-secondary mb-4">
              {t.home.featuredTitle}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">
              Explore our curated selection of premium Saudi products, imported directly to ensure the highest quality and authenticity.
            </motion.p>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-card p-4 rounded-2xl shadow-sm border border-border/50"
          >
            <div className="flex overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar gap-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat === "All" ? null : cat)}
                  whileTap={{ scale: 0.94 }}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    (activeCategory === cat || (cat === "All" && !activeCategory))
                      ? "bg-secondary text-white shadow-md"
                      : "bg-background text-secondary hover:bg-primary/10"
                  }`}
                >
                  {getCategoryLabel(cat)}
                </motion.button>
              ))}
            </div>

            <div className="flex w-full md:w-auto gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t.products.searchPlaceholder ?? "Search collection..."}
                  className="w-full bg-background border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
              <button className="p-2.5 bg-background rounded-full text-secondary hover:text-primary hover:bg-primary/10 transition-colors shrink-0">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Product Grid */}
          {isLoading ? (
            <PlaneLoader text="Loading products..." />
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white rounded-3xl border border-dashed border-border"
            >
              <h3 className="font-serif text-2xl text-secondary mb-2">{t.products.noProducts}</h3>
              <p className="text-muted-foreground">Try selecting a different category.</p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
            >
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  variants={fadeUp}
                  custom={i}
                  layout
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-24 bg-card relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="lg:w-1/2 relative"
            >
              <div className="aspect-[4/5] bg-secondary rounded-2xl overflow-hidden relative shadow-2xl">
                <img src="https://pixabay.com/get/gf9e8b21e954d99ba9678863ae734fc3a12eaa782d37adbf003452db1ae2d8216ca81df6f6b62edd55b4a5aec75e07fb1de515d4b2657b40113029b3e8236fc80_1280.jpg" alt="Saudi Coffee" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                <div className="absolute inset-0 border-2 border-primary/30 rounded-2xl m-4"></div>
              </div>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -right-8 w-48 h-48 bg-background rounded-full flex items-center justify-center shadow-lg p-6"
              >
                <p className="font-serif italic text-xl text-center text-secondary">"{t.home.authenticityQuote}"</p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="lg:w-1/2 lg:pl-8"
            >
              <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">{t.home.baharPromise}</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-secondary mb-6 leading-tight">{t.home.bridgingTitle}</h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                {t.home.bridgingP1}
              </p>
              <p className="arabic-text text-secondary/80 text-xl mb-10 leading-relaxed border-l-4 border-primary pl-4">
                نحن نؤمن بأن الجودة لا تعترف بالحدود. منتجاتنا مختارة بعناية فائقة لترضي ذوقكم الرفيع.
              </p>
              <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                <Link href="/about" className="btn-luxury px-8 py-4 inline-block text-sm tracking-wider">
                  {t.home.discoverStory}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
