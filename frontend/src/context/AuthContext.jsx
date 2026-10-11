import React, { createContext, useContext, useState, useEffect } from 'react'
import { store } from '../api/client'
import { supabase, isSupabaseConfigured } from '../supabaseClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [profiles, setProfiles] = useState(store.getProfiles())
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentRole, setCurrentRole] = useState(null) // null | 'PET_PARENT' | 'VET' | 'NGO'
  const [supabaseUser, setSupabaseUser] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalRole, setAuthModalRole] = useState('PET_PARENT')

  // Listen to live Supabase session if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user)
        const role = session.user.user_metadata?.role || 'PET_PARENT'
        setCurrentRole(role)
        setIsLoggedIn(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user)
        const role = session.user.user_metadata?.role || 'PET_PARENT'
        setCurrentRole(role)
        setIsLoggedIn(true)
      } else {
        setSupabaseUser(null)
        setIsLoggedIn(false)
        setCurrentRole(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  const currentUser = currentRole === 'PET_PARENT'
    ? profiles.petParent
    : currentRole === 'VET'
    ? profiles.vet
    : currentRole === 'NGO'
    ? profiles.ngo
    : null

  const switchRole = (role) => {
    setCurrentRole(role)
    setIsLoggedIn(true)
  }

  const loginAsRole = (role) => {
    setCurrentRole(role)
    setIsLoggedIn(true)
    setIsAuthModalOpen(false)
  }

  const updateCoins = (amountDelta, source) => {
    if (currentRole !== 'PET_PARENT') return

    const updatedParent = {
      ...profiles.petParent,
      coinsBalance: Math.max(0, (profiles.petParent.coinsBalance || 0) + amountDelta)
    }
    const updatedProfiles = { ...profiles, petParent: updatedParent }
    setProfiles(updatedProfiles)
    store.saveProfiles(updatedProfiles)

    // Save transaction
    const txs = store.getCoinTransactions()
    const newTx = {
      id: `tx-${Date.now()}`,
      type: amountDelta >= 0 ? 'EARN' : 'REDEEM',
      amount: amountDelta,
      source: source || 'MANUAL',
      date: new Date().toISOString().split('T')[0]
    }
    const updatedTxs = [newTx, ...txs]
    store.saveCoinTransactions(updatedTxs)
  }

  const loginWithSupabase = async (email, password) => {
    if (!isSupabaseConfigured) {
      // Mock login fallback
      return { user: currentUser }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signUpWithSupabase = async (email, password, fullName, role, extraMetadata = {}) => {
    if (!isSupabaseConfigured) {
      setCurrentRole(role)
      return { user: { email, role, full_name: fullName } }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          ...extraMetadata
        }
      }
    })
    if (error) throw error
    return data
  }

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setSupabaseUser(null)
    setIsLoggedIn(false)
    setCurrentRole(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        currentRole,
        currentUser,
        loginAsRole,
        switchRole,
        updateCoins,
        supabaseUser,
        loginWithSupabase,
        signUpWithSupabase,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalRole,
        setAuthModalRole,
        isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
