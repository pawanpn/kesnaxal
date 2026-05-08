"use client";

import { useAdmin } from "@/hooks/useAdmin";
import { usePathname } from "next/navigation";

export default function EditModeBanner() {
  const { isAdmin, isEditing, isPreviewMode } = useAdmin();
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;
  if (!isAdmin) return null;

  if (isPreviewMode) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] bg-yellow-500 text-black text-center py-1.5 text-xs font-bold tracking-widest shadow-lg">
        PREVIEW MODE — You are viewing unpublished draft changes
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] bg-green-500 text-white text-center py-1.5 text-xs font-bold tracking-widest shadow-lg">
        EDIT MODE ACTIVE — Click any text on the page to edit it
      </div>
    );
  }

  return null;
}
