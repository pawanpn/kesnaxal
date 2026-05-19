"use client";
import Image from "next/image";
import type { CSSProperties } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  style?: CSSProperties;
  onClick?: () => void;
  fallback?: string;
}

function isValidSrc(src: string): boolean {
  if (!src || typeof src !== "string" || src.trim() === "") return false;
  if (src.startsWith("http://") || src.startsWith("https://")) return true;
  if (src.startsWith("/")) return true;
  if (src.startsWith("data:")) return true;
  return false;
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  className = "",
  sizes,
  style,
  onClick,
  fallback = "/data/placeholder.jpg",
}: OptimizedImageProps) {
  const computedSizes =
    sizes ??
    (fill
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
      : undefined);

  const validSrc = isValidSrc(src) ? src : isValidSrc(fallback) ? fallback : null;
  if (!validSrc) return null;

  const isExternal = validSrc.startsWith("http://") || validSrc.startsWith("https://");
  const isSupabase = validSrc.includes("supabase.co");
  const unoptimized = isExternal && !isSupabase;

  if (fill) {
    return (
      <Image
        src={validSrc}
        alt={alt}
        fill
        priority={priority}
        className={className}
        sizes={computedSizes}
        unoptimized={unoptimized}
        onError={(e) => {
          const target = e.currentTarget;
          if (isValidSrc(fallback) && target.src !== fallback) {
            target.src = fallback;
          }
        }}
        {...(onClick ? { onClick } : {})}
        {...(style ? { style } : {})}
      />
    );
  }

  return (
    <Image
      src={validSrc}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      priority={priority}
      className={className}
      sizes={computedSizes}
      unoptimized={unoptimized}
      onError={(e) => {
        const target = e.currentTarget;
        if (isValidSrc(fallback) && target.src !== fallback) {
          target.src = fallback;
        }
      }}
      {...(onClick ? { onClick } : {})}
      {...(style ? { style } : {})}
    />
  );
}
