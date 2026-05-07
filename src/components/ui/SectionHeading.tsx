interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`mb-8 ${align === "center" ? "text-center" : ""} ${className}`}>
      <div
        className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
      >
        <span className="w-1 h-6 bg-primary rounded-full" />
        <h2 className="text-2xl lg:text-3xl font-heading font-bold text-primary">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-muted text-sm mt-2 max-w-lg">{subtitle}</p>
      )}
    </div>
  );
}
