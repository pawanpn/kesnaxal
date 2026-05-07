interface PageHeroProps {
  title: string;
  subtitle?: string;
}

export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="bg-primary py-12 lg:py-16">
      <div className="container-custom text-center">
        <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-200 max-w-xl mx-auto text-sm">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
