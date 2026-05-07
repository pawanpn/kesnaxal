"use client";

import { useState, useRef } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import OptimizedImage from "@/components/ui/OptimizedImage";

interface EditableImageProps {
  section: string;
  contentKey: string;
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export default function EditableImage({
  section,
  contentKey,
  src,
  alt,
  className = "",
  fill,
  width,
  height,
  priority,
  sizes,
}: EditableImageProps) {
  const { isAdmin, isEditing, uploadMedia, addEdit } = useAdmin();
  const [currentSrc, setCurrentSrc] = useState(src);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const publicUrl = await uploadMedia(file, section, contentKey);
    if (publicUrl) {
      addEdit({
        section,
        contentKey,
        locale: "*",
        oldValue: currentSrc,
        newValue: publicUrl,
        timestamp: Date.now(),
      });
      setCurrentSrc(publicUrl);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className={`relative group ${fill ? "h-full w-full" : "inline-block"} ${isAdmin && isEditing ? "cursor-pointer" : ""}`}
      onClick={handleClick}
    >
      {uploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-inherit">
          <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
        </div>
      )}
      <OptimizedImage
        src={currentSrc}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={`${className} ${isAdmin && isEditing ? "group-hover:ring-2 group-hover:ring-primary/50 group-hover:brightness-90 transition-all duration-200" : ""}`}
      />
      {isAdmin && isEditing && (
        <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
          Edit
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
