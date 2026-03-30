import { Link } from "wouter";
import { Facebook, Instagram, Mail, MapPin, Phone, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8 border-t-4 border-primary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex flex-col items-start group mb-6">
              <span className="font-serif text-4xl font-bold text-white tracking-wider">BAHAR</span>
              <span className="arabic-text text-lg text-primary mt-1 font-medium tracking-widest">بـــهـــار</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              Bringing the authentic essence and luxury of exclusive Saudi products directly to Egypt. Quality you can trust, elegance you deserve.
            </p>
            <div className="flex flex-wrap gap-3">
              {/* Facebook */}
              <a href="https://www.facebook.com/profile.php?id=61586220650609" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-secondary transition-all" title="Facebook">
                <Facebook size={18} />
              </a>
              {/* Instagram */}
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-secondary transition-all" title="Instagram">
                <Instagram size={18} />
              </a>
              {/* TikTok */}
              <a href="https://www.tiktok.com/@bahar.lifestyle5" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-secondary transition-all" title="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.26 8.26 0 0 0 4.83 1.55V6.79a4.85 4.85 0 0 1-1.06-.1z"/>
                </svg>
              </a>
              {/* Snapchat */}
              <a href="https://snapchat.com/t/RTYyzD95" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-secondary transition-all" title="Snapchat">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.17 2C9.21 2 7.09 3.67 6.33 6.26c-.13.47-.17.97-.17 1.47v.65c-.39.17-.84.28-1.4.28-.41 0-.75-.07-.97-.13l-.14-.04-.14.08c-.07.04-.13.1-.17.18-.04.08-.04.17-.02.25.13.53.69.92 1.69 1.17.06.02.12.03.18.04-.05.17-.09.35-.14.53-.42 1.43-1.15 2.46-2.2 3.08-.27.16-.41.46-.35.76.06.3.31.52.61.57.95.15 1.86.57 2.39.97.17.13.2.28.12.52-.18.56-.57 1.04-1.08 1.38-.16.1-.2.31-.1.47.09.15.27.21.43.14.53-.22 1.03-.34 1.49-.34.35 0 .68.05 1 .15.7.23 1.28.69 1.97 1.15.78.51 1.63.76 2.48.76s1.7-.25 2.48-.76c.69-.46 1.27-.92 1.97-1.15.32-.1.65-.15 1-.15.46 0 .96.12 1.49.34.16.07.34.01.43-.14.1-.16.06-.37-.1-.47-.51-.34-.9-.82-1.08-1.38-.08-.24-.05-.39.12-.52.53-.4 1.44-.82 2.39-.97.3-.05.55-.27.61-.57.06-.3-.08-.6-.35-.76-1.05-.62-1.78-1.65-2.2-3.08-.05-.18-.09-.36-.14-.53.06-.01.12-.02.18-.04 1-.25 1.56-.64 1.69-1.17.02-.08.02-.17-.02-.25-.04-.08-.1-.14-.17-.18l-.14-.08-.14.04c-.22.06-.56.13-.97.13-.56 0-1.01-.11-1.4-.28v-.65c0-.5-.04-1-.17-1.47C17.09 3.67 14.97 2 12 2h.17z"/>
                </svg>
              </a>
              {/* WhatsApp Group */}
              <a href="https://chat.whatsapp.com/JnLj1EI6UcSCgkyddAZUrK" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#25D366] transition-all" title="WhatsApp Group">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-white mb-6 font-semibold">Explore</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">Home</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors text-sm">Shop All Products</Link></li>
              <li><Link href="/offers" className="text-primary font-medium hover:text-white transition-colors text-sm">Exclusive Deals</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">Our Story</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif text-lg text-white mb-6 font-semibold">Customer Care</h4>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact Us</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Shipping & Returns</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">FAQs</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</a></li>
              <li>
                <Link href="/admin" className="text-muted-foreground/40 hover:text-primary/60 transition-colors text-xs">
                  Admin Sign-In
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg text-white mb-6 font-semibold">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Cairo, Egypt<br />(Online Store Only)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+201120027304" className="hover:text-primary transition-colors">🇪🇬 01120027304</a>
                  <a href="tel:+966534610659" className="hover:text-primary transition-colors">🇸🇦 +966 53 461 0659</a>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:baharstoree63@gmail.com" className="hover:text-primary transition-colors">
                  baharstoree63@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Bahar Premium Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
