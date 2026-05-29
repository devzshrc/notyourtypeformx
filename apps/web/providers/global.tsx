"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { useState } from "react";
import { Toaster } from "~/components/ui/sonner";

import { trpc } from "~/trpc/client";
import { createTRPCHttpBatchClientClient } from "~/trpc/create-client";
import { env } from "~/env.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: true,
      staleTime: Infinity,
    },
  },
});

const googleClientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export const GlobalProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [createTRPCHttpBatchClientClient()],
    }),
  );
  const tree = (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider queryClient={queryClient} client={trpcClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </trpc.Provider>
    </QueryClientProvider>
  );
  // Only mount the Google provider when configured, so the app runs without a client id.
  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>
  ) : (
    tree
  );
};
