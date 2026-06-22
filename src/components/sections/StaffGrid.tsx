"use client";
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

export default function StaffGrid({ staff, title, loading = false }: StaffGridProps) {
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
                    <p className="text-xs text-muted">{member.department}</p>
                  )}
                </div>
              </BorderGlow>
            );
          })}
        </div>
      </div>
    </section>
  );
}

