import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { PromoBar } from './components/PromoBar'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { CartDrawer } from './components/CartDrawer'
import { AIChatModal } from './components/AIChatModal'
import { AuthModal } from './components/AuthModal'

import { LandingPage } from './pages/LandingPage'
import { StorePage } from './pages/StorePage'
import { CampaignsPage } from './pages/CampaignsPage'
import { EventsPage } from './pages/EventsPage'
import { PetParentDashboard } from './pages/PetParentDashboard'
import { VetDashboard } from './pages/VetDashboard'
import { NGODashboard } from './pages/NGODashboard'
import TeleConsultPage from './pages/TeleConsultPage'
import AdminPage from './pages/AdminPage'
import { PawPrint, Stethoscope, ArrowRight, Lock, ShieldCheck, Heart, Sparkles, CheckCircle } from 'lucide-react'

// Dedicated Login Required view when unauthenticated visitor navigates to dashboard
const LoginRequiredView = ({ onLoginAsParent, onLoginAsVet, onOpenModal, onBackHome }) => {
  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-brand-bg via-white to-brand-bg py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-teal-surface text-brand-teal text-xs font-bold border border-brand-teal/20">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Role-Gated Access</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-brand-teal-dark tracking-tight">
            Please Sign In to Access Your Portal
          </h1>
          <p className="text-sm sm:text-base text-brand-muted max-w-xl mx-auto">
            PawConnect provides isolated dashboards. Dog Parents only access their pet health hub, and licensed Veterinarians only access clinical patient care.
          </p>
        </div>

        {/* Two Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-4">
          
          {/* Dog Parent Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border-2 border-brand-teal/15 hover:border-brand-teal transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
                  alt="Happy Golden Retriever Dog"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-brand-teal text-white text-[11px] font-bold rounded-full flex items-center gap-1 shadow-sm">
                  <PawPrint className="w-3 h-3" /> Dog Parent Portal
                </div>
              </div>

              <div>
                <h3 className="font-heading font-bold text-xl text-brand-teal-dark">Dog Parent Workspace</h3>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  Manage pet passports, log symptoms for AI gut screening, track vaccination schedules, and earn PawCoins for welfare meals.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-gray-600 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-teal" />
                  <span>AI Gut & Symptom Triage (Groq-assisted)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Sovereign Consent Control for Vet Sharing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-teal" />
                  <span>PawCoins Wallet (Earn on Vaccines & Care)</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              {import.meta.env.DEV && (<button
                onClick={onLoginAsParent}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-teal to-brand-teal-dark hover:from-brand-teal-dark hover:to-brand-teal text-white font-heading font-bold text-sm shadow-soft flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <PawPrint className="w-4 h-4 text-brand-amber-light" />
                <span>Log In as Dog Parent (Meera & Bruno)</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>)}
              <button
                onClick={() => onOpenModal('PET_PARENT')}
                className="w-full py-2 text-center text-xs font-semibold text-brand-teal hover:underline"
              >
                Sign in with Email / Register
              </button>
            </div>
          </div>

          {/* Veterinarian Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border-2 border-brand-amber/20 hover:border-brand-amber transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80"
                  alt="Veterinarian examining canine patient"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-brand-amber text-brand-amber-dark text-[11px] font-bold rounded-full flex items-center gap-1 shadow-sm">
                  <Stethoscope className="w-3 h-3" /> Clinical Vet Portal
                </div>
              </div>

              <div>
                <h3 className="font-heading font-bold text-xl text-brand-teal-dark">Veterinary Clinical Portal</h3>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  Access consent-gated canine medical histories, review diagnostic AI risk markers, issue digital prescriptions, and conduct teleconsults.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-gray-600 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-amber" />
                  <span>Consent-Gated Canine Health Dossiers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-amber" />
                  <span>Digital Prescription Generator & Audit Logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-amber" />
                  <span>Patient Queue & Telehealth Consultations</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 space-y-2">
              {import.meta.env.DEV && (<button
                onClick={onLoginAsVet}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-amber to-brand-amber-dark hover:from-brand-amber-dark hover:to-brand-amber text-white font-heading font-bold text-sm shadow-soft flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Stethoscope className="w-4 h-4 text-white" />
                <span>Log In as Veterinarian (Dr. Anika)</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>)}
              <button
                onClick={() => onOpenModal('VET')}
                className="w-full py-2 text-center text-xs font-semibold text-brand-amber-dark hover:underline"
              >
                Sign in with VCI License / Register
              </button>
            </div>
          </div>

        </div>

        {/* Back to Home Link */}
        <div className="text-center pt-2">
          <button
            onClick={onBackHome}
            className="text-xs font-semibold text-brand-muted hover:text-brand-teal transition-colors"
          >
            â† Return to PawConnect Home Page
          </button>
        </div>

      </div>
    </div>
  )
}

const MainContent = () => {
  const [currentTab, setCurrentTab] = useState('landing')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { currentRole, isLoggedIn, loginAsRole, setIsAuthModalOpen, setAuthModalRole } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      <PromoBar />
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        setIsChatOpen={setIsChatOpen}
      />

      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage setCurrentTab={setCurrentTab} setIsChatOpen={setIsChatOpen} />
        )}
        {currentTab === 'store' && <StorePage />}
        {currentTab === 'campaigns' && <CampaignsPage />}
                {currentTab === 'events' && <EventsPage />}
        {currentTab === 'telehealth' && <TeleConsultPage />}
        {currentTab === 'admin' && <AdminPage />}
        {currentTab === 'dashboard' && (
          <>
            {!isLoggedIn ? (
              <LoginRequiredView
                onLoginAsParent={() => loginAsRole('PET_PARENT')}
                onLoginAsVet={() => loginAsRole('VET')}
                onOpenModal={(role) => {
                  setAuthModalRole(role)
                  setIsAuthModalOpen(true)
                }}
                onBackHome={() => setCurrentTab('landing')}
              />
            ) : (
              <>
                {currentRole === 'PET_PARENT' && <PetParentDashboard setIsChatOpen={setIsChatOpen} />}
                {currentRole === 'VET' && <VetDashboard />}
                {currentRole === 'NGO' && <NGODashboard />}
              </>
            )}
          </>
        )}
      </main>

      <Footer setCurrentTab={setCurrentTab} />

      {/* Slide-over Cart & Modals */}
      <CartDrawer />
      <AIChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <AuthModal />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainContent />
      </CartProvider>
    </AuthProvider>
  )
}

export default App

