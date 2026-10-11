import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import Notice from '../components/Notice';
import { linkClass } from '../components/styles';

const ROLE_NAMES = { VET: 'Veterinarian', NGO: 'NGO' };

export default function AdminPage() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems(await api('/admin/verifications'));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function viewDocument(id) {
    setError('');
    try {
      const { url } = await api(`/admin/verifications/${id}/document-url`);
      window.open(url, '_blank', 'noopener');
    } catch (e) {
      setError(e.message);
    }
  }

  async function decide(id, decision) {
    setError('');
    setBusyId(id);
    try {
      await api(`/admin/verifications/${id}`, { method: 'POST', body: { decision } });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div>
        <p className="text-sm font-medium text-brand-teal">Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Pending verifications</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review each registration and its document, then approve or reject it. The applicant is emailed
          the decision.
        </p>
      </div>

      {error && <Notice>{error}</Notice>}
      {items === null && !error && <p className="text-sm text-slate-500">Loading…</p>}
      {items?.length === 0 && <p className="text-sm text-slate-500">Nothing waiting for review.</p>}

      <ul className="space-y-4">
        {items?.map((p) => (
          <li key={p.id} className="rounded-2xl bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-coral">
                  {ROLE_NAMES[p.role] || p.role}
                </p>
                <h2 className="mt-1 font-semibold text-slate-900">{p.full_name}</h2>
                <p className="text-sm text-slate-600">{p.email}</p>
                <p className="mt-2 text-sm text-slate-700">
                  {p.organisation || '—'} · Registration no. {p.registration_number || '—'}
                </p>
                {!p.document_path && <p className="mt-2 text-xs text-brand-amber">No document uploaded yet.</p>}
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                {p.document_path && (
                  <button type="button" className={linkClass} onClick={() => viewDocument(p.id)}>
                    View document
                  </button>
                )}
                <button type="button" disabled={busyId === p.id} className={`${linkClass} text-brand-teal`}
                  onClick={() => decide(p.id, 'VERIFIED')}>Approve</button>
                <button type="button" disabled={busyId === p.id} className={`${linkClass} text-brand-coral`}
                  onClick={() => decide(p.id, 'REJECTED')}>Reject</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
