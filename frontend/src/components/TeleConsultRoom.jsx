import { useState, useEffect } from 'react';
import { api, formatDate } from '../lib/api';

export default function TeleConsultRoom({
  dogName = 'Bruno',
  dogBreed = 'Golden Retriever',
  vetName = 'Dr. Anika Rao',
  vetSpecialty = 'Emergency & Canine Internal Medicine',
  onEndCall,
}) {
  const [seconds, setSeconds] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [dogCamMode, setDogCamMode] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'ehr' | 'rx'
  const [messages, setMessages] = useState([
    { sender: 'Dr. Anika Rao', time: 'Just now', text: "Hello! I can see Bruno clearly. Please keep the camera steady near his abdomen." },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [prescription, setPrescription] = useState({
    medication: 'Probiotic GI Paste 15ml - 2ml twice daily after meals\nElectrolyte Hydration Sachet - mix in 500ml water',
    instructions: 'Monitor stool consistency for 48 hours. Bland boiled chicken and pumpkin diet.',
    followUp: '3 days via Tele-Consult'
  });
  const [isRxSaved, setIsRxSaved] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: 'You', time: 'Just now', text: chatInput.trim() },
    ]);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      {/* Top Bar */}
      <header className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            LIVE TELE-CONSULTATION
          </span>
          <span className="font-mono text-sm font-semibold text-slate-300">
            ⏱️ {formatTimer(seconds)}
          </span>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-700 pl-4">
            <span>Patient: <strong className="text-white">{dogName}</strong> ({dogBreed})</span>
            <span>·</span>
            <span>Clinician: <strong className="text-teal-400">{vetName}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="rounded bg-slate-800 px-2 py-1 text-emerald-400 font-mono">🔒 WebRTC HD 1080p</span>
          <button
            type="button"
            onClick={onEndCall}
            className="rounded-lg bg-rose-600 px-4 py-1.5 font-bold text-white hover:bg-rose-700 transition shadow-sm"
          >
            End Call
          </button>
        </div>
      </header>

      {/* Main Video & Tele-Workspace Area */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Video Canvas */}
        <div className="relative flex-1 bg-black flex items-center justify-center p-4">
          {/* Main Feed: Veterinarian */}
          <div className="relative h-full w-full max-h-[720px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1200&auto=format&fit=crop&q=80"
              alt="Veterinarian on Video Call"
              className="h-full w-full object-cover"
            />
            {/* Doctor Info Pill */}
            <div className="absolute top-4 left-4 rounded-xl bg-slate-900/80 px-3 py-1.5 backdrop-blur border border-slate-700 text-xs">
              <p className="font-bold text-white flex items-center gap-1.5">
                <span>🩺</span> {vetName}
              </p>
              <p className="text-[10px] text-teal-300">{vetSpecialty}</p>
            </div>

            {/* In-Call Vital Telemetry Badge */}
            <div className="absolute top-4 right-4 rounded-xl bg-teal-950/80 px-3 py-1.5 backdrop-blur border border-teal-700 text-[11px] text-teal-200">
              <span className="text-emerald-400 font-bold">● Vitals Feed:</span> Normal Heart Rate · Stable Hydration
            </div>

            {/* Self / Dog PIP View */}
            <div className="absolute bottom-6 right-6 h-36 w-48 sm:h-44 sm:w-60 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl transition-all">
              {cameraOff ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-900 text-xs text-slate-400">
                  Camera Paused
                </div>
              ) : dogCamMode ? (
                <img
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80"
                  alt="Canine Examination Cam"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80"
                  alt="Pet Parent & Dog Feed"
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute bottom-1.5 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                {dogCamMode ? '🐾 Canine Macro Cam' : '👤 You & Dog'}
              </div>
            </div>

            {/* Live Audio Waves Visualizer */}
            <div className="absolute bottom-6 left-6 flex items-center gap-1 bg-slate-900/70 backdrop-blur px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="h-2 w-1 bg-teal-400 animate-pulse"></span>
              <span className="h-4 w-1 bg-teal-400 animate-pulse [animation-delay:0.2s]"></span>
              <span className="h-3 w-1 bg-teal-400 animate-pulse [animation-delay:0.1s]"></span>
              <span className="h-5 w-1 bg-teal-400 animate-pulse [animation-delay:0.3s]"></span>
              <span className="text-[10px] text-slate-300 ml-1">Dr. Sharma speaking</span>
            </div>
          </div>
        </div>

        {/* Side Panel: Chat, EHR & Live Prescription */}
        <div className="w-full lg:w-96 border-l border-slate-800 bg-slate-900 flex flex-col h-72 lg:h-full">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-center border-b-2 transition ${
                activeTab === 'chat'
                  ? 'border-brand-teal text-teal-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              💬 Tele-Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rx')}
              className={`flex-1 py-3 text-center border-b-2 transition ${
                activeTab === 'rx'
                  ? 'border-brand-teal text-teal-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              📋 Live Rx Pad
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ehr')}
              className={`flex-1 py-3 text-center border-b-2 transition ${
                activeTab === 'ehr'
                  ? 'border-brand-teal text-teal-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              🩺 Canine EHR
            </button>
          </div>

          {/* Tab 1: Live Consultation Chat */}
          {activeTab === 'chat' && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                      <span className="font-semibold">{m.sender}</span>
                      <span>· {m.time}</span>
                    </div>
                    <div
                      className={`rounded-2xl px-3 py-2 max-w-[85%] ${
                        m.sender === 'You'
                          ? 'bg-brand-teal text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Type message or symptom update..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:border-brand-teal focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-brand-teal px-3 py-2 text-xs font-bold text-white hover:bg-brand-teal-dark"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Live Digital Prescription */}
          {activeTab === 'rx' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="rounded-xl bg-teal-950/60 p-4 border border-teal-800/60 space-y-3">
                <div className="flex items-center justify-between border-b border-teal-800/60 pb-2">
                  <span className="font-bold text-teal-300">Digital Tele-Prescription</span>
                  <span className="text-[10px] text-slate-400 font-mono">RX-{Date.now().toString().slice(-6)}</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Prescribed Medicines & Dosage:</label>
                  <p className="whitespace-pre-line font-mono text-[11px] text-teal-100 bg-slate-900/80 p-2.5 rounded-lg border border-teal-900">
                    {prescription.medication}
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Clinical Instructions:</label>
                  <p className="text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    {prescription.instructions}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px]">
                  <span className="text-amber-400 font-semibold">Follow-up: {prescription.followUp}</span>
                  <span className="text-slate-400">Digital Signature Verified ✓</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRxSaved(true)}
                className="w-full rounded-xl bg-teal-600 py-2.5 font-bold text-white hover:bg-teal-500 transition shadow-card"
              >
                {isRxSaved ? '✓ Saved to Canine Health Record!' : 'Save & Download Official Rx'}
              </button>
            </div>
          )}

          {/* Tab 3: Consent-Gated EHR Snapshot */}
          {activeTab === 'ehr' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              <div className="rounded-xl bg-slate-800/70 p-3 border border-slate-700">
                <p className="font-bold text-white">{dogName} · EHR Dossier</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <p>Weight: <strong>28.4 kg</strong></p>
                  <p>Age: <strong>3.5 Years</strong></p>
                  <p>Rabies Vaccine: <strong className="text-emerald-400">Up to date</strong></p>
                  <p>DHPPiL: <strong className="text-emerald-400">Active</strong></p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-800/70 p-3 border border-slate-700">
                <p className="font-bold text-white">Pre-Call AI Triage</p>
                <p className="mt-1 text-slate-300">Risk Assessment: <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-400 font-bold">MODERATE</span></p>
                <p className="mt-1 text-[11px] text-slate-400">Owner noted mild lethargy and soft stool for 18 hours. No vomiting.</p>
              </div>

              <div className="rounded-xl bg-slate-800/70 p-3 border border-slate-700">
                <p className="font-bold text-white">Active Consent Status</p>
                <p className="mt-1 text-emerald-400 text-[11px]">✓ Granted by owner under sovereign consent protocol.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-800 bg-slate-900 px-6 py-4">
        {/* Mic toggle */}
        <button
          type="button"
          onClick={() => setMicMuted(!micMuted)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition ${
            micMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <span>{micMuted ? '🔇' : '🎙️'}</span>
          <span>{micMuted ? 'Mic Muted' : 'Mute Mic'}</span>
        </button>

        {/* Camera toggle */}
        <button
          type="button"
          onClick={() => setCameraOff(!cameraOff)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition ${
            cameraOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <span>{cameraOff ? '🚫' : '📹'}</span>
          <span>{cameraOff ? 'Camera Off' : 'Stop Video'}</span>
        </button>

        {/* Canine Macro Cam switch */}
        <button
          type="button"
          onClick={() => setDogCamMode(!dogCamMode)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition border ${
            dogCamMode
              ? 'bg-amber-600 border-amber-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <span>🐾</span>
          <span>{dogCamMode ? 'Switch to Parent Cam' : 'Switch to Dog Macro Cam'}</span>
        </button>

        {/* Snapshot Dog Symptom button */}
        <button
          type="button"
          onClick={() => alert(`📸 Canine clinical photo captured and attached to Dr. Sharma's in-call notes.`)}
          className="flex items-center gap-1.5 rounded-full bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
        >
          <span>📸</span>
          <span>Snapshot Symptom</span>
        </button>

        {/* End Call Button */}
        <button
          type="button"
          onClick={onEndCall}
          className="flex items-center gap-1.5 rounded-full bg-rose-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition shadow-lg"
        >
          <span>📞</span>
          <span>Leave Tele-Room</span>
        </button>
      </footer>
    </div>
  );
}
