import { useEffect, useState } from 'react';
import RecordSection from './RecordSection';
import { api, formatDate } from '../lib/api';

const nullIfBlank = (v) => (v === '' || v === undefined ? null : v);

function PrescriptionsSection({ dogId }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadPrescriptions() {
    try {
      const data = await api(`/vetconnect/prescriptions/dog/${dogId}`);
      setPrescriptions(data || []);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrescriptions();
  }, [dogId]);

  return (
    <div className="rounded-xl bg-white p-5 shadow-card md:col-span-2">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
        <span>📋</span> Veterinary Prescriptions
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Clinical prescriptions issued by your consented veterinarians during consultations.
      </p>

      <div className="mt-4">
        {loading ? (
          <p className="text-xs text-slate-500">Loading prescriptions...</p>
        ) : prescriptions.length === 0 ? (
          <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100">
            No veterinary prescriptions recorded yet. Your vet can attach digital prescriptions directly during appointments.
          </p>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((p) => (
              <div key={p.id} className="rounded-xl bg-teal-50/50 p-4 border border-teal-100 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-brand-teal text-sm">Veterinarian</span>
                    <p className="text-[10px] text-slate-400">{formatDate(p.createdAt)}</p>
                  </div>
                  {p.followUpDate && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-brand-amber">
                      Follow-up: {p.followUpDate}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <p className="font-semibold text-slate-700">Medications & Regimen:</p>
                  <p className="mt-0.5 whitespace-pre-line text-slate-800 bg-white p-2.5 rounded-lg border border-teal-100 font-mono text-[11px]">
                    {p.medicationDetails}
                  </p>
                </div>

                {p.generalAdvice && (
                  <div className="mt-2 text-slate-600">
                    <p className="font-semibold text-slate-700">Clinical Instructions:</p>
                    <p className="mt-0.5">{p.generalAdvice}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CarePanel({ dogId }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <RecordSection
        title="Vaccinations"
        listPath={`/dogs/${dogId}/vaccinations`}
        deletePrefix="/vaccinations"
        addLabel="Add vaccination (+50 🪙)"
        fields={[
          { name: 'vaccine_name', label: 'Vaccine name', required: true },
          { name: 'date_given', label: 'Date given', type: 'date', optional: true },
          { name: 'next_due_date', label: 'Next due date', type: 'date', optional: true },
        ]}
        toBody={(v) => ({
          vaccineName: v.vaccine_name.trim(),
          dateGiven: nullIfBlank(v.date_given),
          nextDueDate: nullIfBlank(v.next_due_date),
        })}
        describe={(r) => `${r.vaccine_name} · given ${r.date_given || '—'} · due ${r.next_due_date || '—'}`}
      />
      <RecordSection
        title="Medications"
        listPath={`/dogs/${dogId}/medications`}
        deletePrefix="/medications"
        addLabel="Add medication"
        fields={[
          { name: 'medication_name', label: 'Medication', required: true },
          { name: 'dosage', label: 'Dosage as prescribed', optional: true },
          { name: 'schedule', label: 'Schedule (e.g. twice daily)', optional: true },
          { name: 'start_date', label: 'Start date', type: 'date', optional: true },
          { name: 'end_date', label: 'End date', type: 'date', optional: true },
        ]}
        toBody={(v) => ({
          medicationName: v.medication_name.trim(),
          dosage: nullIfBlank(v.dosage),
          schedule: nullIfBlank(v.schedule),
          startDate: nullIfBlank(v.start_date),
          endDate: nullIfBlank(v.end_date),
        })}
        describe={(r) => `${r.medication_name}${r.dosage ? ` · ${r.dosage}` : ''}${r.schedule ? ` · ${r.schedule}` : ''} · ${r.start_date || '—'} to ${r.end_date || 'ongoing'}`}
      />
      <PrescriptionsSection dogId={dogId} />
    </div>
  );
}
