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
}: OptimizedImageProps) {
  const computedSizes =
    sizes ??
    (fill
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
      : undefined);

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={className}
        sizes={computedSizes}
        {...(onClick ? { onClick } : {})}
        {...(style ? { style } : {})}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      priority={priority}
      className={className}
      sizes={computedSizes}
      {...(onClick ? { onClick } : {})}
      {...(style ? { style } : {})}
    />
  );
}
