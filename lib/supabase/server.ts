import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client, for Server Components, Server Actions and Route
 * Handlers.
 *
 * `cookies()` is asynchronous in Next 16, so this factory is async and every
 * caller must await it — `app/actions/auth.ts` and `app/auth/callback/route.ts`
 * already do.
 *
 * No fallback values for the URL or key: a client silently pointed at the wrong
 * project is worse than one that fails to start, and this portal handles patient
 * data. See lib/api.ts for the same rule applied to the gateway URL.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;



export async function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. " +
        "Copy .env.example to .env.local for local development, or set them in the " +
        "deployment environment."
    );
  }
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies — only Server Actions and
          // Route Handlers can. Swallowing here is the documented Supabase
          // pattern: session refresh still happens in middleware, which can
          // write, so a read-only render does not need to.
        }
      },
    },
  });
}
