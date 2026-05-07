const colorMap: Record<string, string> = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-primary",
  accent: "bg-accent text-white",
  green: "bg-green-600 text-white",
  purple: "bg-purple-600 text-white",
  orange: "bg-orange-500 text-white",
  teal: "bg-teal-600 text-white",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof colorMap;
  className?: string;
}

export default function Badge({ children, variant = "primary", className = "" }: BadgeProps) {
  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
        colorMap[variant] || colorMap.primary
      } ${className}`}
    >
      {children}
    </span>
  );
}
