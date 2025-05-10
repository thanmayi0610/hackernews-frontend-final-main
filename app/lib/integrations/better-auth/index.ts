import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
export const betterAuthClient = createAuthClient({
  baseURL:API_BASE,
  plugins: [nextCookies(), usernameClient()],
});



