import { loadProfile } from '../lib/profile'
import React, { useState } from 'react'
import { X, PawPrint, Stethoscope, Heart, Lock, Mail, User, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginWithSupabase, signUpWithSupabase, loginAsRole, switchRole, authModalRole, isSupabaseConfigured } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [role, setRole] = useState(authModalRole || 'PET_PARENT')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  
  // Extra fields for Vet / NGO
  const [licenseNumber, setLicenseNumber] = useState('')
  const [councilRegNo, setCouncilRegNo] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [ngoRegNo, setNgoRegNo] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!isAuthModalOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (isSignUp) {
        const extraMeta = {
          ...(role === 'VET' && { license_number: licenseNumber, council_registration_no: councilRegNo, specialization, clinic_name: clinicName }),
          ...(role === 'NGO' && { org_name: orgName, registration_number: ngoRegNo })
        }
        await signUpWithSupabase(email, password, fullName, role, extraMeta)
        setSuccessMsg("Account created successfully! Check your email to confirm registration or sign in.")
                await loginWithSupabase(email, password)
        setSuccessMsg("Signed in successfully!")
        loginAsRole((await loadProfile()).role)
        setTimeout(() => setIsAuthModalOpen(false), 500)
      }
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 relative border border-brand-teal/20 overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-teal-surface text-brand-teal mx-auto flex items-center justify-center mb-2">
            <PawPrint className="w-6 h-6 text-brand-amber fill-brand-amber" />
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-brand-teal-dark">
            {isSignUp ? "Join PawConnect" : "Welcome Back"}
          </h3>
          <p className="text-xs text-brand-muted mt-1">
            {isSignUp ? "Select your role to register your verified canine profile" : "Log in to manage health records and welfare campaigns"}
          </p>
          {!isSupabaseConfigured && (
            <div className="mt-2 text-[11px] bg-brand-amber-surface text-brand-amber-dark p-2 rounded-xl border border-brand-amber/30">
              ⚡ Local Mock Mode active. You can log in or switch views instantly.
            </div>
          )}
        </div>

        {/* Role Selector (on Sign Up) */}
        {isSignUp && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-brand-teal-dark mb-1.5 uppercase tracking-wider">Select Your Role</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('PET_PARENT')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  role === 'PET_PARENT' ? 'border-brand-teal bg-brand-teal-surface text-brand-teal font-bold' : 'border-gray-200 text-gray-500'
                }`}
              >
                <PawPrint className="w-4 h-4" />
                <span className="text-[11px]">Pet Parent</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('VET')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  role === 'VET' ? 'border-brand-teal bg-brand-teal-surface text-brand-teal font-bold' : 'border-gray-200 text-gray-500'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span className="text-[11px]">Veterinarian</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('NGO')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  role === 'NGO' ? 'border-brand-teal bg-brand-teal-surface text-brand-teal font-bold' : 'border-gray-200 text-gray-500'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span className="text-[11px]">NGO Charity</span>
              </button>
            </div>
          </div>
        )}

        {/* Error / Success notices */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">Full Name / Primary Contact</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Anika Rao"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-teal"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@pawconnect.org"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-teal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-teal"
              />
            </div>
          </div>

          {/* Conditional Role Details */}
          {isSignUp && role === 'VET' && (
            <div className="p-3 bg-brand-bg rounded-xl space-y-2 border border-brand-teal/20">
              <p className="text-[11px] font-bold text-brand-teal-dark flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5" /> Veterinary Credentials
              </p>
              <input
                type="text"
                required
                placeholder="VCI License Number (e.g., VET-IN-2024-8841)"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
              />
              <input
                type="text"
                required
                placeholder="State Council Reg No (e.g. VCI/2018/4910)"
                value={councilRegNo}
                onChange={(e) => setCouncilRegNo(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
              />
              <input
                type="text"
                placeholder="Specialization (e.g., Gastroenterology)"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
              />
            </div>
          )}

          {isSignUp && role === 'NGO' && (
            <div className="p-3 bg-brand-bg rounded-xl space-y-2 border border-brand-coral/20">
              <p className="text-[11px] font-bold text-brand-coral flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> NGO Welfare Registration
              </p>
              <input
                type="text"
                required
                placeholder="NGO / Trust Legal Name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
              />
              <input
                type="text"
                required
                placeholder="Trust/Section 8 Reg Number"
                value={ngoRegNo}
                onChange={(e) => setNgoRegNo(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-teal hover:bg-brand-teal-dark text-white font-heading font-bold text-sm rounded-xl transition-all shadow-soft"
          >
            {loading ? "Processing..." : isSignUp ? "Create Verified Account" : "Sign In to PawConnect"}
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setErrorMsg('')
              setSuccessMsg('')
            }}
            className="text-xs text-brand-teal font-semibold hover:underline"
          >
            {isSignUp ? "Already have an account? Sign In" : "New to PawConnect? Create an account"}
          </button>
        </div>

        {/* Instant One-Click Role Logins */}
        {import.meta.env.DEV && (<div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider text-center mb-2">
            One-Click Portal Sign In
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                loginAsRole('PET_PARENT')
              }}
              className="p-2.5 bg-brand-teal-surface hover:bg-brand-teal hover:text-white text-brand-teal border border-brand-teal/20 rounded-xl font-bold text-center flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <PawPrint className="w-3.5 h-3.5" />
              <span>🐾 Dog Parent</span>
            </button>
            <button
              onClick={() => {
                loginAsRole('VET')
              }}
              className="p-2.5 bg-brand-amber-surface hover:bg-brand-amber hover:text-white text-brand-amber-dark border border-brand-amber/30 rounded-xl font-bold text-center flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>🩺 Veterinarian</span>
            </button>
          </div>
        </div>)}

      </div>
    </div>
  )
}
