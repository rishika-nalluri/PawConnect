import React, { useState } from 'react'
import {
  Stethoscope,
  ShieldCheck,
  Calendar,
  FileText,
  User,
  Clock,
  CheckCircle,
  Plus,
  Send,
  AlertTriangle,
  Bot,
  ExternalLink
} from 'lucide-react'
import { store } from '../api/client'
import { useAuth } from '../context/AuthContext'

export const VetDashboard = () => {
  const { currentUser } = useAuth()
  const dogs = store.getDogs()
  const consents = store.getConsents()
  const vaccinations = store.getVaccinations()
  const medications = store.getMedications()
  const symptomLogs = store.getSymptomLogs()
  const [appointments, setAppointments] = useState(store.getAppointments())
  const [prescriptions, setPrescriptions] = useState(store.getPrescriptions())

  // Consented dogs filtering
  const consentedDogs = dogs.filter(d => consents.some(c => c.dogId === d.id && c.vetId === currentUser.id))
  const [selectedPatientId, setSelectedPatientId] = useState(consentedDogs[0]?.id || '')

  const currentPatient = dogs.find(d => d.id === selectedPatientId) || consentedDogs[0]

  // Prescription Form State
  const [rxMeds, setRxMeds] = useState('')
  const [rxNotes, setRxNotes] = useState('')
  const [rxSuccess, setRxSuccess] = useState('')

  const handleCreatePrescription = (e) => {
    e.preventDefault()
    if (!currentPatient) return

    const newRx = {
      id: `rx-${Date.now()}`,
      dogId: currentPatient.id,
      dogName: currentPatient.name,
      vetName: currentUser.fullName,
      issuedAt: new Date().toISOString().split('T')[0],
      medications: rxMeds,
      notes: rxNotes
    }
    const updated = [newRx, ...prescriptions]
    setPrescriptions(updated)
    store.savePrescriptions(updated)

    // Also add to medications
    const newMedRecord = {
      id: `med-${Date.now()}`,
      dogId: currentPatient.id,
      medicationName: rxMeds,
      dosage: "As directed in prescription",
      schedule: "Active regimen",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "Follow up in 10 days",
      prescribedBy: currentUser.fullName
    }
    const updatedMeds = [newMedRecord, ...medications]
    store.saveMedications(updatedMeds)

    setRxMeds('')
    setRxNotes('')
    setRxSuccess(`Digital Prescription successfully generated for ${currentPatient.name}!`)
    setTimeout(() => setRxSuccess(''), 3000)
  }

  const handleUpdateAppointment = (aptId, newStatus) => {
    const updated = appointments.map(a => a.id === aptId ? { ...a, status: newStatus } : a)
    setAppointments(updated)
    store.saveAppointments(updated)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Clinic Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-18 h-18 rounded-2xl overflow-hidden shadow-soft border-2 border-brand-teal/20">
            <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-2xl text-brand-teal-dark">{currentUser.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> VCI VERIFIED
              </span>
            </div>
            <p className="text-xs font-semibold text-brand-amber-dark">{currentUser.specialization}</p>
            <p className="text-xs text-brand-muted">{currentUser.clinicName} • {currentUser.clinicAddress}</p>
            <p className="text-[11px] font-mono text-gray-400 mt-0.5">License: {currentUser.licenseNumber}</p>
          </div>
        </div>

        <div className="bg-brand-teal-surface border border-brand-teal/20 rounded-2xl p-4 text-xs space-y-1 w-full md:w-auto">
          <p className="font-bold text-brand-teal-dark">Clinical Consultation Queue</p>
          <p className="text-gray-600">Active Consented Patients: <strong>{consentedDogs.length}</strong></p>
          <p className="text-gray-600">Scheduled Today: <strong>{appointments.length} Appointments</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Consented Patients & Health History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-teal tracking-wider">Consent-Gated Patients</span>
                <h3 className="font-heading font-bold text-lg text-brand-teal-dark">Consented Canine Records</h3>
              </div>
              <span className="text-xs text-gray-400">Pet parent granted access</span>
            </div>

            {/* Patient Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {consentedDogs.map((dog) => (
                <button
                  key={dog.id}
                  onClick={() => setSelectedPatientId(dog.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shrink-0 ${
                    selectedPatientId === dog.id
                      ? 'bg-brand-teal text-white border-brand-teal'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  <img src={dog.photoUrl} alt={dog.name} className="w-5 h-5 rounded-full object-cover" />
                  <span>{dog.name} ({dog.breed})</span>
                </button>
              ))}
            </div>

            {/* Current Patient Dossier */}
            {currentPatient && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-brand-bg space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-brand-teal-dark">Weight: {currentPatient.weight} kg</span>
                    <span className="text-gray-500">DOB: {currentPatient.dob}</span>
                  </div>
                  <div className="text-xs">
                    <strong className="text-red-600">Allergies / Sensitivities: </strong>
                    <span className="text-gray-700">{currentPatient.allergies}</span>
                  </div>
                </div>

                {/* AI Risk Assessment History */}
                <div>
                  <h4 className="text-xs font-bold text-brand-teal-dark uppercase tracking-wider mb-2">
                    Recent AI Screening Logs
                  </h4>
                  <div className="space-y-2">
                    {symptomLogs.filter(s => s.dogId === currentPatient.id).map(log => (
                      <div key={log.id} className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50 text-xs space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>{new Date(log.loggedAt).toLocaleDateString()} — {log.appetite} Appetite</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            log.riskAssessment?.riskLevel === 'CONSULT_VET' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {log.riskAssessment?.riskLevel}
                          </span>
                        </div>
                        <p className="text-gray-600">{log.riskAssessment?.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vaccines List */}
                <div>
                  <h4 className="text-xs font-bold text-brand-teal-dark uppercase tracking-wider mb-2">
                    Vaccination History
                  </h4>
                  <div className="space-y-1.5">
                    {vaccinations.filter(v => v.dogId === currentPatient.id).map(v => (
                      <div key={v.id} className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs flex justify-between">
                        <span className="font-bold">{v.vaccineName}</span>
                        <span>Due: {v.nextDueDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Prescriptions & Appointments */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Issue Prescription */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 space-y-4">
            <h3 className="font-heading font-bold text-base text-brand-teal-dark flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-teal" />
              <span>Issue Digital Prescription for {currentPatient?.name}</span>
            </h3>

            {rxSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                {rxSuccess}
              </div>
            )}

            <form onSubmit={handleCreatePrescription} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Prescribed Medicines & Dosage</label>
                <textarea
                  required
                  rows={3}
                  value={rxMeds}
                  onChange={(e) => setRxMeds(e.target.value)}
                  placeholder="e.g. Proviable Forte paste (3ml once daily x 7 days)&#10;Royal Canin Gastrointestinal Low Fat Kibble"
                  className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-teal"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Clinical Advice / Follow-up Notes</label>
                <input
                  type="text"
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  placeholder="e.g. Recheck if vomiting persists beyond 48 hours"
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-teal"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-brand-teal hover:bg-brand-teal-dark text-white font-heading font-bold text-xs rounded-xl shadow-soft"
              >
                Sign & Transmit Digital Prescription
              </button>
            </form>
          </div>

          {/* Consultation Appointments */}
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 space-y-4">
            <h3 className="font-heading font-bold text-base text-brand-teal-dark flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-amber" />
              <span>Appointment Schedule</span>
            </h3>
            <div className="space-y-2">
              {appointments.map(apt => (
                <div key={apt.id} className="p-3.5 rounded-2xl bg-brand-bg text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-brand-teal-dark">{apt.dogName}</p>
                      <p className="text-gray-500">{apt.scheduledAt}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{apt.reason}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-gray-200/50">
                    <button
                      onClick={() => handleUpdateAppointment(apt.id, 'COMPLETED')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleUpdateAppointment(apt.id, 'CANCELLED')}
                      className="px-2.5 py-1 rounded-lg bg-gray-200 text-gray-600 text-[10px] font-bold"
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
