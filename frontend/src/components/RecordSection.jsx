import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../lib/api';
import Field from './Field';
import Notice from './Notice';
import { btnPrimary, linkClass } from './styles';

/**
 * A list-and-add section used for vaccinations and medications.
 * fields: [{ name, label, type?, required?, optional? }]
 */
export default function RecordSection({ title, listPath, deletePrefix, fields, toBody, describe, addLabel }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const defaults = Object.fromEntries(fields.map((f) => [f.name, '']));
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: defaults });

  const load = useCallback(async () => {
    try {
      setRows(await api(listPath));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [listPath]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (values) => {
    setError('');
    try {
      await api(listPath, { method: 'POST', body: toBody(values) });
      reset(defaults);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (id) => {
    setError('');
    try {
      await api(`${deletePrefix}/${id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-card">
      <h3 className="font-semibold text-slate-900">{title}</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-3">
        {fields.map((f) => (
          <Field
            key={f.name}
            label={`${f.label}${f.optional ? ' (optional)' : ''}`}
            type={f.type || 'text'}
            error={errors[f.name]?.message}
            {...register(f.name, f.required ? { required: `${f.label} is required` } : {})}
          />
        ))}
        <button type="submit" disabled={isSubmitting} className={btnPrimary}>{addLabel}</button>
      </form>

      {error && <div className="mt-3"><Notice>{error}</Notice></div>}

      <ul className="mt-4 space-y-2 text-sm">
        {rows === null && <li className="text-slate-500">Loading…</li>}
        {rows?.length === 0 && <li className="text-slate-500">Nothing recorded yet.</li>}
        {rows?.map((r) => (
          <li key={r.id} className="flex items-start justify-between gap-3 rounded-lg bg-brand-sand px-3 py-2">
            <span>{describe(r)}</span>
            <button type="button" onClick={() => remove(r.id)} className={`${linkClass} shrink-0 text-brand-coral`}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
