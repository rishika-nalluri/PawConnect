import React, { useState } from 'react'
import {
  PawPrint,
  ShoppingBag,
  Coins,
  User,
  Heart,
  Calendar,
  Stethoscope,
  Bot,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Lock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export const Navbar = ({ currentTab, setCurrentTab, setIsChatOpen }) => {
  const { currentRole, currentUser, isLoggedIn, loginAsRole, logout, setIsAuthModalOpen, setAuthModalRole } = useAuth()
  const { itemCount, setIsCartOpen } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    { key: 'landing', label: 'Home' },
    { key: 'store', label: 'Pet Store', badge: 'Rewards' },
    { key: 'campaigns', label: 'Welfare Campaigns' },
    { key: 'events', label: 'Community Events' },
    { key: 'telehealth', label: 'Online Vets & Triage', badge: 'Live 24/7' },
    ...(isLoggedIn && currentRole === 'PET_PARENT' ? [
      { key: 'dashboard', label: 'ðŸ¾ My Pet Hub', highlight: true }
    ] : isLoggedIn && currentRole === 'VET' ? [
      { key: 'dashboard', label: 'ðŸ©º Vet Clinic Portal', highlight: true }
    ] : [
      { key: 'dashboard', label: 'Access Portal', badge: 'Login' }
    ])
  ]

  const handleNavClick = (linkKey) => {
    setCurrentTab(linkKey)
    if (linkKey === 'dashboard' && !isLoggedIn) {
      // It will display the Login Required gate on dashboard
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-teal/10 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <button
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-teal to-brand-teal-dark flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <PawPrint className="w-6 h-6 text-brand-amber-light fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-heading font-extrabold text-2xl tracking-tight text-brand-teal-dark">Paw</span>
                <span className="font-heading font-extrabold text-2xl tracking-tight text-brand-amber">Connect</span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">Canine Welfare & Health Ecosystem</p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => handleNavClick(link.key)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                  currentTab === link.key
                    ? 'text-brand-teal-dark bg-brand-teal-surface font-bold shadow-xs'
                    : 'text-brand-text hover:text-brand-teal hover:bg-black/5'
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className={`ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    link.badge === 'Login' 
                      ? 'bg-brand-coral/15 text-brand-coral' 
                      : 'bg-brand-amber/15 text-brand-amber-dark'
                  }`}>
                    {link.badge}
                  </span>
                )}
                {link.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-coral animate-ping" />
                )}
              </button>
            ))}
          </nav>

          {/* Right Action Icons & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* AI Assistant Quick Launcher */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-brand-teal-surface text-brand-teal hover:bg-brand-teal hover:text-white transition-all shadow-sm"
              title="Open AI Canine Assistant"
            >
              <Bot className="w-4 h-4 text-brand-teal group-hover:text-white" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>

            {/* PawCoins Indicator (for Pet Parents ONLY) */}
            {isLoggedIn && currentRole === 'PET_PARENT' && currentUser && (
              <div
                onClick={() => setCurrentTab('dashboard')}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-amber-surface border border-brand-amber/30 text-brand-amber-dark font-heading font-bold text-xs shadow-sm hover:scale-105 transition-all"
                title="Your PawCoins Balance"
              >
                <Coins className="w-4 h-4 text-brand-amber fill-brand-amber" />
                <span>{currentUser.coinsBalance || 0}</span>
                <span className="hidden lg:inline text-[10px] font-semibold text-brand-amber">Coins</span>
              </div>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl text-brand-text hover:text-brand-teal hover:bg-brand-teal-surface transition-all"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-coral text-white text-[11px] font-bold flex items-center justify-center animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Authentication / Role Profile Section */}
            {isLoggedIn && currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-brand-teal/10 flex items-center justify-center border border-white shadow-xs">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-[10px] font-extrabold uppercase text-brand-teal tracking-wider leading-none">
                      {currentRole === 'PET_PARENT' ? 'ðŸ¾ Dog Parent' : currentRole === 'VET' ? 'ðŸ©º Verified Vet' : 'NGO'}
                    </p>
                    <p className="text-xs font-bold text-brand-text truncate max-w-[110px] leading-tight">
                      {currentUser.fullName?.split(' ')[0]}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout()
                    setCurrentTab('landing')
                  }}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => {
                    loginAsRole('PET_PARENT')
                    setCurrentTab('dashboard')
                  }}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-teal-surface text-brand-teal font-bold text-xs hover:bg-brand-teal hover:text-white transition-all shadow-xs"
                >
                  <PawPrint className="w-3.5 h-3.5" />
                  <span>Dog Parent</span>
                </button>

                <button
                  onClick={() => {
                    loginAsRole('VET')
                    setCurrentTab('dashboard')
                  }}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-amber-surface text-brand-amber-dark font-bold text-xs hover:bg-brand-amber hover:text-white transition-all shadow-xs"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Vet Portal</span>
                </button>

                <button
                  onClick={() => {
                    setAuthModalRole('PET_PARENT')
                    setIsAuthModalOpen(true)
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-teal-dark text-white font-bold text-xs shadow-soft hover:bg-brand-teal transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-brand-text hover:bg-black/5"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => {
                  setCurrentTab(link.key)
                  setIsMobileMenuOpen(false)
                }}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold ${
                  currentTab === link.key ? 'bg-brand-teal text-white' : 'text-brand-text hover:bg-gray-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

