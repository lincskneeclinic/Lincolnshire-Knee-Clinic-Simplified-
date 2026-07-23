import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://lincolnshirekneeclinic.co.uk";
  
  const staticPages = [
    "",
    "/about",
    "/symptoms",
    "/conditions",
    "/treatments",
    "/injections",
    "/education",
    "/clinics",
    "/contact",
    "/book-appointment",
    "/patient-reviews",
    "/hospital-affiliations",
    "/professional-registrations",
    "/urgent-advice",
    "/portal",
    "/clinical-knowledge-hub",
    "/recovery",
    "/research",
  ];

  const conditionSlugs = [
    "knee-arthritis",
    "meniscal-tear",
    "acl-injury",
    "patellofemoral-pain",
    "cartilage-injury",
    "knee-instability",
    "bakers-cyst",
    "knee-tendinopathy",
    "patellar-instability",
  ];

  const symptomSlugs = [
    "knee-pain",
    "swollen-knee",
    "stiff-knee",
    "clicking-knee",
    "locked-knee",
    "knee-giving-way",
    "unable-to-straighten-knee",
    "front-of-knee-pain",
    "back-of-knee-pain",
    "inner-knee-pain",
    "outer-knee-pain",
    "knee-pain-after-injury",
  ];

  const treatmentSlugs = [
    "physiotherapy",
    "activity-modification",
    "pain-management",
    "knee-bracing",
    "knee-arthroscopy",
    "meniscal-surgery",
    "acl-reconstruction",
    "cartilage-procedures",
    "patellar-stabilisation",
    "partial-knee-replacement",
    "total-knee-replacement",
    "revision-knee-replacement",
    "preparing-for-surgery",
    "enhanced-recovery",
    "physiotherapy-after-surgery",
    "returning-to-driving",
    "returning-to-work",
    "returning-to-sport",
    "recovery-faqs",
    "weight-management",
  ];

  const injectionSlugs = [
    "corticosteroid",
    "hyaluronic-acid",
    "prp",
    "arthrosamid",
    "ultrasound-guided-knee-injections",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [
    ...staticPages.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1.0 : 0.8,
    })),
    ...conditionSlugs.map((slug) => ({
      url: `${baseUrl}/conditions/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...symptomSlugs.map((slug) => ({
      url: `${baseUrl}/symptoms/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...treatmentSlugs.map((slug) => ({
      url: `${baseUrl}/treatments/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...injectionSlugs.map((slug) => ({
      url: `${baseUrl}/injections/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return sitemapEntries;
}
