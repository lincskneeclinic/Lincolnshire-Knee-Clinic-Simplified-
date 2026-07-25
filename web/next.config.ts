import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.35", "192.168.1.35:3000", "10.250.13.78", "localhost:3000"],
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
