import IconBox from "@/components/ui/IconBox";
import type { ValueCard as ValueCardType } from "@/types";

interface ValueCardsProps {
  cards: ValueCardType[];
  title?: string;
}

export default function ValueCards({ cards, title }: ValueCardsProps) {
  return (
    <section className="py-12 lg:py-16 bg-surface">
      <div className="container-custom">
        {title && <h2 className="text-2xl font-heading font-bold text-primary text-center mb-10">{title}</h2>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((v) => (
            <div key={v.title} className="bg-white rounded-xl p-6 text-center shadow-sm border border-border hover:shadow-md transition-shadow">
              <IconBox icon={v.icon} size="lg" />
              <h3 className="font-heading font-bold text-foreground mb-2">{v.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
