import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TeleConsultRoom from '../components/TeleConsultRoom';
import Notice from '../components/Notice';
import { btnPrimary } from '../components/styles';

const ONLINE_VETS = [
  {
    id: 'vet-1',
    name: 'Dr. Anika Rao',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    qualification: 'BVSc & AH, MVSc (Surgery)',
    specialty: 'Emergency Triage & Canine Internal Medicine',
    experience: '12 years experience',
    clinic: 'PetCare Central Veterinary Hospital, Mumbai',
    rating: '4.9 ★ (840+ tele-consults)',
    languages: 'English, Hindi, Marathi',
    isOnline: true,
    consultFee: '₹499',
    waitMinutes: 'Under 2 mins',
  },
  {
    id: 'vet-2',
    name: 'Dr. Ananya Sen',
    avatar: 'https://images.unsplash.com/photo-1594824813576-96a93d3d4b68?w=400&auto=format&fit=crop&q=80',
    qualification: 'BVSc, PG Diploma Dermatology',
    specialty: 'Canine Dermatology & Allergy Tele-Triage',
    experience: '9 years experience',
    clinic: 'DermPaws Specialized Clinic, Bengaluru',
    rating: '4.8 ★ (510+ tele-consults)',
    languages: 'English, Hindi, Bengali',
    isOnline: true,
    consultFee: '₹449',
    waitMinutes: 'Under 5 mins',
  },
  {
    id: 'vet-3',
    name: 'Dr. Rajesh Mehta',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    qualification: 'BVSc & AH, Dipl. ACVECC',
    specialty: 'Critical Care & Toxin Ingestion Triage',
    experience: '15 years experience',
    clinic: '24/7 Animal Trauma & Emergency Center, Delhi NCR',
    rating: '5.0 ★ (1,200+ tele-consults)',
    languages: 'English, Hindi',
    isOnline: true,
    consultFee: '₹599',
    waitMinutes: 'Available Now',
  },
  {
    id: 'vet-4',
    name: 'Dr. Pooja Iyer',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    qualification: 'BVSc & AH, Canine Nutritionist',
    specialty: 'Gut Health, Diet Recovery & Puppy Wellness',
    experience: '7 years experience',
    clinic: 'Holistic Canine Wellness Studio, Pune',
    rating: '4.9 ★ (390+ tele-consults)',
    languages: 'English, Hindi, Tamil',
    isOnline: false,
    consultFee: '₹399',
    waitMinutes: 'Next slot: 2:00 PM',
  },
];

const TELE_BENEFITS = [
  { icon: '🏠', title: 'Zero Stress for Anxious Dogs', desc: 'No car rides or crowded waiting rooms. Evaluate nervous or reactive pets comfortably in their familiar home.' },
  { icon: '⚡', title: 'Instant Emergency Triage', desc: 'Suspect toxic ingestion or sudden swelling? Get immediate guidance from emergency vets within 60 seconds.' },
  { icon: '📸', title: 'High-Def Video Assessment', desc: 'Veterinarians assess respiratory rate, gait, eye conditions, and dermatological rashes in full 1080p WebRTC video.' },
  { icon: '📋', title: 'Legally Valid Digital Rx', desc: 'Receive instant digital clinical prescriptions and dietary regimens securely synced to your dog’s profile.' },
];

