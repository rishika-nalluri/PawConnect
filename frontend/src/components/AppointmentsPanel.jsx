import { useCallback, useEffect, useState } from 'react';
import { api, formatDate } from '../lib/api';
import { supabase } from '../supabaseClient';
import Notice from './Notice';
import { btnPrimary, linkClass } from './styles';

const STATUS_STYLE = {
  PENDING: 'bg-brand-amber/15 text-brand-amber',
  CONFIRMED: 'bg-brand-teal/10 text-brand-teal',
  COMPLETED: 'bg-slate-200 text-slate-700',
  CANCELLED: 'bg-brand-coral/15 text-brand-coral',
};

const STATUS_LABEL = {
  PENDING: 'Awaiting vet',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

function useCurrentUserId() {
  const [id, setId] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setId(data?.user?.id ?? null)).catch(() => setId(null));
  }, []);
  return id;
}

function Thread({ appointmentId, canPost, me }) {
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setMessages(await api(`/vetconnect/messages/appointment/${appointmentId}`));
    } catch (e) {
      setError(e.message);
    }
  }, [appointmentId]);

  useEffect(() => { load(); }, [load]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    try {
      await api('/vetconnect/messages', {
        method: 'POST',
        body: { appointmentId, messageText: text.trim() },
      });
      setText('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mt-4 rounded-lg bg-brand-sand p-4">
      <ul className="max-h-64 space-y-3 overflow-y-auto text-sm">
        {messages?.map((m) => (
          <li key={m.id}>
            <span className="font-semibold text-slate-800">{m.senderId === me ? 'You' : 'Other party'}</span>{' '}
            <span className="text-xs text-slate-500">{formatDate(m.sentAt)}</span>
            <p className="text-slate-700">{m.messageText}</p>
          </li>
        ))}
        {messages?.length === 0 && <li className="text-slate-500">No messages yet.</li>}
      </ul>

      {canPost ? (
        <form onSubmit={send} className="mt-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            placeholder="Write a message"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <button type="submit" className={`${btnPrimary} w-auto px-4`}>Send</button>
        </form>
      ) : (
        <p className="mt-3 text-xs text-slate-500">Messaging is closed for cancelled appointments.</p>
      )}
      {error && <div className="mt-3"><Notice>{error}</Notice></div>}
    </div>
  );
}

/** Offers only veterinarians who hold active consent for this dog and are verified. */
function BookForm({ dogId, onBooked }) {
  const [options, setOptions] = useState(null);
  const [vetId, setVetId] = useState('');
  const [when, setWhen] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api(`/consent/dog/${dogId}`), api('/profiles/vets/verified')])
      .then(([grants, vets]) => {
        const active = new Set(grants.filter((g) => !g.revokedAt).map((g) => g.vetId));
        setOptions(vets.filter((v) => active.has(v.profileId)));
      })
      .catch((e) => setError(e.message));
  }, [dogId]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/vetconnect/appointments', {
        method: 'POST',
        body: {
          dogId,
          vetId,
          scheduledAt: new Date(when).toISOString(),
          reason: reason.trim() || null,
        },
      });
      setVetId('');
      setWhen('');
      setReason('');
      onBooked();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (options === null && !error) return <p className="text-sm text-slate-500">Checking veterinarian access…</p>;
  if (options?.length === 0) {
    return <p className="text-sm text-slate-500">Grant a verified veterinarian access to this dog to book an appointment.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <h4 className="font-semibold text-slate-900">Book an appointment</h4>
      <label className="block text-sm font-medium text-slate-700">
        Veterinarian
        <select
          required
          value={vetId}
          onChange={(e) => setVetId(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">Choose…</option>
          {options?.map((v) => (
            <option key={v.profileId} value={v.profileId}>
              {v.clinicName || 'Veterinarian'}{v.specialization ? ` · ${v.specialization}` : ''}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Date and time
        <input
          required
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Reason (optional)
        <input
          value={reason}
          maxLength={500}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
        />
      </label>
      {error && <Notice>{error}</Notice>}
      <button type="submit" disabled={busy} className={btnPrimary}>Request appointment</button>
    </form>
  );
}

/** role PET_PARENT: optionally limited to one dog. role VET: the vet's own appointments. */
export default function AppointmentsPanel({ role, dogId = null }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const me = useCurrentUserId();
  const isOwner = role === 'PET_PARENT';

  const load = useCallback(async () => {
    try {
      const list = await api('/vetconnect/appointments');
      setRows(dogId ? list.filter((a) => a.dogId === dogId) : list);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [dogId]);

  useEffect(() => { load(); }, [load]);

  async function setStatus(id, status) {
    setError('');
    try {
      await api(`/vetconnect/appointments/${id}/status`, { method: 'PATCH', body: { status } });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Appointments</h2>

      {isOwner && dogId && (
        <div className="rounded-xl bg-white p-5 shadow-card">
          <BookForm dogId={dogId} onBooked={load} />
        </div>
      )}

      {error && <Notice>{error}</Notice>}
      {rows === null && !error && <p className="text-sm text-slate-500">Loading appointments…</p>}
      {rows?.length === 0 && <p className="text-sm text-slate-500">No appointments yet.</p>}

      <ul className="space-y-3">
        {rows?.map((a) => (
          <li key={a.id} className="rounded-xl bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">
                  {isOwner ? 'Veterinary visit' : 'Patient visit'}
                </p>
                <p className="text-sm text-slate-600">{formatDate(a.scheduledAt)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[a.status] || ''}`}>
                {STATUS_LABEL[a.status] || a.status}
              </span>
            </div>
            {a.reason && <p className="mt-2 text-sm text-slate-700">Reason: {a.reason}</p>}
            {a.notes && <p className="mt-2 text-sm text-slate-700">Notes: {a.notes}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              {isOwner && ['PENDING', 'CONFIRMED'].includes(a.status) && (
                <button type="button" className={`${linkClass} text-brand-coral`}
                  onClick={() => setStatus(a.id, 'CANCELLED')}>Cancel</button>
              )}

              {!isOwner && a.status === 'PENDING' && (
                <>
                  <button type="button" className={linkClass} onClick={() => setStatus(a.id, 'CONFIRMED')}>Confirm</button>
                  <button type="button" className={`${linkClass} text-brand-coral`}
                    onClick={() => setStatus(a.id, 'CANCELLED')}>Decline</button>
                </>
              )}

              {!isOwner && a.status === 'CONFIRMED' && (
                <button type="button" className={linkClass} onClick={() => setStatus(a.id, 'COMPLETED')}>
                  Mark completed
                </button>
              )}

              <button type="button" className={linkClass}
                onClick={() => setOpenId(openId === a.id ? null : a.id)}>
                {openId === a.id ? 'Hide messages' : 'Messages'}
              </button>
            </div>

            {openId === a.id && (
              <Thread appointmentId={a.id} canPost={a.status !== 'CANCELLED'} me={me} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
