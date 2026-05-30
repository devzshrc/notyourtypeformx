"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Back-compat redirect. Embeds now point directly at /form/[id]?embed=1
 * (the form page posts its own resize height), avoiding a nested iframe.
 */
export default function EmbedRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (id) router.replace(`/form/${id}?embed=1`);
  }, [id, router]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background text-sm text-muted-foreground">
      Loading form
    </div>
  );
}
