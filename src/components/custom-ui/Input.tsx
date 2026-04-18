import clsx from "clsx";

interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  label: string;
  error?: string;
  className?: string;
  onChange?: (val: string) => void;
  onRawChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Input({
  label,
  className,
  error,
  value,
  onChange,
  onRawChange,
  ...props
}: InputProps) {
  return (
    <div className={clsx("flex w-full flex-col gap-1.5", className)}>
      <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <input
        {...props}
        className={clsx(
          "input-primary text-[13px]!",
          props.disabled && "opacity-30",
        )}
        value={value ?? ""}
        onChange={(e) => {
          onChange?.(e.target.value);
          onRawChange?.(e);
        }}
      />
      {error && <p className="text-[12px] text-red-500 italic">{error}</p>}
    </div>
  );
}

interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> {
  label: string;
  error?: string;
  className?: string;
  onChange?: (val: string) => void;
  onRawChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function Textarea({
  label,
  className,
  error,
  value,
  onChange,
  onRawChange,
  rows = 4,
  ...props
}: TextareaProps) {
  return (
    <div className={clsx("flex w-full flex-col gap-1.5", className)}>
      <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <textarea
        {...props}
        rows={rows}
        className={clsx(
          "input-primary min-h-[100px] w-full py-3 text-[13px]!",
          props.disabled && "opacity-50",
        )}
        value={value ?? ""}
        onChange={(e) => {
          onChange?.(e.target.value);
          onRawChange?.(e);
        }}
      />
      {error && <p className="text-[12px] text-red-500 italic">{error}</p>}
    </div>
  );
}
