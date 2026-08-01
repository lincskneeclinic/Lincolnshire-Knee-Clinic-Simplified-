import { getStoreValue, setStoreValue } from "./dataStore";
import type { ImageCategory } from "./medicalImagePrompts";

// Tracks every AI-generated medical illustration for clinical-review sign-off.
// Stored via the generic app_kv_store KV pattern (same idiom as
// lib/socialOnlyPosts.ts) rather than a new fixed-schema Supabase table.
export interface MedicalImageAsset {
  id: string;
  filename: string;
  storagePath: string; // "[category]/[filename].webp" within the medical-illustrations bucket
  url: string;
  category: ImageCategory;
  subjectTitle: string;
  promptUsed: string;
  negativePrompt: string;
  aspectRatio: string;
  transparentBackground: boolean;
  altText: string;
  page?: string;
  section?: string;
  provider: "google-genai";
  model: string;
  generatedAt: string;
  clinicalReviewStatus: "required" | "approved" | "rejected";
}

const MEDICAL_IMAGE_ASSETS_KEY = "medical-image-assets";

export async function listMedicalImageAssets(): Promise<MedicalImageAsset[]> {
  const assets = await getStoreValue<Record<string, MedicalImageAsset>>(MEDICAL_IMAGE_ASSETS_KEY, {});
  return Object.values(assets).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

export async function saveMedicalImageAsset(asset: MedicalImageAsset): Promise<void> {
  const assets = await getStoreValue<Record<string, MedicalImageAsset>>(MEDICAL_IMAGE_ASSETS_KEY, {});
  assets[asset.id] = asset;
  await setStoreValue(MEDICAL_IMAGE_ASSETS_KEY, assets);
}

export async function updateMedicalImageReviewStatus(
  id: string,
  status: MedicalImageAsset["clinicalReviewStatus"]
): Promise<MedicalImageAsset | null> {
  const assets = await getStoreValue<Record<string, MedicalImageAsset>>(MEDICAL_IMAGE_ASSETS_KEY, {});
  const asset = assets[id];
  if (!asset) return null;
  asset.clinicalReviewStatus = status;
  await setStoreValue(MEDICAL_IMAGE_ASSETS_KEY, assets);
  return asset;
}
