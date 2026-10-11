import { api } from '../lib/api'
import {
  initialProfiles,
  initialDogs,
  initialVaccinations,
  initialMedications,
  initialSymptomLogs,
  initialProducts,
  initialCampaigns,
  initialEvents,
  initialVets
} from './mockData'


// Initialize LocalStorage backing store for reactive frontend persistence
const getStored = (key, fallback) => {
  try {
    const val = localStorage.getItem(`pawconnect_${key}`)
    return val ? JSON.parse(val) : fallback
  } catch (e) {
    return fallback
  }
}

const setStored = (key, val) => {
  try {
    localStorage.setItem(`pawconnect_${key}`, JSON.stringify(val))
  } catch (e) {
    console.error(e)
  }
}

export const store = {
  getProfiles: () => getStored('profiles', initialProfiles),
  saveProfiles: (p) => setStored('profiles', p),

  getDogs: () => getStored('dogs', initialDogs),
  saveDogs: (d) => setStored('dogs', d),

  getVaccinations: () => getStored('vaccinations', initialVaccinations),
  saveVaccinations: (v) => setStored('vaccinations', v),

  getMedications: () => getStored('medications', initialMedications),
  saveMedications: (m) => setStored('medications', m),

  getSymptomLogs: () => getStored('symptom_logs', initialSymptomLogs),
  saveSymptomLogs: (s) => setStored('symptom_logs', s),

  getProducts: () => getStored('products', initialProducts),
  saveProducts: (p) => setStored('products', p),

  getCampaigns: () => getStored('campaigns', initialCampaigns),
  saveCampaigns: (c) => setStored('campaigns', c),

  getEvents: () => getStored('events', initialEvents),
  saveEvents: (e) => setStored('events', e),

  getVets: () => getStored('vets', initialVets),

  getConsents: () => getStored('consents', [
    {
      id: "grant-1",
      dogId: initialDogs[0].id,
      vetId: initialProfiles.vet.id,
      grantedAt: "2024-10-01T08:00:00Z",
      expiresAt: "2025-10-01T08:00:00Z",
      notes: "Annual gastrointestinal and general wellness monitoring."
    }
  ]),
  saveConsents: (c) => setStored('consents', c),

  getAppointments: () => getStored('appointments', [
    {
      id: "apt-1",
      dogId: initialDogs[0].id,
      dogName: "Bruno",
      vetId: initialProfiles.vet.id,
      vetName: "Dr. Anika Rao",
      scheduledAt: "Tomorrow, 10:00 AM",
      status: "CONFIRMED",
      reason: "Post-symptom recovery checkup"
    }
  ]),
  saveAppointments: (a) => setStored('appointments', a),

  getPrescriptions: () => getStored('prescriptions', [
    {
      id: "rx-1",
      dogId: initialDogs[0].id,
      dogName: "Bruno",
      vetName: "Dr. Anika Rao",
      issuedAt: "2024-10-04",
      medications: "Proviable Forte (3ml once daily), Royal Canin Gastrointestinal Low Fat Kibble",
      notes: "Follow up if watery stools return within 48h."
    }
  ]),
  savePrescriptions: (p) => setStored('prescriptions', p),

  getCoinTransactions: () => getStored('coin_tx', [
    { id: "tx-1", type: "EARN", amount: 50, source: "WELCOME_BONUS", date: "2024-09-01" },
    { id: "tx-2", type: "EARN", amount: 100, source: "VACCINATION_LOG", date: "2024-09-15" },
    { id: "tx-3", type: "EARN", amount: 30, source: "SYMPTOM_LOG", date: "2024-10-04" },
    { id: "tx-4", type: "REDEEM", amount: -40, source: "STORE_DISCOUNT", date: "2024-10-05" }
  ]),
  saveCoinTransactions: (t) => setStored('coin_tx', t)
}

// AI calls go through the backend, which holds the AI service token. The browser never calls the AI service.
// When the AI service is unavailable, a basic rule-based answer is shown and marked as fallback.

const fallbackRisk = (symptomInput) => {
  const stool = symptomInput.stoolConsistency?.toUpperCase()
  const appetite = symptomInput.appetite?.toUpperCase()
  const severeStool = ['WATERY', 'BLOODY'].includes(stool)
  const hasVomit = Boolean(symptomInput.vomiting)
  const hasLethargy = Boolean(symptomInput.lethargy)

  if (stool === 'BLOODY' || (hasVomit && hasLethargy) || (severeStool && hasVomit)) {
    return {
      riskLevel: 'CONSULT_VET',
      confidenceScore: 0.92,
      explanation: 'Several high-priority signs were reported together. Veterinary attention is advised.',
      recommendations: '1. Book a veterinary consultation today.\n2. Do not offer heavy food until evaluated.\n3. Offer small sips of clean water.',
      modelProvider: 'rule-engine-fallback',
      modelVersion: '1.0.0',
      fallback: true,
    }
  }
  if (severeStool || appetite === 'NONE' || hasVomit || hasLethargy || stool === 'SOFT' || appetite === 'REDUCED') {
    return {
      riskLevel: 'MODERATE',
      confidenceScore: 0.8,
      explanation: 'Mild to moderate digestive irritation or fatigue was reported. Monitor closely for 12 to 24 hours.',
      recommendations: '1. Monitor hydration and stool.\n2. Offer a bland diet if tolerated.\n3. Consult a vet if symptoms persist beyond 24 hours.',
      modelProvider: 'rule-engine-fallback',
      modelVersion: '1.0.0',
      fallback: true,
    }
  }
  return {
    riskLevel: 'LOW',
    confidenceScore: 0.95,
    explanation: 'The reported signs look within normal range and show no acute red flags.',
    recommendations: '1. Continue regular feeding and exercise.\n2. Keep up hydration and scheduled vaccinations.',
    modelProvider: 'rule-engine-fallback',
    modelVersion: '1.0.0',
    fallback: true,
  }
}

export const apiAssessRisk = async (symptomInput) => {
  try {
    return await api('/ai/risk', { method: 'POST', body: symptomInput })
  } catch (err) {
    console.warn('AI screening unavailable, showing basic guidance:', err.message)
    return fallbackRisk(symptomInput)
  }
}

export const apiChatAssistant = async (messages, userContext = {}) => {
  const turns = messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content }))
  try {
    const res = await api('/ai/chat', { method: 'POST', body: { messages: turns, userContext } })
    return res.reply
  } catch (err) {
    const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase()
    if (lastMsg.includes('vomit') || lastMsg.includes('emergency') || lastMsg.includes('blood')) {
      return '⚠️ **Emergency alert**: repeated vomiting or bleeding needs in-person veterinary care. Please visit the nearest vet clinic now, or book a veterinarian on PawConnect Vet Connect.'
    }
    if (lastMsg.includes('coin') || lastMsg.includes('reward') || lastMsg.includes('earn')) {
      return '🐾 You earn **PawCoins** for vaccination records (+50), symptom checks (+15), completed vet checkups (+40), store purchases (+20), events (+30) and completing your profile (+25). Coins can be used for store discounts or donated at ₹1 per coin to NGO street-dog meals.'
    }
    if (lastMsg.includes('feed') || lastMsg.includes('diet') || lastMsg.includes('chicken')) {
      return '🍲 For an upset stomach, a bland diet of boiled boneless chicken breast and boiled white rice (1:2) or plain pumpkin puree is often gentle for 24 to 48 hours. Consult a vet if it does not improve.'
    }
    return "Woof! I'm your **PawConnect canine care assistant**. The AI service is unavailable right now, but I can still help with general questions. Please contact a veterinarian for health concerns."
  }
}
