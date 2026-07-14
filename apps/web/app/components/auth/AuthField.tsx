// app/components/auth/AuthField.tsx
interface AuthFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
}

export function AuthField({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  defaultValue,
}: AuthFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
      />
    </div>
  );
}