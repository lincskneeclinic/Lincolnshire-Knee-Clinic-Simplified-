import type { NextConfig } from "next";
import { execSync } from "child_process";

function getBuildCommit(): string {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  env: {
    BUILD_COMMIT: getBuildCommit(),
    BUILD_TIME: new Date().toISOString(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oshoqzcuvxmzyjbocovr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // proxy.ts's matcher covers nearly every route, and this version of
    // Next.js buffers every request body that passes through it in memory,
    // silently truncating anything over the default 10MB (no error — the
    // route handler just receives a corrupted/partial multipart body and
    // fails to parse it). Raised to cover video uploads
    // (app/api/portal/content-pipeline/upload-video) up to the same 500MB
    // pre-compression ceiling enforced there.
    proxyClientMaxBodySize: "500mb",
  },
  // ffmpeg-static resolves its binary path via __dirname internally, which
  // breaks (resolves to a bogus bundler-virtual path) if Next.js bundles it
  // into the Route Handler's server bundle. Excluding it here makes Next.js
  // use Node's native require instead, preserving the real filesystem path.
  serverExternalPackages: ["ffmpeg-static"],
  allowedDevOrigins: [
    "192.168.1.35",
    "192.168.1.35:3000",
    "10.250.13.78",
    "localhost:3000",
    "lincsknee.com",
    "www.lincsknee.com",
    "lincsknee.com:3000",
    "www.lincsknee.com:3000",
    "lincsknee.com:80",
    "www.lincsknee.com:80"
  ],
  async redirects() {
    return [
      {
        source: "/clinician",
        destination: "/portal/clinician-intake",
        permanent: true,
      },
      {
        source: "/clinician-portal",
        destination: "/portal/clinician-intake",
        permanent: true,
      },
      {
        source: "/portal/clinician",
        destination: "/portal/clinician-intake",
        permanent: true,
      },
      {
        source: "/portal/clinician-portal",
        destination: "/portal/clinician-intake",
        permanent: true,
      },
      {
        source: "/business",
        destination: "/portal/business",
        permanent: true,
      },
      {
        source: "/dashboard",
        destination: "/portal/business",
        permanent: true,
      },
      {
        source: "/business-portal",
        destination: "/portal/business",
        permanent: true,
      },
      {
        source: "/portal/dashboard",
        destination: "/portal/business",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
