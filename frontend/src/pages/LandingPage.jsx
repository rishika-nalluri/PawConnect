import React from 'react'
import {
  ShieldCheck,
  Heart,
  Sparkles,
  Stethoscope,
  ArrowRight,
  Coins,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  Award,
  Users,
  PawPrint
} from 'lucide-react'
import { store } from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export const LandingPage = ({ setCurrentTab, setIsChatOpen }) => {
  const products = store.getProducts().slice(0, 4)
  const campaigns = store.getCampaigns()
  const vets = store.getVets()
  const { addToCart } = useCart()
  const { loginAsRole, isLoggedIn, currentRole } = useAuth()

  const categories = [
    { name: "Food & Nutrition", icon: "🍖", count: "48 Items" },
    { name: "Treats & Chews", icon: "🦴", count: "32 Items" },
    { name: "Supplements & Health", icon: "💊", count: "24 Items" },
    { name: "Grooming & Hygiene", icon: "🧴", count: "19 Items" },
    { name: "Toys & Training", icon: "🎾", count: "27 Items" },
    { name: "Accessories & Beds", icon: "🛏️", count: "15 Items" },
  ]

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Section (Two-Column with Real Lifestyle Imagery) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-teal-surface/60 via-brand-bg to-brand-bg pt-12 pb-20 border-b border-brand-teal/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal-dark text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-brand-amber fill-brand-amber" />
                  <span>Next-Gen Canine Welfare Ecosystem</span>
                </div>
                {/* 1 PawCoin = 1 Meal in SMALL font as requested by user */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-800">
                  <Coins className="w-3 h-3 text-brand-amber fill-brand-amber" />
                  <span>1 PawCoin = ₹1 street dog meal fund</span>
                </div>
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-brand-teal-dark tracking-tight leading-[1.15]">
                Better care for your dog. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-amber to-brand-coral">
                  Real meals for street dogs.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-brand-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Connect your pet's health records with verified veterinarians, screen symptoms with AI in seconds, and turn preventative care into life-saving meals for street dogs through <strong>PawCoins</strong>.
              </p>

              {/* Role-Specific CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => {
                    if (!isLoggedIn || currentRole !== 'PET_PARENT') {
                      loginAsRole('PET_PARENT')
                    }
                    setCurrentTab('dashboard')
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-teal to-brand-teal-dark hover:from-brand-teal-dark hover:to-brand-teal text-white font-heading font-bold text-sm shadow-soft hover:shadow-hover hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                >
                  <PawPrint className="w-4 h-4 text-brand-amber-light" />
                  <span>Dog Parent Hub</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    if (!isLoggedIn || currentRole !== 'VET') {
                      loginAsRole('VET')
                    }
                    setCurrentTab('dashboard')
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border-2 border-brand-amber/30 text-brand-amber-dark hover:border-brand-amber hover:bg-brand-amber-surface font-heading font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 group"
                >
                  <Stethoscope className="w-4 h-4 text-brand-amber" />
                  <span>Veterinarian Portal</span>
                </button>

                <button
                  onClick={() => setCurrentTab('store')}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-heading font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-brand-teal" />
                  <span>Pet Store</span>
                </button>
              </div>

              {/* Stat Strip */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-teal/10 text-center lg:text-left">
                <div>
                  <p className="font-heading font-black text-2xl text-brand-teal-dark">14,200+</p>
                  <p className="text-xs text-brand-muted">Street Meals Funded</p>
                </div>
                <div>
                  <p className="font-heading font-black text-2xl text-brand-amber-dark">100%</p>
                  <p className="text-xs text-brand-muted">VCI Verified Vets</p>
                </div>
                <div>
                  <p className="font-heading font-black text-2xl text-brand-coral">1.2s</p>
                  <p className="text-xs text-brand-muted">AI Triage Speed</p>
                </div>
              </div>

            </div>

            {/* Right Column: Dynamic Visual Card Stack */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Hero Photo */}
                <div className="relative rounded-3xl overflow-hidden shadow-premium border-4 border-white aspect-[4/3] sm:aspect-[1/1]">
                  <img
                    src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1000&q=80"
                    alt="Canine Welfare Care"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                    <div className="text-white">
                      <span className="px-2.5 py-1 bg-brand-coral text-white text-[11px] font-bold rounded-full uppercase tracking-wider">
                        Active Rescue Drive
                      </span>
                      <h3 className="font-heading font-bold text-lg mt-1">PawsCare Hyderabad Street Dog Rescue Drive</h3>
                    </div>
                  </div>
                </div>

                {/* Floating Card: AI Symptom Screening Badge */}
                <div className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-soft border border-brand-teal/15 hidden sm:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-teal-surface text-brand-teal flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-brand-teal-dark">AI Symptom Screener</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-[11px] text-gray-500">Groq LLM + Clinical Risk Triage</p>
                  </div>
                </div>

                {/* Floating Card: PawCoins Reward */}
                <div className="absolute -bottom-6 -right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-soft border border-brand-amber/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-amber-surface text-brand-amber flex items-center justify-center">
                    <Coins className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-brand-amber-dark">+100 PawCoins</p>
                    <p className="text-[11px] text-gray-500">Awarded for Vaccine Record</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Horizontal Rounded-Icon Category Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-bold text-2xl text-brand-teal-dark">Curated Wellness Categories</h2>
            <p className="text-xs text-brand-muted">Every product verified by clinical nutrition standards</p>
          </div>
          <button
            onClick={() => setCurrentTab('store')}
            className="text-xs font-bold text-brand-teal hover:text-brand-teal-dark flex items-center gap-1 group"
          >
            <span>Browse Full Store</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentTab('store')}
              className="p-5 rounded-2xl bg-white border border-gray-100 hover:border-brand-teal/30 hover:shadow-soft transition-all text-center group flex flex-col items-center justify-center space-y-2"
            >
              <div className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</div>
              <h4 className="font-heading font-bold text-xs text-brand-teal-dark group-hover:text-brand-teal">{cat.name}</h4>
              <span className="text-[10px] text-brand-muted">{cat.count}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. The 3 Pillars of PawConnect */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-teal-dark text-white rounded-3xl p-8 sm:p-12 shadow-premium relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-amber-light">Closed-Loop Ecosystem</span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-1">
              How PawConnect Protects Dogs
            </h2>
            <p className="text-sm text-white/80 mt-2">
              A synchronized platform where pet wellness drives street-dog welfare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-teal text-white flex items-center justify-center text-brand-amber-light">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">1. AI Health Screening</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Log stool consistency, appetite, and energy. Our machine learning classifier + Groq LLM identifies danger levels and guides you before mild issues escalate.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-teal text-white flex items-center justify-center text-brand-surface">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">2. Consent-Gated Vet Records</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                You own your pet's medical history. Grant and revoke digital access to vetted veterinarians for appointments, digital prescriptions, and continuous care.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-teal text-white flex items-center justify-center text-brand-coral-light">
                <Coins className="w-6 h-6 text-brand-amber fill-brand-amber" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">3. PawCoins Welfare Fund</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Earn coins whenever you record vaccines or log symptoms. Use them for store discounts or donate 1:1 to verified NGO campaigns to feed hungry street dogs.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Featured Store Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading font-extrabold text-2xl text-brand-teal-dark">Recommended Wellness Essentials</h2>
            <p className="text-xs text-brand-muted">Coin-eligible items with instant checkout discounts</p>
          </div>
          <button
            onClick={() => setCurrentTab('store')}
            className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl p-4 border border-gray-100 hover:border-brand-teal/20 hover:shadow-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative rounded-2xl overflow-hidden aspect-square bg-gray-50 mb-3">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.coinEligible && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-brand-amber text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <Coins className="w-3 h-3 fill-current" /> Save ₹{product.maxCoinsAllowed}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">{product.category}</span>
                <h3 className="font-heading font-bold text-sm text-brand-teal-dark line-clamp-2 mt-1">{product.name}</h3>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400">Price</span>
                  <p className="font-heading font-extrabold text-base text-brand-text">₹{product.price}</p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="p-2.5 rounded-xl bg-brand-teal text-white hover:bg-brand-teal-dark transition-all shadow-sm"
                  title="Add to Cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Split Promo-Banner Pair */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Banner 1: NGO Street Welfare */}
          <div className="rounded-3xl p-8 bg-gradient-to-br from-brand-coral-surface to-white border border-brand-coral/20 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="px-3 py-1 bg-brand-coral text-white text-[10px] font-extrabold uppercase rounded-full">
                Street Dog Welfare
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-brand-coral-dark">
                Winter Nutrition Drive: 500 Daily Meals
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Partnering with PawsCare Society to provide warm, protein-rich broths for street dogs across Hyderabad. Donate directly in cash or redeem your earned PawCoins.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setCurrentTab('campaigns')}
                className="px-5 py-3 rounded-xl bg-brand-coral hover:bg-brand-coral-dark text-white font-bold text-xs transition-all shadow-sm"
              >
                Support Campaign With PawCoins
              </button>
            </div>
          </div>

          {/* Banner 2: Verified Veterinary Network */}
          <div className="rounded-3xl p-8 bg-gradient-to-br from-brand-teal-surface to-white border border-brand-teal/20 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="px-3 py-1 bg-brand-teal text-white text-[10px] font-extrabold uppercase rounded-full">
                For Veterinary Clinics
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-brand-teal-dark">
                Join the Verified Vet Network
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Connect with conscientious pet parents, review longitudinal health logs, issue digital prescriptions, and accept online appointment bookings.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => {
                  loginAsRole('VET')
                  setCurrentTab('dashboard')
                }}
                className="px-5 py-3 rounded-xl bg-brand-teal hover:bg-brand-teal-dark text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Explore Veterinarian Portal →</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 6. AI Assistant Floating Prompt */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-white border border-brand-teal/15 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-teal-surface text-brand-teal flex items-center justify-center shrink-0">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-brand-teal-dark">Have a Canine Care Question?</h3>
              <p className="text-xs text-brand-muted">Ask our AI Assistant about nutrition, vaccine boosters, or behavior anytime.</p>
            </div>
          </div>
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-brand-teal hover:bg-brand-teal-dark text-white font-heading font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-brand-amber-light" />
            <span>Chat with AI Assistant</span>
          </button>
        </div>
      </section>

    </div>
  )
}
