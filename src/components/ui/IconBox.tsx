import { type ReactNode } from "react";

interface IconBoxProps {
  icon: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function IconBox({ icon, size = "md", className = "" }: IconBoxProps) {
  const sizeMap = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  return (
    <div
      className={`text-primary ${sizeMap[size]} rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 ${className}`}
    >
      {icon}
    </div>
  );
}
