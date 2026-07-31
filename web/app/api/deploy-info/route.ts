import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    commit: process.env.BUILD_COMMIT || "unknown",
    builtAt: process.env.BUILD_TIME || "unknown",
  });
}
