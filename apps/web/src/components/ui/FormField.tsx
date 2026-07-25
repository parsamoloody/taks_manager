import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "~/lib/cn";

const controlClass =
  "min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-2.5 text-sm text-white [color-scheme:dark] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/15 disabled:cursor-not-allowed disabled:opacity-60";

interface FieldShellProps {
  id: string;
  label?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

function FieldShell({
  id,
  label,
  optional,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={className}>
      {label ? (
        <label
          htmlFor={id}
          className="mb-1.5 block text-xs font-semibold text-slate-300"
        >
          {label}{" "}
          {optional ? <span className="text-slate-500">(optional)</span> : null}
        </label>
      ) : null}
      {children}
    </div>
  );
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  optional?: boolean;
  wrapperClassName?: string;
}

export function FormInput({
  label,
  optional,
  wrapperClassName,
  className,
  id,
  name,
  ...props
}: FormInputProps) {
  const fieldId = id ?? name;
  if (!fieldId) throw new Error("FormInput requires an id or name");

  return (
    <FieldShell
      id={fieldId}
      label={label}
      optional={optional}
      className={wrapperClassName}
    >
      <input
        id={fieldId}
        name={name}
        className={cn(controlClass, className)}
        {...props}
      />
    </FieldShell>
  );
}

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  optional?: boolean;
  wrapperClassName?: string;
}

export function FormTextarea({
  label,
  optional,
  wrapperClassName,
  className,
  id,
  name,
  ...props
}: FormTextareaProps) {
  const fieldId = id ?? name;
  if (!fieldId) throw new Error("FormTextarea requires an id or name");

  return (
    <FieldShell
      id={fieldId}
      label={label}
      optional={optional}
      className={wrapperClassName}
    >
      <textarea
        id={fieldId}
        name={name}
        className={cn(controlClass, "resize-none", className)}
        {...props}
      />
    </FieldShell>
  );
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  optional?: boolean;
  wrapperClassName?: string;
}

export function FormSelect({
  label,
  optional,
  wrapperClassName,
  className,
  id,
  name,
  children,
  ...props
}: FormSelectProps) {
  const fieldId = id ?? name;
  if (!fieldId) throw new Error("FormSelect requires an id or name");

  return (
    <FieldShell
      id={fieldId}
      label={label}
      optional={optional}
      className={wrapperClassName}
    >
      <select
        id={fieldId}
        name={name}
        className={cn(controlClass, className)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}
