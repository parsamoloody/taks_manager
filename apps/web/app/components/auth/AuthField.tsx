import { FormInput } from "~/components/ui/FormField";

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
      <FormInput
        name={name}
        label={label}
        type={type}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
      />
  );
}
