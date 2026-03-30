import { useState } from "react";
import { Mail, MapPin, Send, CheckCircle } from "lucide-react";
import { useCreateMessage } from "@workspace/api-client-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const createMessage = useCreateMessage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    createMessage.mutate(
      { name: form.name, email: form.email, subject: form.subject, message: form.message },
      {
        onSuccess: () => {
          setSent(true);
          setForm({ name: "", email: "", subject: "", message: "" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen pt-28 pb-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-secondary mb-4">Get in Touch</h1>
          <p className="text-muted-foreground">Our team is available to assist you with any inquiries regarding our products, your orders, or special requests.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-secondary mb-2">Email Us</h3>
              <p className="text-muted-foreground text-sm mb-4">We'll respond within 24 hours.</p>
              <a href="mailto:baharstoree63@gmail.com" className="text-base font-semibold text-secondary hover:text-primary transition-colors break-all">
                baharstoree63@gmail.com
              </a>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-secondary mb-2">Location</h3>
              <p className="text-muted-foreground text-sm">Cairo, Egypt<br/>We operate exclusively online to serve all of Egypt.</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-secondary/5 border border-border/50">
            <h2 className="font-serif text-3xl font-bold text-secondary mb-8">Send a Message</h2>
            
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h3 className="font-serif text-2xl font-bold text-secondary">Message Sent!</h3>
                <p className="text-muted-foreground">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 btn-luxury px-8 py-3 text-sm tracking-widest"
                >
                  SEND ANOTHER
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="How can we help?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary">Message *</label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                    placeholder="Your message here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={createMessage.isPending}
                  className="btn-luxury w-full py-4 flex items-center justify-center gap-2 text-sm tracking-widest mt-4 disabled:opacity-50"
                >
                  {createMessage.isPending ? "SENDING..." : "SEND MESSAGE"}
                  <Send className="w-4 h-4" />
                </button>

                {createMessage.isError && (
                  <p className="text-red-500 text-sm text-center">Failed to send message. Please try again.</p>
                )}
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
