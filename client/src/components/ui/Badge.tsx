interface BadgeProps {
  variant: "success" | "warning" | "error" | "info" | "neutral";
  children: React.ReactNode;
}

const variantClasses: Record<BadgeProps["variant"], string> = {
  success: "bg-primary-fixed text-primary",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-error-container text-on-error-container",
  info: "bg-blue-100 text-blue-800",
  neutral: "bg-surface-container text-on-surface-variant",
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
