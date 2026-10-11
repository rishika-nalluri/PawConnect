import React, { useState } from 'react'
import {
  Heart,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Users
} from 'lucide-react'
import { store } from '../api/client'
import { useAuth } from '../context/AuthContext'

export const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState(store.getCampaigns())
  const { currentUser, currentRole, updateCoins } = useAuth()

  const [activeModalCampaign, setActiveModalCampaign] = useState(null)
  const [donationType, setDonationType] = useState('COIN') // 'COIN' | 'CASH'
  const [amount, setAmount] = useState(50)
  const [donorNotes, setDonorNotes] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleDonate = (e) => {
    e.preventDefault()
    if (!activeModalCampaign) return

    const numAmount = Number(amount)
    if (numAmount <= 0) return

    if (donationType === 'COIN') {
      const userCoins = currentUser?.coinsBalance || 0
      if (numAmount > userCoins) {
        alert("You do not have enough PawCoins for this donation amount.")
        return
      }
      // Deduct coins from pet parent
      updateCoins(-numAmount, `DONATION_${activeModalCampaign.id}`)
    }

    // Update campaign progress in store
    const updated = campaigns.map(c => {
      if (c.id === activeModalCampaign.id) {
        return {
          ...c,
          achievedAmount: c.achievedAmount + numAmount,
          coinsCollected: donationType === 'COIN' ? c.coinsCollected + numAmount : c.coinsCollected
        }
      }
      return c
    })
    setCampaigns(updated)
    store.saveCampaigns(updated)

    setSuccessMsg(`Thank you! Successfully donated ${donationType === 'COIN' ? `${numAmount} PawCoins` : `₹${numAmount}`} to ${activeModalCampaign.title}!`)
    setTimeout(() => {
      setSuccessMsg('')
      setActiveModalCampaign(null)
    }, 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand-coral-dark via-brand-coral to-brand-amber text-white rounded-3xl p-8 sm:p-12 shadow-premium relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-white/90 bg-white/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-current text-white" /> Community Street Dog Welfare
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            100% Transparent Canine Welfare Campaigns
          </h1>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Every PawCoin you earn through responsible pet healthcare can be converted directly into meals, emergency medical aid, and winter shelter for street dogs. 1 Coin = ₹1 Meal Fund.
          </p>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {campaigns.map((camp) => {
          const percent = Math.min(100, Math.round((camp.achievedAmount / camp.targetAmount) * 100))
          return (
            <div
              key={camp.id}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-brand-coral/30 hover:shadow-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={camp.photoUrl}
                    alt={camp.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-coral text-white text-[10px] font-extrabold uppercase shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified NGO Cause
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <p className="text-[11px] font-bold uppercase text-brand-coral tracking-wider">{camp.ngoName}</p>
                  <h3 className="font-heading font-bold text-xl text-brand-teal-dark">{camp.title}</h3>
                  <p className="text-xs text-brand-muted leading-relaxed">{camp.description}</p>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-brand-teal-dark">Raised: ₹{camp.achievedAmount.toLocaleString()}</span>
                      <span className="text-gray-400">Target: ₹{camp.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-amber to-brand-coral rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-brand-muted">
                      <span>{percent}% Funded</span>
                      <span className="text-brand-amber-dark font-bold flex items-center gap-1">
                        <Coins className="w-3 h-3 fill-current" /> {camp.coinsCollected} Coins Redeemed
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => setActiveModalCampaign(camp)}
                  className="w-full py-3.5 bg-brand-coral hover:bg-brand-coral-dark text-white font-heading font-bold text-xs rounded-xl shadow-soft flex items-center justify-center gap-2 transition-all"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Donate Cash or PawCoins</span>
                </button>
              </div>

            </div>
          )
        })}
      </div>

      {/* Donation Modal */}
      {activeModalCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 relative shadow-2xl border border-brand-coral/20">
            <button
              onClick={() => setActiveModalCampaign(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>

            {successMsg ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-heading font-bold text-xl text-brand-teal-dark">Donation Successful!</h4>
                <p className="text-xs text-brand-muted">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleDonate} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-brand-coral tracking-wider">Support Street Dogs</span>
                  <h3 className="font-heading font-bold text-lg text-brand-teal-dark">{activeModalCampaign.title}</h3>
                </div>

                {/* Donation Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-brand-teal-dark mb-1.5 uppercase">Donation Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDonationType('COIN')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        donationType === 'COIN' ? 'border-brand-amber bg-brand-amber-surface text-brand-amber-dark' : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      <Coins className="w-4 h-4 fill-brand-amber text-brand-amber" />
                      <span>PawCoins ({currentUser?.coinsBalance || 0} Avail)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonationType('CASH')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        donationType === 'CASH' ? 'border-brand-coral bg-brand-coral-surface text-brand-coral-dark' : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-brand-coral" />
                      <span>Direct Cash (INR)</span>
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">
                    {donationType === 'COIN' ? 'Number of PawCoins to Donate' : 'Amount in INR (₹)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={donationType === 'COIN' ? (currentUser?.coinsBalance || 100) : 50000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-base font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-brand-coral"
                  />
                  <div className="flex gap-2 mt-2">
                    {[20, 50, 100, 200].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-brand-coral-surface hover:text-brand-coral"
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donor Message */}
                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Encouraging Note (Optional)</label>
                  <input
                    type="text"
                    value={donorNotes}
                    onChange={(e) => setDonorNotes(e.target.value)}
                    placeholder="e.g. In memory of Bruno & street dogs everywhere"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-coral"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-coral hover:bg-brand-coral-dark text-white font-heading font-bold text-xs rounded-xl shadow-soft transition-all"
                >
                  Confirm {donationType === 'COIN' ? `${amount} PawCoins Donation` : `₹${amount} Cash Donation`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
