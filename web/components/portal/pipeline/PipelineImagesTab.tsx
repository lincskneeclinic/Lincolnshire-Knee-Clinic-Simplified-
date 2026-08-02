"use client";

import React from "react";
import { ContentPipelineRun } from "@/lib/contentPipeline";
import { getRenderableImageUrl } from "@/lib/contentPipelineFormatting";

interface PipelineImagesTabProps {
  selectedRun: ContentPipelineRun;
  isUploadingImage: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageUrlInput: string;
  onImageUrlInputChange: (value: string) => void;
  onAttachImage: (url: string) => Promise<void>;
}

export function PipelineImagesTab({
  selectedRun,
  isUploadingImage,
  onFileUpload,
  imageUrlInput,
  onImageUrlInputChange,
  onAttachImage,
}: PipelineImagesTabProps) {
  const renderableImageUrl = getRenderableImageUrl(selectedRun.blog_drafts[0]?.suggested_images);

  return (
    <div className="space-y-6">
      <div className="bg-dark-overlay-navy p-5 rounded-xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-clinical-teal uppercase tracking-wider text-xs">
            Attached Media Asset &amp; Image Controls
          </span>
          {renderableImageUrl ? (
            <span className="text-[11px] text-clinical-teal bg-primary-navy border border-clinical-teal/30 px-2.5 py-0.5 rounded-full">
              Active Image Attached
            </span>
          ) : (
            <span className="text-[11px] text-white/70 bg-primary-navy border border-white/20 px-2.5 py-0.5 rounded-full">
              No Image Attached
            </span>
          )}
        </div>

        {renderableImageUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-lg bg-white/5" style={{ aspectRatio: "16 / 9" }}>
            <img src={renderableImageUrl} alt="Attached Blog Visual" className="w-full h-full object-contain" />
            <div className="absolute bottom-3 left-3 bg-dark-overlay-navy/90 backdrop-blur text-[11px] text-clinical-teal px-3 py-1 rounded-full border border-white/10">
              Attached Featured Image
            </div>
          </div>
        ) : (
          <div className="bg-primary-navy/60 p-3.5 rounded-xl border border-dashed border-white/20 text-white/70 text-xs">
            <span className="block text-white/90">No image attached yet</span>
            <span className="text-white/60 text-[11px]">
              Upload an image or paste a URL below to attach it to this blog post and all social media cards.
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-white/10">
          <label className="border border-clinical-teal/40 hover:border-clinical-teal text-clinical-teal hover:bg-clinical-teal/10 text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors inline-flex items-center justify-center gap-2 shrink-0 shadow">
            <span>{isUploadingImage ? "Uploading to Storage..." : "Upload Image File"}</span>
            <input type="file" accept="image/*" disabled={isUploadingImage} onChange={onFileUpload} className="hidden" />
          </label>

          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={imageUrlInput}
              onChange={(e) => onImageUrlInputChange(e.target.value)}
              placeholder="Or paste direct image URL (https://...)"
              className="flex-1 bg-primary-navy border border-white/20 text-white rounded-xl p-2.5 text-xs focus:border-clinical-teal focus:outline-none"
            />
            <button
              type="button"
              disabled={!imageUrlInput.trim()}
              onClick={async () => {
                if (imageUrlInput.trim()) {
                  await onAttachImage(imageUrlInput.trim());
                  onImageUrlInputChange("");
                }
              }}
              className="border border-white/20 hover:border-white/40 text-white/80 hover:bg-white/5 text-xs px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Attach URL
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-dark-overlay-navy p-4 rounded-xl border border-white/10 space-y-2">
          <span className="text-clinical-teal uppercase tracking-wider text-[10px] block">Suggested Visual Prompts</span>
          <ul className="list-disc pl-4 text-white/70 space-y-1">
            {selectedRun.blog_drafts[0]?.suggested_images
              ?.filter((img) => typeof img === "string")
              .map((img, i) => (
                <li key={i}>{img as string}</li>
              ))}
          </ul>
        </div>
        <div className="bg-dark-overlay-navy p-4 rounded-xl border border-white/10 space-y-2">
          <span className="text-clinical-teal uppercase tracking-wider text-[10px] block">References &amp; Citations</span>
          <ul className="list-disc pl-4 text-white/70 space-y-1 font-mono text-[11px]">
            {selectedRun.blog_drafts[0]?.references?.map((ref, i) => (
              <li key={i}>{ref}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
