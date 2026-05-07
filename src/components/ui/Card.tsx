import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: "none" | "small" | "normal" | "large";
}

export default function Card({
  children,
  className = "",
  hover = true,
  onClick,
  padding = "normal",
}: CardProps) {
  const paddingMap = {
    none: "",
    small: "p-3",
    normal: "p-5",
    large: "p-6 lg:p-8",
  };

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden border border-border ${
        hover ? "shadow-sm hover:shadow-md transition-shadow" : ""
      } ${paddingMap[padding]} ${className}`}
      {...(onClick ? { onClick, role: "button", tabIndex: 0 } : {})}
    >
      {children}
    </div>
  );
}