export default function TeleConsultPage() {
  const { session } = useAuth();
  const [activeCallVet, setActiveCallVet] = useState(null);
  const [filterSpecialty, setFilterSpecialty] = useState('ALL');
  const [selectedDog, setSelectedDog] = useState('Bruno');

  if (activeCallVet) {
    return (
      <TeleConsultRoom
        dogName={selectedDog}
        vetName={activeCallVet.name}
        vetSpecialty={activeCallVet.specialty}
        onEndCall={() => setActiveCallVet(null)}
      />
    );
  }

  const filteredVets = ONLINE_VETS.filter((v) => {
    if (filterSpecialty === 'ALL') return true;
    if (filterSpecialty === 'EMERGENCY') return v.specialty.includes('Emergency') || v.specialty.includes('Critical');
    if (filterSpecialty === 'DERM') return v.specialty.includes('Dermatology');
    if (filterSpecialty === 'NUTRITION') return v.specialty.includes('Nutrition') || v.specialty.includes('Gut');
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F2EA]/40 pb-20">
      {/* Telehealth Promo Bar */}
      <div className="bg-brand-teal px-4 py-2.5 text-center text-xs font-semibold text-teal-100 flex items-center justify-center gap-2">
        <span>📹 24/7 Canine Telehealth:</span>
        <span className="text-white font-bold">Connect with a certified vet over encrypted video call in under 2 minutes</span>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-950 via-brand-teal to-teal-900 p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Canine Telecommunication Network
            </span>
            <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl leading-tight">
              Veterinary Care from Home. <br />
              <span className="text-brand-amber">Instant Video Consultations.</span>
            </h1>
            <p className="text-sm text-teal-100 leading-relaxed max-w-xl">
              Connect directly with verified veterinarians for preliminary triage, behavioral questions,
              dermatology assessments, and follow-ups. Safe, sovereign, and stress-free for your dog.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveCallVet(ONLINE_VETS[0])}
                className="flex items-center gap-2 rounded-xl bg-brand-coral px-6 py-3.5 text-sm font-bold text-white hover:bg-orange-700 shadow-card transition transform hover:scale-105"
              >
                <span>📹</span>
                <span>Start Instant Video Call Now</span>
              </button>
              <span className="text-xs text-teal-200">
                Average wait: <strong>~90 seconds</strong> · No app download required
              </span>
            </div>
          </div>

          {/* Background Illustration / Dog Silhouette */}
          <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none hidden md:block">
            <span className="text-[260px] leading-none">🐕</span>
          </div>
        </div>

        {/* Telehealth Benefits Grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TELE_BENEFITS.map((b, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 shadow-card border border-slate-100">
              <span className="text-3xl">{b.icon}</span>
              <h4 className="mt-3 font-bold text-slate-900 text-sm">{b.title}</h4>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Tele-Vet Directory */}
        <div className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">Verified Clinicians</span>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Available Tele-Veterinarians</h2>
              <p className="text-xs text-slate-500">All clinicians are verified through state veterinary councils with active licenses.</p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFilterSpecialty('ALL')}
                className={`rounded-full px-3.5 py-1.5 font-bold transition ${
                  filterSpecialty === 'ALL'
                    ? 'bg-brand-teal text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Doctors
              </button>
              <button
                type="button"
                onClick={() => setFilterSpecialty('EMERGENCY')}
                className={`rounded-full px-3.5 py-1.5 font-bold transition ${
                  filterSpecialty === 'EMERGENCY'
                    ? 'bg-brand-teal text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                🚨 Emergency Triage
              </button>
              <button
                type="button"
                onClick={() => setFilterSpecialty('DERM')}
                className={`rounded-full px-3.5 py-1.5 font-bold transition ${
                  filterSpecialty === 'DERM'
                    ? 'bg-brand-teal text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                🧴 Dermatology
              </button>
              <button
                type="button"
                onClick={() => setFilterSpecialty('NUTRITION')}
                className={`rounded-full px-3.5 py-1.5 font-bold transition ${
                  filterSpecialty === 'NUTRITION'
                    ? 'bg-brand-teal text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                🍲 Nutrition & GI
              </button>
            </div>
          </div>

          {/* Vets Grid */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {filteredVets.map((v) => (
              <div
                key={v.id}
                className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-card border border-slate-100 hover:shadow-lg transition"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={v.avatar}
                        alt={v.name}
                        className="h-16 w-16 rounded-2xl object-cover border-2 border-teal-100 shadow-sm"
                      />
                      {v.isOnline && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-base">{v.name}</h3>
                        <span className="text-xs font-extrabold text-brand-teal">{v.consultFee}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-teal-700">{v.qualification}</p>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{v.specialty}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1 border border-slate-100">
                    <p className="flex justify-between">
                      <span>Experience & Rating:</span>
                      <strong className="text-slate-800">{v.experience} · {v.rating}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Languages:</span>
                      <strong className="text-slate-800">{v.languages}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Hospital / Practice:</span>
                      <strong className="text-slate-800 truncate max-w-[200px]">{v.clinic}</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    {v.waitMinutes}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveCallVet(v)}
                    className="rounded-xl bg-brand-teal px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-teal-dark shadow-sm transition flex items-center gap-1.5"
                  >
                    <span>📹</span>
                    <span>Launch Video Call</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Telehealth Protocol & Safety Guide */}
        <div className="mt-16 rounded-3xl bg-white p-8 md:p-10 shadow-card border border-slate-100">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">Clinical Telemedicine Protocol</span>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">How to Prepare for Your Dog’s Video Consult</h3>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3 text-xs text-slate-600">
            <div className="rounded-xl bg-teal-50/60 p-4 border border-teal-100">
              <span className="font-bold text-brand-teal text-sm">1. Good Lighting & Space</span>
              <p className="mt-1 leading-relaxed">
                Position your dog in a well-lit room. Have someone assist you if you need to gently hold your dog to examine paws, mouth, or eyes.
              </p>
            </div>
            <div className="rounded-xl bg-teal-50/60 p-4 border border-teal-100">
              <span className="font-bold text-brand-teal text-sm">2. Have Logs & Vitals Ready</span>
              <p className="mt-1 leading-relaxed">
                Note down food intake, vomiting episodes, or medications taken in the last 24 hours. Your recent symptom logs are synced automatically.
              </p>
            </div>
            <div className="rounded-xl bg-teal-50/60 p-4 border border-teal-100">
              <span className="font-bold text-brand-teal text-sm">3. Immediate In-Call Prescription</span>
              <p className="mt-1 leading-relaxed">
                If supportive care is required, the veterinarian will issue an electronic prescription directly to your screen during the call.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
