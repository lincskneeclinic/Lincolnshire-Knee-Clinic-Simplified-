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
