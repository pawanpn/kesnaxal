"use client";

import EditableImage from "@/components/admin/EditableImage";
import EditableElement from "@/components/admin/EditableElement";
import SectionHeading from "@/components/ui/SectionHeading";
import type { StaffMember } from "@/types";

interface StaffGridProps {
  staff: StaffMember[];
  title?: string;
}

export default function StaffGrid({ staff, title }: StaffGridProps) {
  return (
    <section className="py-12 lg:py-16">
      <div className="container-custom">
        {title && <SectionHeading title={title} subtitle="Meet the dedicated professionals behind KES" align="center" />}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {staff.map((member) => (
            <div
              key={member.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-border hover:border-primary/30"
            >
              <div className="relative h-56 overflow-hidden bg-surface">
                <EditableImage
                  section="staff"
                  contentKey={`staff_${member.id}_photo`}
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-heading font-bold text-sm text-foreground mb-1">
                  <EditableElement
                    section="staff"
                    contentKey={`staff_${member.id}_name`}
                    value={{ en: member.name, ne: member.name, ja: member.name }}
                    as="span"
                  />
                </h3>
                <p className="text-xs text-primary font-semibold mb-1">
                  <EditableElement
                    section="staff"
                    contentKey={`staff_${member.id}_designation`}
                    value={{ en: member.designation, ne: member.designation, ja: member.designation }}
                    as="span"
                  />
                </p>
                {member.department && (
                  <p className="text-xs text-muted">
                    <EditableElement
                      section="staff"
                      contentKey={`staff_${member.id}_department`}
                      value={{ en: member.department, ne: member.department, ja: member.department }}
                      as="span"
                    />
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
