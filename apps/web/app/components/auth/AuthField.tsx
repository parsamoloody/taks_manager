interface AuthFieldProps {
  label: string;
  type: string;
  value: string;
  placeholder: string;
  autoComplete?: string;
  onChange: (value: string) => void;
}

export function AuthField({
  label,
  type,
  value,
  placeholder,
  autoComplete,
  onChange,
}: AuthFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          required
        />
      </div>
    </label>
  );
}
