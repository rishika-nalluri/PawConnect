import { forwardRef } from 'react';

/** A labelled text input that works with react-hook-form's register(). */
const Field = forwardRef(function Field({ label, error, hint, id, ...props }, ref) {
  const inputId = id || props.name;
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        aria-invalid={error ? 'true' : 'false'}
        className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-brand-teal/25 ${
          error ? 'border-brand-coral' : 'border-slate-300 focus:border-brand-teal'
        }`}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-brand-coral">{error}</p>}
    </div>
  );
});

export default Field;
