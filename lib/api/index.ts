import type { ApiClient } from "./types";
import { mockApi } from "./mock";
import { realApi } from "./real";

/**
 * The single object every screen talks to.
 *
 * Mock is the default. Set NEXT_PUBLIC_USE_MOCK_API=false in .env.local to
 * point the app at the Django API instead. Defaulting this way means a fresh
 * clone runs with no configuration and no backend, which is what a prototype
 * needs; forgetting the flag can never silently send demo traffic at a real
 * server, because the real client is the one you have to opt into.
 */
const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

export const api: ApiClient = useMock ? mockApi : realApi;

export type { ApiClient };
