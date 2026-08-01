import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Temporary diagnostic route to verify Supabase SSR client init on Hostinger
// after adding NEXT_PUBLIC_SUPABASE_ANON_KEY. Not linked anywhere. Delete after use.
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("token") !== "diag_8f3a1c9e2b47") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const report: Record<string, unknown> = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL_present: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY_present: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      NEXT_PUBLIC_SUPABASE_ANON_KEY_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length ?? 0,
      BUILD_COMMIT: process.env.BUILD_COMMIT,
      BUILD_TIME: process.env.BUILD_TIME,
    },
  };

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );
    report.clientCreated = true;

    const { data, error } = await supabase.auth.getUser();
    report.getUserError = error ? { message: error.message, name: error.name, status: (error as any).status } : null;
    report.getUserData = data ? { hasUser: Boolean(data.user) } : null;
  } catch (err: any) {
    report.threw = {
      message: err?.message,
      name: err?.name,
    };
  }

  return NextResponse.json(report);
}
