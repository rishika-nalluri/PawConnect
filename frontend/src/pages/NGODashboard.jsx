import React, { useState } from 'react'
import {
  Heart,
  ShieldCheck,
  Coins,
  Plus,
  Users,
  Calendar,
  Camera,
  CheckCircle,
  FileText,
  DollarSign
} from 'lucide-react'
import { store } from '../api/client'
import { useAuth } from '../context/AuthContext'

export const NGODashboard = () => {
  const { currentUser } = useAuth()
  const [campaigns, setCampaigns] = useState(store.getCampaigns())
  const [events, setEvents] = useState(store.getEvents())

  // New Campaign Form
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    targetAmount: 50000,
    photoUrl: ''
  })

  // Impact Report Form
  const [reportText, setReportText] = useState('')
  const [dogsFed, setDogsFed] = useState(120)
  const [reportSuccess, setReportSuccess] = useState('')

  // Coin Redemption Form
  const [redeemAmount, setRedeemAmount] = useState(5000)
  const [redeemSuccess, setRedeemSuccess] = useState('')

  const handleCreateCampaign = (e) => {
    e.preventDefault()
    const camp = {
      id: `camp-${Date.now()}`,
      ngoId: currentUser.id,
      ngoName: currentUser.orgName || currentUser.fullName,
      title: newCampaign.title,
      description: newCampaign.description,
      targetAmount: Number(newCampaign.targetAmount),
      achievedAmount: 0,
      coinsCollected: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2024-12-31',
      status: 'ACTIVE',
      photoUrl: newCampaign.photoUrl || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80'
    }
    const updated = [camp, ...campaigns]
    setCampaigns(updated)
    store.saveCampaigns(updated)
    setIsCampaignModalOpen(false)
    setNewCampaign({ title: '', description: '', targetAmount: 50000, photoUrl: '' })
  }

  const handlePublishImpactReport = (e) => {
    e.preventDefault()
    setReportSuccess(`Impact report published! +${dogsFed} street dogs fed record added to public welfare log.`)
    setReportText('')
    setTimeout(() => setReportSuccess(''), 3500)
  }

  const handleRedeemCoins = (e) => {
    e.preventDefault()
    setRedeemSuccess(`Redemption request of ${redeemAmount} PawCoins (₹${redeemAmount}) processed to PawsCare bank account!`)
    setTimeout(() => setRedeemSuccess(''), 3500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* NGO Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-18 h-18 rounded-2xl overflow-hidden shadow-soft border-2 border-brand-coral/20">
            <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-2xl text-brand-teal-dark">{currentUser.orgName || currentUser.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED NGO
              </span>
            </div>
            <p className="text-xs text-brand-muted mt-0.5">{currentUser.focusArea}</p>
            <p className="text-[11px] font-mono text-gray-400 mt-0.5">Trust Reg: {currentUser.registrationNumber}</p>
          </div>
        </div>

        <button
          onClick={() => setIsCampaignModalOpen(true)}
          className="px-5 py-3 bg-brand-coral hover:bg-brand-coral-dark text-white font-heading font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Welfare Campaign</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-brand-coral-surface border border-brand-coral/20 space-y-2">
          <span className="text-[10px] font-bold uppercase text-brand-coral">Total Welfare Raised</span>
          <p className="font-heading font-black text-3xl text-brand-coral-dark">₹1,48,500</p>
          <p className="text-xs text-gray-500">Across all active & completed campaigns</p>
        </div>
        <div className="p-6 rounded-3xl bg-brand-amber-surface border border-brand-amber/30 space-y-2">
          <span className="text-[10px] font-bold uppercase text-brand-amber">PawCoins Collected</span>
          <p className="font-heading font-black text-3xl text-brand-amber-dark">18,200</p>
          <p className="text-xs text-gray-500">Redeemable 1:1 for actual feeding supplies</p>
        </div>
        <div className="p-6 rounded-3xl bg-brand-teal-surface border border-brand-teal/20 space-y-2">
          <span className="text-[10px] font-bold uppercase text-brand-teal">Street Dogs Fed</span>
          <p className="font-heading font-black text-3xl text-brand-teal-dark">420 Dogs</p>
          <p className="text-xs text-gray-500">Daily routes across East Bengaluru</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active Campaigns */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 space-y-4">
            <h3 className="font-heading font-bold text-lg text-brand-teal-dark">Managed Welfare Campaigns</h3>
            <div className="space-y-4">
              {campaigns.map(camp => {
                const percent = Math.min(100, Math.round((camp.achievedAmount / camp.targetAmount) * 100))
                return (
                  <div key={camp.id} className="p-4 rounded-2xl bg-brand-bg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-heading font-bold text-base text-brand-teal-dark">{camp.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1">{camp.description}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {camp.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>₹{camp.achievedAmount.toLocaleString()} raised</span>
                        <span className="text-gray-400">Target ₹{camp.targetAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-coral rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* PawCoin Redemption Tool */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 space-y-4">
            <h3 className="font-heading font-bold text-base text-brand-teal-dark flex items-center gap-2">
              <Coins className="w-5 h-5 text-brand-amber fill-brand-amber" />
              <span>Redeem PawCoins for Welfare Cash Payout</span>
            </h3>

            {redeemSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                {redeemSuccess}
              </div>
            )}

            <form onSubmit={handleRedeemCoins} className="flex gap-3">
              <input
                type="number"
                min="100"
                max="18200"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(Number(e.target.value))}
                className="flex-1 p-2.5 text-xs border rounded-xl"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-amber hover:bg-brand-amber-dark text-white font-bold text-xs rounded-xl shadow-soft"
              >
                Request Payout (₹{redeemAmount})
              </button>
            </form>
          </div>
        </div>

        {/* Right: Publish Impact Report */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 space-y-4">
            <h3 className="font-heading font-bold text-base text-brand-teal-dark flex items-center gap-2">
              <Camera className="w-5 h-5 text-brand-coral" />
              <span>Post Street Feeding Impact Update</span>
            </h3>

            {reportSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                {reportSuccess}
              </div>
            )}

            <form onSubmit={handlePublishImpactReport} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Number of Dogs Fed Today</label>
                <input
                  type="number"
                  min="1"
                  value={dogsFed}
                  onChange={(e) => setDogsFed(Number(e.target.value))}
                  className="w-full p-2.5 text-xs border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Field Report Story</label>
                <textarea
                  required
                  rows={3}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="e.g. Conducted evening feeding drive across Sarjapur and Bellandur road..."
                  className="w-full p-3 text-xs border rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-brand-coral hover:bg-brand-coral-dark text-white font-heading font-bold text-xs rounded-xl shadow-soft"
              >
                Publish Verified Impact Log
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* New Campaign Modal */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-brand-coral/20">
            <h4 className="font-heading font-bold text-xl text-brand-teal-dark mb-4">Launch New Welfare Campaign</h4>
            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Campaign Title"
                value={newCampaign.title}
                onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                className="w-full p-2.5 text-xs border rounded-xl"
              />
              <textarea
                required
                rows={3}
                placeholder="Detailed Campaign Purpose"
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                className="w-full p-2.5 text-xs border rounded-xl"
              />
              <input
                type="number"
                required
                placeholder="Fundraising Goal (₹)"
                value={newCampaign.targetAmount}
                onChange={(e) => setNewCampaign({ ...newCampaign, targetAmount: e.target.value })}
                className="w-full p-2.5 text-xs border rounded-xl"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="w-1/2 py-2.5 bg-gray-100 text-gray-600 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-brand-coral text-white font-bold text-xs rounded-xl shadow-soft"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
