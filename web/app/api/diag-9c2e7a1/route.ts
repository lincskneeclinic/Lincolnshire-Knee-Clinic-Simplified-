import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Temporary diagnostic route to confirm web/docs/*.md are actually present
// and readable on Hostinger after the path-fix. Not linked anywhere. Delete
// after use.
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("token") !== "diag_9c2e7a1f5d3b") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const guidelinesPath = path.join(process.cwd(), "docs", "medical-imagery-guidelines.md");
  const libraryPath = path.join(process.cwd(), "docs", "image-prompt-library.md");

  const report = {
    cwd: process.cwd(),
    guidelinesPath,
    guidelinesExists: fs.existsSync(guidelinesPath),
    guidelinesSize: fs.existsSync(guidelinesPath) ? fs.statSync(guidelinesPath).size : null,
    libraryPath,
    libraryExists: fs.existsSync(libraryPath),
    librarySize: fs.existsSync(libraryPath) ? fs.statSync(libraryPath).size : null,
  };

  return NextResponse.json(report);
}
