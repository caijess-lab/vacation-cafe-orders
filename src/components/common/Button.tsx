import type { LucideIcon } from "lucide-react";

interface ButtonProps {
  onClick: () => void;
  label?: string;
  icon: LucideIcon;
}

export default function Button({ onClick, label, icon: Icon }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-emerald-900 shadow-sm transition-all active:scale-95"
    >
      <Icon className="h-4 w-4 stroke-[2.5]" />
      {label ? <span>{label}</span> : null}
    </button>
  );
}
