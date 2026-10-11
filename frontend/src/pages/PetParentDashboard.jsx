import React, { useState } from 'react'
import {
  PawPrint,
  Heart,
  Coins,
  Plus,
  Stethoscope,
  Bot,
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  FileText,
  ShieldCheck,
  X,
  Trash2,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { store, apiAssessRisk } from '../api/client'
import { useAuth } from '../context/AuthContext'

export const PetParentDashboard = ({ setIsChatOpen }) => {
  const { currentUser, updateCoins } = useAuth()
  
  const [dogs, setDogs] = useState(store.getDogs())
  const [selectedDogId, setSelectedDogId] = useState(dogs[0]?.id || '')
  const [activeTab, setActiveTab] = useState('symptom_checker') // 'symptom_checker' | 'vaccines' | 'vets' | 'wallet'

  const [vaccinations, setVaccinations] = useState(store.getVaccinations())
  const [medications, setMedications] = useState(store.getMedications())
  const [symptomLogs, setSymptomLogs] = useState(store.getSymptomLogs())
  const [vets, setVets] = useState(store.getVets())
  const [consents, setConsents] = useState(store.getConsents())
  const [appointments, setAppointments] = useState(store.getAppointments())
  const [prescriptions, setPrescriptions] = useState(store.getPrescriptions())
  const [coinTransactions, setCoinTransactions] = useState(store.getCoinTransactions())

  // Dog Modal
  const [isDogModalOpen, setIsDogModalOpen] = useState(false)
  const [newDog, setNewDog] = useState({ name: '', breed: '', weight: '', allergies: '', dob: '', photoUrl: '' })

  // Vaccine Modal
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false)
  const [newVaccine, setNewVaccine] = useState({ vaccineName: '', dateGiven: '', nextDueDate: '', administeredBy: '' })

  // AI Symptom Checker Form State
  const [symptomInput, setSymptomInput] = useState({
    appetite: 'REDUCED',
    stoolConsistency: 'SOFT',
    vomiting: false,
    lethargy: true,
    waterIntake: 'NORMAL',
    symptomsText: ''
  })
  const [isScreening, setIsScreening] = useState(false)
  const [screeningResult, setScreeningResult] = useState(null)

  // Appointment Modal
  const [selectedVetForApt, setSelectedVetForApt] = useState(null)
  const [aptDate, setAptDate] = useState('Tomorrow, 10:00 AM')
  const [aptReason, setAptReason] = useState('')

  const currentDog = dogs.find(d => d.id === selectedDogId) || dogs[0]

  // Handlers
  const handleAddDog = (e) => {
    e.preventDefault()
    const dog = {
      id: `dog-${Date.now()}`,
      petParentId: currentUser.id,
      name: newDog.name,
      breed: newDog.breed,
      gender: 'MALE',
      dob: newDog.dob || '2023-01-01',
      weight: parseFloat(newDog.weight) || 15.0,
      allergies: newDog.allergies || 'None',
      photoUrl: newDog.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
      isActive: true
    }
    const updated = [...dogs, dog]
    setDogs(updated)
    store.saveDogs(updated)
    setSelectedDogId(dog.id)
    setIsDogModalOpen(false)
    setNewDog({ name: '', breed: '', weight: '', allergies: '', dob: '', photoUrl: '' })
    
    // Reward welcome coins for adding dog
    updateCoins(50, "ADD_DOG_PROFILE")
  }

  const handleAddVaccine = (e) => {
    e.preventDefault()
    const record = {
      id: `vac-${Date.now()}`,
      dogId: currentDog.id,
      vaccineName: newVaccine.vaccineName,
      dateGiven: newVaccine.dateGiven,
      nextDueDate: newVaccine.nextDueDate,
      administeredBy: newVaccine.administeredBy || 'Apex Canine Care',
      batchNumber: `NB-${Math.floor(Math.random() * 90000 + 10000)}`
    }
    const updated = [record, ...vaccinations]
    setVaccinations(updated)
    store.saveVaccinations(updated)
    setIsVaccineModalOpen(false)
    setNewVaccine({ vaccineName: '', dateGiven: '', nextDueDate: '', administeredBy: '' })

    // Reward PawCoins for preventative vaccination log
    updateCoins(100, "VACCINATION_LOG")
    alert("Vaccination recorded! You earned +100 PawCoins!")
  }

  const handleRunAIScreening = async (e) => {
    e.preventDefault()
    setIsScreening(true)
    try {
      const result = await apiAssessRisk({
        dogId: currentDog?.id,
        ...symptomInput
      })
      setScreeningResult(result)

      // Save log to history
      const newLog = {
        id: `sym-${Date.now()}`,
        dogId: currentDog?.id,
        loggedAt: new Date().toISOString(),
        ...symptomInput,
        riskAssessment: result
      }
      const updatedLogs = [newLog, ...symptomLogs]
      setSymptomLogs(updatedLogs)
      store.saveSymptomLogs(updatedLogs)

      // Award +30 PawCoins for diligent health logging
      updateCoins(30, "HEALTH_SYMPTOM_LOG")
    } catch (err) {
      console.error(err)
    } finally {
      setIsScreening(false)
    }
  }

  const handleToggleConsent = (vetId) => {
    const existing = consents.find(c => c.dogId === currentDog?.id && c.vetId === vetId)
    let updatedConsents
    if (existing) {
      // Revoke consent
      updatedConsents = consents.filter(c => c.id !== existing.id)
    } else {
      // Grant consent
      const newGrant = {
        id: `grant-${Date.now()}`,
        dogId: currentDog?.id,
        vetId,
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
        notes: "Full health history access granted for clinical consultations."
      }
      updatedConsents = [...consents, newGrant]
    }
    setConsents(updatedConsents)
    store.saveConsents(updatedConsents)
  }

  const handleBookAppointment = (e) => {
    e.preventDefault()
    if (!selectedVetForApt) return

    const newApt = {
      id: `apt-${Date.now()}`,
      dogId: currentDog?.id,
      dogName: currentDog?.name,
      vetId: selectedVetForApt.id,
      vetName: selectedVetForApt.fullName,
      scheduledAt: aptDate,
      status: 'CONFIRMED',
      reason: aptReason || 'Routine consultation and wellness screening'
    }
    const updated = [newApt, ...appointments]
    setAppointments(updated)
    store.saveAppointments(updated)

    // Automatically ensure consent is granted for this vet
    if (!consents.some(c => c.dogId === currentDog?.id && c.vetId === selectedVetForApt.id)) {
      handleToggleConsent(selectedVetForApt.id)
    }

    setSelectedVetForApt(null)
    setAptReason('')
    alert(`Appointment confirmed with ${newApt.vetName} for ${newApt.scheduledAt}!`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* User Info */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-soft border-2 border-brand-teal/20">
            <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="font-heading font-extrabold text-2xl text-brand-teal-dark">{currentUser.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-teal-surface text-brand-teal text-[11px] font-bold">
                Pet Parent
              </span>
            </div>
            <p className="text-xs text-brand-muted mt-0.5">{currentUser.address}, {currentUser.city}</p>
          </div>
        </div>

        {/* PawCoins Wallet Pill */}
        <div className="flex items-center gap-4 bg-brand-amber-surface border border-brand-amber/30 rounded-2xl p-4 shadow-sm w-full md:w-auto justify-between sm:justify-end">
          <div>
            <p className="text-[10px] uppercase font-bold text-brand-amber tracking-wider">PawCoins Balance</p>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-brand-amber fill-brand-amber" />
              <span className="font-heading font-extrabold text-3xl text-brand-amber-dark">
                {currentUser.coinsBalance || 0}
              </span>
            </div>
            <p className="text-[10px] text-gray-500">1 Coin = ₹1 Street Dog Meal Fund</p>
          </div>
          <button
            onClick={() => setActiveTab('wallet')}
            className="px-4 py-2 bg-brand-amber hover:bg-brand-amber-dark text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Wallet History
          </button>
        </div>

      </div>

      {/* Dogs Selector Strip */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {dogs.map((dog) => (
            <button
              key={dog.id}
              onClick={() => setSelectedDogId(dog.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all shrink-0 ${
                selectedDogId === dog.id
                  ? 'border-brand-teal bg-brand-teal text-white shadow-soft font-bold'
                  : 'border-gray-200 bg-white text-brand-teal-dark hover:border-brand-teal/30'
              }`}
            >
              <img src={dog.photoUrl} alt={dog.name} className="w-8 h-8 rounded-full object-cover" />
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">{dog.name}</p>
                <p className={`text-[10px] ${selectedDogId === dog.id ? 'text-white/80' : 'text-gray-400'}`}>
                  {dog.breed}
                </p>
              </div>
            </button>
          ))}

          <button
            onClick={() => setIsDogModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-dashed border-brand-teal/30 hover:border-brand-teal text-brand-teal text-xs font-bold shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dog Profile (+50 Coins)</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('symptom_checker')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'symptom_checker' ? 'bg-brand-teal text-white' : 'text-gray-500 hover:text-brand-teal'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Gut Health & Symptom Screener</span>
        </button>
        <button
          onClick={() => setActiveTab('vaccines')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'vaccines' ? 'bg-brand-teal text-white' : 'text-gray-500 hover:text-brand-teal'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Vaccinations & Medical Logs</span>
        </button>
        <button
          onClick={() => setActiveTab('vets')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'vets' ? 'bg-brand-teal text-white' : 'text-gray-500 hover:text-brand-teal'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Vet Connect & Consent Grants</span>
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'wallet' ? 'bg-brand-teal text-white' : 'text-gray-500 hover:text-brand-teal'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>PawCoins Rewards & Impact</span>
        </button>
      </div>

      {/* TAB 1: AI GUT HEALTH & SYMPTOM SCREENER */}
      {activeTab === 'symptom_checker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Questionnaire Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-amber">
                  Powered by Groq & Diagnostic ML
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-brand-teal-dark mt-0.5">
                  Early Symptom Screener for {currentDog?.name}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-brand-teal-surface text-brand-teal text-xs font-bold rounded-full">
                +30 Coins per Log
              </span>
            </div>

            <form onSubmit={handleRunAIScreening} className="space-y-5">
              
              {/* Appetite */}
              <div>
                <label className="block text-xs font-bold text-brand-teal-dark mb-1.5 uppercase">Appetite Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['NORMAL', 'REDUCED', 'NONE'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSymptomInput({ ...symptomInput, appetite: lvl })}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        symptomInput.appetite === lvl
                          ? 'border-brand-teal bg-brand-teal-surface text-brand-teal'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {lvl === 'NORMAL' ? '🟢 Normal Eating' : lvl === 'REDUCED' ? '🟡 Partial / Reduced' : '🔴 Refusing Food'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stool Consistency */}
              <div>
                <label className="block text-xs font-bold text-brand-teal-dark mb-1.5 uppercase">Stool Consistency</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 'NORMAL', label: 'Solid / Normal' },
                    { val: 'SOFT', label: 'Soft / Loose' },
                    { val: 'WATERY', label: 'Watery Diarrhea' },
                    { val: 'BLOODY', label: 'Bloody / Mucus' }
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setSymptomInput({ ...symptomInput, stoolConsistency: s.val })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        symptomInput.stoolConsistency === s.val
                          ? 'border-brand-teal bg-brand-teal-surface text-brand-teal'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vomiting & Lethargy Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-brand-text">Vomiting Present?</p>
                    <p className="text-[10px] text-gray-400">Any regurgitation in last 24h</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={symptomInput.vomiting}
                    onChange={(e) => setSymptomInput({ ...symptomInput, vomiting: e.target.checked })}
                    className="w-5 h-5 rounded text-brand-teal focus:ring-brand-teal cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-brand-text">Unusual Lethargy?</p>
                    <p className="text-[10px] text-gray-400">Sluggish, unwilling to walk</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={symptomInput.lethargy}
                    onChange={(e) => setSymptomInput({ ...symptomInput, lethargy: e.target.checked })}
                    className="w-5 h-5 rounded text-brand-teal focus:ring-brand-teal cursor-pointer"
                  />
                </div>
              </div>

              {/* Water Intake */}
              <div>
                <label className="block text-xs font-bold text-brand-teal-dark mb-1.5 uppercase">Water Drinking Behavior</label>
                <div className="grid grid-cols-3 gap-2">
                  {['NORMAL', 'INCREASED', 'DECREASED'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSymptomInput({ ...symptomInput, waterIntake: w })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        symptomInput.waterIntake === w
                          ? 'border-brand-teal bg-brand-teal-surface text-brand-teal'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {w === 'NORMAL' ? 'Normal' : w === 'INCREASED' ? 'Excessive Thirst' : 'Reduced / None'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms Notes */}
              <div>
                <label className="block text-xs font-bold text-brand-teal-dark mb-1.5 uppercase">Context & Behavioral Notes</label>
                <textarea
                  rows={2}
                  value={symptomInput.symptomsText}
                  onChange={(e) => setSymptomInput({ ...symptomInput, symptomsText: e.target.value })}
                  placeholder="e.g. Bruno ate grass this morning, slight whimpering when lying down..."
                  className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-teal"
                />
              </div>

              <button
                type="submit"
                disabled={isScreening}
                className="w-full py-4 bg-gradient-to-r from-brand-teal to-brand-teal-dark text-white font-heading font-bold text-sm rounded-xl shadow-soft hover:shadow-hover transition-all flex items-center justify-center gap-2"
              >
                {isScreening ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-brand-amber" />
                    <span>Analyzing with Groq AI...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-5 h-5 text-brand-amber-light" />
                    <span>Generate Clinical AI Risk Assessment</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* AI Result Card */}
          <div className="lg:col-span-5 space-y-6">
            {screeningResult ? (
              <div className="bg-white rounded-3xl p-6 shadow-premium border-2 border-brand-teal/20 space-y-4">
                
                {/* Header status */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-brand-teal" />
                    <span className="font-heading font-bold text-sm text-brand-teal-dark">Assessment Completed</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {screeningResult.modelProvider}
                  </span>
                </div>

                {/* Risk Tier Badge */}
                <div className={`p-4 rounded-2xl flex items-center justify-between ${
                  screeningResult.riskLevel === 'CONSULT_VET'
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : screeningResult.riskLevel === 'MODERATE'
                    ? 'bg-amber-50 border border-amber-200 text-amber-800'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">Triaged Risk Tier</span>
                    <h4 className="font-heading font-extrabold text-xl mt-0.5">
                      {screeningResult.riskLevel === 'CONSULT_VET'
                        ? '🚨 URGENT VET ATTENTION'
                        : screeningResult.riskLevel === 'MODERATE'
                        ? '⚠️ MODERATE OBSERVATION'
                        : '✅ LOW RISK / STABLE'}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold">Confidence</span>
                    <p className="font-mono font-bold text-lg">{Math.round(screeningResult.confidenceScore * 100)}%</p>
                  </div>
                </div>

                {/* Narrative Explanation */}
                <div className="space-y-1">
                  <h5 className="font-heading font-bold text-xs uppercase text-brand-teal-dark">Clinical Synthesis</h5>
                  <p className="text-xs text-gray-600 leading-relaxed bg-brand-bg p-3.5 rounded-2xl">
                    {screeningResult.explanation}
                  </p>
                </div>

                {/* Actionable Recommendations */}
                <div className="space-y-1">
                  <h5 className="font-heading font-bold text-xs uppercase text-brand-teal-dark">Pet Parent Action Steps</h5>
                  <div className="text-xs text-gray-700 leading-relaxed bg-brand-teal-surface/50 p-3.5 rounded-2xl whitespace-pre-line border border-brand-teal/10">
                    {screeningResult.recommendations}
                  </div>
                </div>

                {/* Emergency CTA */}
                {screeningResult.riskLevel !== 'LOW' && (
                  <button
                    onClick={() => setActiveTab('vets')}
                    className="w-full py-3 bg-brand-teal hover:bg-brand-teal-dark text-white font-heading font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Connect with Dr. Anika Rao Now</span>
                  </button>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-dashed border-gray-200 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-brand-teal-surface text-brand-teal mx-auto flex items-center justify-center">
                  <Bot className="w-8 h-8" />
                </div>
                <h4 className="font-heading font-bold text-base text-brand-teal-dark">Awaiting Symptom Input</h4>
                <p className="text-xs text-brand-muted max-w-xs mx-auto">
                  Complete the questionnaire on the left to receive immediate clinical risk guidance and earn 30 PawCoins.
                </p>
              </div>
            )}

            {/* Past Logs for Dog */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 space-y-3">
              <h4 className="font-heading font-bold text-sm text-brand-teal-dark">Recent Screening Records</h4>
              <div className="space-y-2">
                {symptomLogs.filter(l => l.dogId === currentDog?.id).slice(0, 3).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-brand-text">
                        {new Date(log.loggedAt).toLocaleDateString()} • {log.appetite} Appetite, {log.stoolConsistency} Stool
                      </p>
                      <p className="text-[11px] text-gray-400 truncate max-w-xs">{log.symptomsText || "Standard log"}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.riskAssessment?.riskLevel === 'CONSULT_VET' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {log.riskAssessment?.riskLevel || 'EVALUATED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: VACCINATIONS & MEDICAL LOGS */}
      {activeTab === 'vaccines' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-xl text-brand-teal-dark">
                Vaccination & Preventative Care for {currentDog?.name}
              </h3>
              <p className="text-xs text-brand-muted">Keep immunizations up to date and earn 100 PawCoins per log.</p>
            </div>
            <button
              onClick={() => setIsVaccineModalOpen(true)}
              className="px-4 py-2.5 bg-brand-teal hover:bg-brand-teal-dark text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Vaccination (+100 Coins)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaccinations.filter(v => v.dogId === currentDog?.id).map((vac) => (
              <div key={vac.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-brand-teal-surface text-brand-teal">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    Active Booster
                  </span>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-brand-teal-dark">{vac.vaccineName}</h4>
                  <p className="text-xs text-gray-500">{vac.administeredBy}</p>
                </div>
                <div className="pt-2 border-t border-gray-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date Given:</span>
                    <span className="font-bold text-brand-text">{vac.dateGiven}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Next Booster Due:</span>
                    <span className="font-bold text-brand-amber-dark">{vac.nextDueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Batch Code:</span>
                    <span className="font-mono text-gray-500">{vac.batchNumber}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Medications */}
          <div className="mt-8 bg-white rounded-3xl p-6 shadow-soft border border-gray-100 space-y-4">
            <h4 className="font-heading font-bold text-base text-brand-teal-dark">Prescribed Medications</h4>
            <div className="space-y-3">
              {medications.filter(m => m.dogId === currentDog?.id).map((med) => (
                <div key={med.id} className="p-4 rounded-2xl bg-brand-bg/50 border border-brand-teal/10 flex justify-between items-center">
                  <div>
                    <h5 className="font-heading font-bold text-sm text-brand-teal-dark">{med.medicationName}</h5>
                    <p className="text-xs text-gray-600 mt-0.5">{med.dosage} • {med.schedule}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Prescribed by {med.prescribedBy} ({med.startDate} to {med.endDate})</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-brand-teal text-white text-[10px] font-bold">
                    Ongoing
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VET CONNECT & CONSENT GRANTS */}
      {activeTab === 'vets' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-heading font-bold text-xl text-brand-teal-dark">
              Consent-Gated Veterinarian Connectivity
            </h3>
            <p className="text-xs text-brand-muted">
              You maintain sovereign ownership of {currentDog?.name}'s medical records. Grant or revoke clinical access anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vets.map((vet) => {
              const hasConsent = consents.some(c => c.dogId === currentDog?.id && c.vetId === vet.id)
              return (
                <div key={vet.id} className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 flex flex-col justify-between space-y-4">
                  <div className="flex gap-4">
                    <img src={vet.avatarUrl} alt={vet.fullName} className="w-16 h-16 rounded-2xl object-cover" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-heading font-bold text-base text-brand-teal-dark">{vet.fullName}</h4>
                        <ShieldCheck className="w-4 h-4 text-brand-teal" />
                      </div>
                      <p className="text-xs font-semibold text-brand-amber-dark">{vet.specialization}</p>
                      <p className="text-xs text-gray-400">{vet.clinicName} • {vet.yearsExperience} yrs exp</p>
                      <p className="text-xs font-bold text-brand-teal mt-1">₹{vet.consultationFee} Consultation Fee</p>
                    </div>
                  </div>

                  {/* Consent Status Indicator */}
                  <div className="p-3 rounded-2xl bg-brand-bg flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-brand-text">Medical Records Consent</p>
                      <p className="text-[10px] text-gray-500">
                        {hasConsent ? "Granted: Vet can review all vaccines & symptom logs" : "Revoked / Restricted"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleConsent(vet.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                        hasConsent
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {hasConsent ? "Revoke Access" : "Grant Access"}
                    </button>
                  </div>

                  {/* Book Appointment CTA */}
                  <button
                    onClick={() => setSelectedVetForApt(vet)}
                    className="w-full py-3 bg-brand-teal hover:bg-brand-teal-dark text-white font-heading font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Clinical Consultation</span>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Active Appointments */}
          {appointments.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 space-y-3">
              <h4 className="font-heading font-bold text-base text-brand-teal-dark">Upcoming Appointments</h4>
              <div className="space-y-2">
                {appointments.map((apt) => (
                  <div key={apt.id} className="p-3.5 rounded-2xl bg-brand-bg flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-brand-teal-dark">{apt.dogName} with {apt.vetName}</p>
                      <p className="text-[11px] text-gray-500">{apt.scheduledAt} • Reason: {apt.reason}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PAWCOINS WALLET & IMPACT */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-brand-amber-surface border border-brand-amber/30 space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-amber">Available PawCoins</span>
              <p className="font-heading font-black text-4xl text-brand-amber-dark">{currentUser.coinsBalance || 0}</p>
              <p className="text-xs text-gray-500">Worth ₹{currentUser.coinsBalance || 0} in store discounts or street dog food</p>
            </div>
            <div className="p-6 rounded-3xl bg-brand-teal-surface border border-brand-teal/20 space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-teal">Lifetime Earned</span>
              <p className="font-heading font-black text-4xl text-brand-teal-dark">420</p>
              <p className="text-xs text-gray-500">Through vaccines, health logs, and checkups</p>
            </div>
            <div className="p-6 rounded-3xl bg-brand-coral-surface border border-brand-coral/20 space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-coral">Street Meals Funded</span>
              <p className="font-heading font-black text-4xl text-brand-coral-dark">40</p>
              <p className="text-xs text-gray-500">Delivered via PawsCare welfare routes</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 space-y-4">
            <h4 className="font-heading font-bold text-base text-brand-teal-dark">PawCoin Activity Ledger</h4>
            <div className="space-y-2">
              {coinTransactions.map((tx) => (
                <div key={tx.id} className="p-3.5 rounded-2xl bg-gray-50 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-brand-text">{tx.source.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-gray-400">{tx.date}</p>
                  </div>
                  <span className={`font-heading font-bold text-sm ${
                    tx.amount >= 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} Coins
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Dog Modal */}
      {isDogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-brand-teal/20">
            <button onClick={() => setIsDogModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400">
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-heading font-bold text-xl text-brand-teal-dark mb-4">Add Dog Profile</h4>
            <form onSubmit={handleAddDog} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Dog Name (e.g., Bruno)"
                value={newDog.name}
                onChange={(e) => setNewDog({ ...newDog, name: e.target.value })}
                className="w-full p-2.5 text-xs border rounded-xl"
              />
              <input
                type="text"
                required
                placeholder="Breed (e.g. Golden Retriever, Indie)"
                value={newDog.breed}
                onChange={(e) => setNewDog({ ...newDog, breed: e.target.value })}
                className="w-full p-2.5 text-xs border rounded-xl"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Weight (kg)"
                  value={newDog.weight}
                  onChange={(e) => setNewDog({ ...newDog, weight: e.target.value })}
                  className="w-full p-2.5 text-xs border rounded-xl"
                />
                <input
                  type="date"
                  value={newDog.dob}
                  onChange={(e) => setNewDog({ ...newDog, dob: e.target.value })}
                  className="w-full p-2.5 text-xs border rounded-xl"
                />
              </div>
              <input
                type="text"
                placeholder="Allergies (or 'None')"
                value={newDog.allergies}
                onChange={(e) => setNewDog({ ...newDog, allergies: e.target.value })}
                className="w-full p-2.5 text-xs border rounded-xl"
              />
              <button
                type="submit"
                className="w-full py-3 bg-brand-teal text-white font-bold text-xs rounded-xl shadow-soft"
              >
                Save Dog Profile (+50 PawCoins)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Log Vaccination Modal */}
      {isVaccineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-brand-teal/20">
            <button onClick={() => setIsVaccineModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400">
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-heading font-bold text-xl text-brand-teal-dark mb-4">Record Vaccination for {currentDog?.name}</h4>
            <form onSubmit={handleAddVaccine} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Vaccine Name (e.g. DHPP 7-in-1, Rabies)"
                value={newVaccine.vaccineName}
                onChange={(e) => setNewVaccine({ ...newVaccine, vaccineName: e.target.value })}
                className="w-full p-2.5 text-xs border rounded-xl"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400">Date Administered</label>
                  <input
                    type="date"
                    required
                    value={newVaccine.dateGiven}
                    onChange={(e) => setNewVaccine({ ...newVaccine, dateGiven: e.target.value })}
                    className="w-full p-2 text-xs border rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">Next Booster Due</label>
                  <input
                    type="date"
                    required
                    value={newVaccine.nextDueDate}
                    onChange={(e) => setNewVaccine({ ...newVaccine, nextDueDate: e.target.value })}
                    className="w-full p-2 text-xs border rounded-xl"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Clinic / Doctor Administered"
                value={newVaccine.administeredBy}
                onChange={(e) => setNewVaccine({ ...newVaccine, administeredBy: e.target.value })}
                className="w-full p-2.5 text-xs border rounded-xl"
              />
              <button
                type="submit"
                className="w-full py-3 bg-brand-teal text-white font-bold text-xs rounded-xl shadow-soft"
              >
                Confirm Vaccination (+100 PawCoins)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      {selectedVetForApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-brand-teal/20">
            <button onClick={() => setSelectedVetForApt(null)} className="absolute top-4 right-4 p-2 text-gray-400">
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-heading font-bold text-xl text-brand-teal-dark mb-1">
              Book Appointment with {selectedVetForApt.fullName}
            </h4>
            <p className="text-xs text-brand-muted mb-4">{selectedVetForApt.clinicName} (Fee: ₹{selectedVetForApt.consultationFee})</p>
            <form onSubmit={handleBookAppointment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Select Time Slot</label>
                <select
                  value={aptDate}
                  onChange={(e) => setAptDate(e.target.value)}
                  className="w-full p-2.5 text-xs border rounded-xl bg-white"
                >
                  {selectedVetForApt.availableSlots?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Reason for Visit</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mild lethargy follow-up, annual wellness"
                  value={aptReason}
                  onChange={(e) => setAptReason(e.target.value)}
                  className="w-full p-2.5 text-xs border rounded-xl"
                />
              </div>
              <div className="p-3 bg-brand-teal-surface text-brand-teal text-xs rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Health records consent will be automatically granted to {selectedVetForApt.fullName}.</span>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-brand-teal text-white font-bold text-xs rounded-xl shadow-soft"
              >
                Confirm Appointment Booking
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
