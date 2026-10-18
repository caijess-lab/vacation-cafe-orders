import type { PointerEvent as ReactPointerEvent } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps {
  onClick?: () => void;
  label?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
  className?: string;
  type?: 'button' | 'submit';
  ariaCurrent?: 'page';
  onPointerDown?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  iconSize?: number;
  iconStrokeWidth?: number;
}

export default function Button({
  onClick,
  label,
  icon: Icon,
  disabled = false,
  ariaLabel,
  title,
  className = '',
  type = 'button',
  ariaCurrent,
  onPointerDown,
  iconSize,
  iconStrokeWidth,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      onPointerDown={onPointerDown}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      aria-current={ariaCurrent}
      className={className}
    >
      {Icon && (
        <Icon
          aria-hidden="true"
          size={iconSize}
          strokeWidth={iconStrokeWidth}
        />
      )}
      {label && <span>{label}</span>}
    </button>
  );
}
