"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export function usePrefetch() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const prefetch = (href: string) => {
    router.prefetch(href);
    if (href.startsWith("/admin") || href.startsWith("#")) return;
    queryClient.prefetchQuery({
      queryKey: ["site_content", false],
      queryFn: async () => {
        const { supabase } = await import("@/lib/supabase/client");
        const { data } = await supabase.from("site_content").select("*").limit(5000);
        return (data || []) as import("@/context/AdminContext").SiteContentRow[];
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return prefetch;
}

