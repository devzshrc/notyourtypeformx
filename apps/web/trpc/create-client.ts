import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

/**
 * In the browser, call the SAME origin (/trpc) so the Next rewrite proxies to the API
 * and the auth cookie stays first-party. On the server (RSC) there is no origin, so use
 * the absolute API target. Keep in sync with `API_PROXY_TARGET` in next.config.js.
 */
function resolveTrpcUrl(): string {
  if (typeof window !== "undefined") return "/trpc";
  const target = (process.env.API_PROXY_TARGET ?? "http://localhost:8000").replace(/\/+$/, "");
  return `${target}/trpc`;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return c({
    url: resolveTrpcUrl(),
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
