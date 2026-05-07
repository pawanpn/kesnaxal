"use client";

import { useAdmin } from "@/hooks/useAdmin";

export default function EditModeBanner() {
  const { isAdmin, isEditing } = useAdmin();

  if (!isAdmin || !isEditing) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-green-500 text-white text-center py-1.5 text-xs font-bold tracking-widest shadow-lg">
      EDIT MODE ACTIVE — Click any text on the page to edit it
    </div>
  );
}
