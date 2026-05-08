"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";

interface DraftBadgeProps {
  section: string;
  contentKey: string;
  locale?: string;
}

export default function DraftBadge({ section, contentKey, locale = "en" }: DraftBadgeProps) {
  const { isAdmin, isPreviewMode, hasDraft } = useAdmin();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only admins in preview mode see draft badges
    if (!isAdmin || !isPreviewMode) {
      setShow(false);
      return;
    }
    setShow(hasDraft(section, contentKey, locale));
  }, [isAdmin, isPreviewMode, hasDraft, section, contentKey, locale]);

  if (!show) return null;

  return (
    <span className="ml-1.5 inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300 animate-pulse select-none">
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
      UNPUBLISHED
    </span>
  );
}
