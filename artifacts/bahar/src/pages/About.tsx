export default function About() {
  return (
    <div className="min-h-screen pt-28 pb-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="max-w-4xl mx-auto text-center mb-20">
          <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 block">Our Story</span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-secondary mb-8 leading-tight">
            Bringing the heart of <br/>Saudi Arabia to Egypt
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Bahar was born from a passion for the extraordinary. We traverse the vast landscapes of Saudi Arabia to handpick products that embody centuries of tradition, unparalleled quality, and ultimate luxury.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div className="order-2 md:order-1 relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              {/* aesthetic portrait placeholder */}
              {/* abstract elegant gold and navy fluid lines */}
              <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1364&auto=format&fit=crop" alt="Luxury abstract" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl -z-10"></div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="font-serif text-3xl font-bold text-secondary mb-6">Our Mission</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              To be the premier destination for authentic Saudi luxury in Egypt. We believe that true luxury lies in authenticity and craftsmanship. Every product in our collection tells a story of heritage, carefully preserved and elegantly presented.
            </p>
            <p className="text-muted-foreground leading-relaxed border-l-2 border-primary pl-4 py-2">
              From the finest Ajwa dates of Medina to the rarest Oud from royal perfumeries, Bahar is your bridge to Arabian excellence.
            </p>
          </div>
        </div>

        <div className="bg-secondary text-white rounded-3xl p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
             <img src={`${import.meta.env.BASE_URL}images/pattern.png`} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="font-serif text-4xl font-bold mb-6">The Bahar Standard</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
              <div>
                <h4 className="font-bold text-primary text-xl mb-3">Sourcing</h4>
                <p className="text-white/70 text-sm leading-relaxed">Direct relationships with esteemed Saudi producers and artisans.</p>
              </div>
              <div>
                <h4 className="font-bold text-primary text-xl mb-3">Quality</h4>
                <p className="text-white/70 text-sm leading-relaxed">Rigorous selection process ensuring only the absolute best reaches you.</p>
              </div>
              <div>
                <h4 className="font-bold text-primary text-xl mb-3">Experience</h4>
                <p className="text-white/70 text-sm leading-relaxed">White-glove customer service and premium packaging for every order.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
