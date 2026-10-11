import { useState } from 'react';
import { api } from '../lib/api';
import { supabase } from '../supabaseClient';
import Notice from './Notice';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/**
 * Uploads a verification document to the private Supabase bucket, inside the user's own folder,
 * then tells the backend which file to review. Admins read it through short-lived links.
 */
export default function VerificationUpload({ userId, label, onUploaded }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage({ tone: 'error', text: 'Upload a PDF, JPG or PNG file.' });
      return;
    }
    if (file.size > MAX_BYTES) {
      setMessage({ tone: 'error', text: 'The file must be 5 MB or smaller.' });
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, '_');
      const path = `${userId}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from('verification-docs')
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw new Error(error.message);

      await api('/profiles/me/verification-document', { method: 'POST', body: { path } });
      setMessage({ tone: 'success', text: 'Document uploaded. We will review it shortly.' });
      onUploaded?.();
    } catch (err) {
      setMessage({ tone: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h2 className="font-semibold text-slate-900">Upload your {label}</h2>
      <p className="mt-2 text-sm text-slate-600">
        PDF, JPG or PNG, up to 5 MB. Only PawConnect admins can view this file.
      </p>
      <label className="mt-4 inline-block cursor-pointer rounded-lg bg-brand-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-teal-dark">
        {busy ? 'Uploading…' : 'Choose file'}
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFile}
          disabled={busy}
          className="hidden"
        />
      </label>
      {message && <div className="mt-4"><Notice tone={message.tone}>{message.text}</Notice></div>}
    </div>
  );
}
