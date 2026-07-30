import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/portal",
        "/api",
        "/community/login",
        "/community/register",
        "/community/account",
        "/community/forgot-password",
        "/community/reset-password",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
