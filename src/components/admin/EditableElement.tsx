"use client";

import { useState, useRef, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useLocale } from "@/hooks/useLocale";
import { resolveContent } from "@/lib/translate";
import type { LocaleContent } from "@/types";

interface EditableElementProps {
  section: string;       // e.g. 'hero', 'about', 'footer'
  contentKey: string;    // e.g. 'title', 'description', 'slide_0_title'
  value: LocaleContent;  // fallback static value (from siteConfig)
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  rich?: boolean;        // show textarea instead of input
}

export default function EditableElement({
  section,
  contentKey,
  value,
  className = "",
  as: Tag = "span",
  rich,
}: EditableElementProps) {
  const { isAdmin, isEditing, addEdit, saveContent, getContent } = useAdmin();
  const { locale } = useLocale();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Resolve current display text: draft > published > fallback
  const contentText = resolveContent(value, locale);
  const dbContent = getContent(section, contentKey, locale);
  const displayText = dbContent || contentText;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleClick = () => {
    if (!isEditing) return;
    setText(displayText);
    setEditing(true);
  };

  const handleBlur = async () => {
    setEditing(false);
    if (text !== displayText) {
      addEdit({
        section,
        contentKey,
        locale,
        oldValue: displayText,
        newValue: text,
        timestamp: Date.now(),
      });
      await saveContent(section, contentKey, locale, text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditing(false);
    }
  };

  if (!isAdmin || !isEditing) {
    return <Tag className={className}>{displayText}</Tag>;
  }

  if (editing) {
    const sharedClassName = `w-full px-2 py-1 rounded border-2 border-primary bg-white/90 text-sm outline-none transition-colors ${className}`;

    if (rich) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`${sharedClassName} resize-y`}
        />
      );
    }

    return (
      <input
        type="text"
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={sharedClassName}
      />
    );
  }

  return (
    <Tag
      onClick={handleClick}
      className={`cursor-pointer hover:bg-primary/10 hover:ring-2 hover:ring-primary/30 rounded px-1 -mx-1 transition-all duration-150 ${className}`}
      title={`Click to edit (${section}.${contentKey})`}
    >
      {displayText}
    </Tag>
  );
}
