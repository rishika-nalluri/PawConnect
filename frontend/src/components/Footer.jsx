import React from 'react'
import { PawPrint, Heart, ShieldCheck, Stethoscope, Sparkles, Send } from 'lucide-react'

export const Footer = ({ setCurrentTab }) => {
  return (
    <footer className="bg-brand-teal-dark text-white pt-16 pb-12 border-t border-brand-teal/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-white/10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="p-3 rounded-2xl bg-white/10 text-brand-amber-light">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-white">VCI Verified Veterinarians</h4>
              <p className="text-xs text-white/70">100% credentialed clinical practitioners</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="p-3 rounded-2xl bg-white/10 text-brand-coral-light">
              <Heart className="w-6 h-6 text-brand-coral" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-white">1:1 Welfare Redemptions</h4>
              <p className="text-xs text-white/70">Every PawCoin converted to dog meals</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="p-3 rounded-2xl bg-white/10 text-brand-amber">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-white">Groq AI Health Screening</h4>
              <p className="text-xs text-white/70">Sub-second early symptom triage</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="p-3 rounded-2xl bg-white/10 text-brand-surface">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-white">Consent-Gated Records</h4>
              <p className="text-xs text-white/70">Pet parents own & grant medical access</p>
            </div>
          </div>
        </div>

        {/* 4-Column Navigation Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-teal flex items-center justify-center text-white border border-white/20">
                <PawPrint className="w-6 h-6 text-brand-amber-light fill-current" />
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                Paw<span className="text-brand-amber">Connect</span>
              </span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed max-w-sm">
              The premier integrated canine welfare ecosystem. Bridging devoted pet parents, licensed veterinarians, and frontline animal welfare NGOs with AI screening and community-funded street dog care.
            </p>
            <div className="text-xs text-white/60">
              Built with Supabase Auth & RLS, Spring Boot 3, FastAPI Groq AI, and React 18.
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="font-heading font-bold text-sm text-brand-amber-light uppercase tracking-wider">Ecosystem</h5>
            <ul className="space-y-2 text-sm text-white/70">
              <li><button onClick={() => setCurrentTab('store')} className="hover:text-white transition-colors">Pet Wellness Store</button></li>
              <li><button onClick={() => setCurrentTab('campaigns')} className="hover:text-white transition-colors">NGO Welfare Drives</button></li>
              <li><button onClick={() => setCurrentTab('events')} className="hover:text-white transition-colors">Adoption & Vaccine Camps</button></li>
              <li><button onClick={() => setCurrentTab('dashboard')} className="hover:text-white transition-colors">Pet Parent Health Hub</button></li>
            </ul>
          </div>

          {/* For Professionals & NGOs */}
          <div className="space-y-3">
            <h5 className="font-heading font-bold text-sm text-brand-amber-light uppercase tracking-wider">Stakeholders</h5>
            <ul className="space-y-2 text-sm text-white/70">
              <li><button onClick={() => setCurrentTab('dashboard')} className="hover:text-white transition-colors">Veterinarian Portal</button></li>
              <li><button onClick={() => setCurrentTab('dashboard')} className="hover:text-white transition-colors">NGO Campaign Dashboard</button></li>
              <li><span className="text-white/40 cursor-not-allowed">Council License Verification</span></li>
              <li><span className="text-white/40 cursor-not-allowed">Donation Transparency Reports</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h5 className="font-heading font-bold text-sm text-brand-amber-light uppercase tracking-wider">Stay Connected</h5>
            <p className="text-xs text-white/70">Receive monthly canine health advisories and rescue campaign digests.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for joining PawConnect's canine community!"); }} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-brand-amber flex-1"
              />
              <button type="submit" className="bg-brand-amber hover:bg-brand-amber-dark text-white px-3 py-2 rounded-xl text-xs font-bold transition-all">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} PawConnect Canine Welfare Foundation. All rights reserved.</p>
          <p className="text-center md:text-right max-w-xl text-[11px] text-white/40">
            Disclaimer: AI-generated symptom screenings are for preliminary informational triage only and do not constitute professional veterinary diagnoses. In emergencies, consult a licensed clinician immediately.
          </p>
        </div>

      </div>
    </footer>
  )
}
