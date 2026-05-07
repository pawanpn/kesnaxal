"use client";

import { useT } from "@/hooks/useLocale";

export default function SubscribeCTA() {
  const t = useT();
  return (
    <section className="py-12 bg-primary-dark">
      <div className="container-custom text-center">
        <h2 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-3">{t.sections.NeverMissUpdate}</h2>
        <p className="text-gray-300 max-w-lg mx-auto text-sm mb-6">
          {t.sections.SubscribeCTADetail}
        </p>
        <form className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
          <input type="email" placeholder={t.forms.subscribePlaceholder} className="w-full sm:flex-1 px-4 py-3 rounded-lg text-sm bg-white text-foreground outline-none border-2 border-transparent focus:border-secondary transition-colors" />
          <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-secondary text-primary rounded-lg text-sm font-bold hover:bg-secondary-dark transition-colors whitespace-nowrap">{t.forms.subscribeNow}</button>
        </form>
      </div>
    </section>
  );
}
