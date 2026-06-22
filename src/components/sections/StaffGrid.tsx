"use client";

import { useState } from "react";
import EditableImage from "@/components/admin/EditableImage";
import SectionHeading from "@/components/ui/SectionHeading";
import BorderGlow from "@/components/ui/BorderGlow";
import type { StaffMember } from "@/types";

interface StaffGridProps {
  staff: StaffMember[];
  title?: string;
  loading?: boolean;
}

const glowColors = ["#3b82f6", "#6366f1", "#8b5cf6"];
const PLACEHOLDER_PHOTO = "/data/placeholder.jpg";

const CATEGORY_STYLES: Record<string, string> = {
  teaching: "bg-blue-50 text-blue-700 border-blue-200",
  administration: "bg-purple-50 text-purple-700 border-purple-200",
  support: "bg-green-50 text-green-700 border-green-200",
};

const CATEGORY_LABELS: Record<string, string> = {
  teaching: "Teaching",
  administration: "Administration",
  support: "Support Staff",
};

export default function StaffGrid({ staff, title, loading = false }: StaffGridProps) {
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);

  if (loading) {
    return (
      <section className="py-12 lg:py-16">
        <div className="container-custom">
          {title && (
            <SectionHeading
              title={title}
              subtitle="Meet the dedicated professionals behind KES"
              align="center"
            />
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-surface animate-pulse">
                <div className="h-56 bg-gray-200 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
                  <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!staff || staff.length === 0) {
    return (
      <section className="py-12 lg:py-16">
        <div className="container-custom">
          {title && (
            <SectionHeading
              title={title}
              subtitle="Meet the dedicated professionals behind KES"
              align="center"
            />
          )}
          <p className="text-center text-muted py-16">No team members found.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-12 lg:py-16">
        <div className="container-custom">
          {title && (
            <SectionHeading
              title={title}
              subtitle="Meet the dedicated professionals behind KES"
              align="center"
            />
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {staff.filter(Boolean).map((member) => {
              const photoSrc =
                member.photo &&
                (member.photo.startsWith("http") || member.photo.startsWith("/"))
                  ? member.photo
                  : PLACEHOLDER_PHOTO;

              const catStyle = CATEGORY_STYLES[member.category || "teaching"] || CATEGORY_STYLES.teaching;
              const catLabel = CATEGORY_LABELS[member.category || "teaching"] || "Teaching";

              return (
                <BorderGlow
                  key={member.id}
                  borderRadius={16}
                  backgroundColor="#ffffff"
                  glowRadius={20}
                  edgeSensitivity={25}
                  glowIntensity={0.8}
                  coneSpread={14}
                  colors={glowColors}
                  glowColor="220 60 55"
                  fillOpacity={0.3}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="h-56 overflow-hidden bg-surface rounded-t-2xl">
                      <EditableImage
                        section="staff"
                        contentKey={`staff_${member.id}_photo`}
                        src={photoSrc}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-heading font-bold text-sm text-foreground mb-1">
                        {member.name}
                      </h3>
                      <p className="text-xs text-primary font-semibold mb-1">
                        {member.designation}
                      </p>
                      {member.department && (
                        <p className="text-xs text-muted mb-1.5">{member.department}</p>
                      )}
                      {member.category && (
                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full border font-semibold ${catStyle}`}>
                          {catLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </BorderGlow>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 bg-surface">
              {selectedMember.photo && (selectedMember.photo.startsWith("http") || selectedMember.photo.startsWith("/")) ? (
                <img
                  src={selectedMember.photo}
                  alt={selectedMember.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                  <svg className="w-20 h-20 text-primary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              )}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-foreground hover:bg-white shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-heading font-bold text-foreground">{selectedMember.name}</h2>
                <p className="text-primary font-semibold text-sm mt-0.5">{selectedMember.designation}</p>
                {selectedMember.category && (
                  <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${CATEGORY_STYLES[selectedMember.category] || CATEGORY_STYLES.teaching}`}>
                    {CATEGORY_LABELS[selectedMember.category] || "Teaching"}
                  </span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                {selectedMember.department && (
                  <div className="flex gap-2">
                    <span className="text-muted shrink-0">Department:</span>
                    <span className="text-foreground font-medium">{selectedMember.department}</span>
                  </div>
                )}
                {selectedMember.qualification && (
                  <div className="flex gap-2">
                    <span className="text-muted shrink-0">Qualification:</span>
                    <span className="text-foreground font-medium">{selectedMember.qualification}</span>
                  </div>
                )}
                {selectedMember.email && (
                  <div className="flex gap-2">
                    <span className="text-muted shrink-0">Email:</span>
                    <a href={`mailto:${selectedMember.email}`} className="text-primary hover:underline">{selectedMember.email}</a>
                  </div>
                )}
                {selectedMember.bio && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-muted text-xs leading-relaxed">{selectedMember.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
