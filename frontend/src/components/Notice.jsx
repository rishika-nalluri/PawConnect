const TONES = {
  error: 'border-brand-coral/40 bg-brand-coral/5 text-brand-coral',
  success: 'border-brand-teal/30 bg-brand-teal/5 text-brand-teal',
  warning: 'border-brand-amber/40 bg-brand-amber/10 text-brand-amber',
};

export default function Notice({ tone = 'error', children }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-3 py-2 text-sm ${TONES[tone]}`}
    >
      {children}
    </div>
  );
}
