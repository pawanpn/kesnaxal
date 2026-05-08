"use client";

import Image from "next/image";
import { useSiteContent } from "@/hooks/useSiteContent";

interface SiteLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export default function SiteLogo({ size = 48, className = "h-9 lg:h-12 w-auto object-contain", priority = false }: SiteLogoProps) {
  const { getText } = useSiteContent("global", "en");
  const logoUrl = getText("logo_url") || "/data/logo.jpg";

  return (
    <Image
      src={logoUrl}
      alt="KE School Logo"
      width={size}
      height={size}
      className={className}
      priority={priority}
      unoptimized={logoUrl.startsWith("http")}
    />
  );
}
