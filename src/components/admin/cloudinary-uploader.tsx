"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export interface UploadedImage {
  image_url: string;
  cloudinary_public_id: string | null;
  is_main: boolean;
}

export function CloudinaryUploader({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const next: UploadedImage[] = [...images];

    for (const file of Array.from(files)) {
      try {
        if (isCloudinaryConfigured()) {
          const res = await uploadToCloudinary(file, setProgress);
          next.push({
            image_url: res.secure_url,
            cloudinary_public_id: res.public_id,
            is_main: next.length === 0,
          });
        } else {
          // Dev fallback: local preview only (not persisted to Cloudinary).
          const url = URL.createObjectURL(file);
          next.push({
            image_url: url,
            cloudinary_public_id: null,
            is_main: next.length === 0,
          });
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : `Failed to upload ${file.name}`
        );
      }
    }

    if (!isCloudinaryConfigured()) {
      toast.warning("Cloudinary not configured — using local preview only.");
    }
    onChange(next);
    setUploading(false);
    setProgress(0);
  }

  function removeImage(index: number) {
    const next = images.filter((_, i) => i !== index);
    if (next.length && !next.some((i) => i.is_main)) next[0].is_main = true;
    onChange(next);
  }

  function setMain(index: number) {
    onChange(images.map((img, i) => ({ ...img, is_main: i === index })));
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragging
            ? "border-crimson bg-crimson/5"
            : "border-border hover:border-crimson/40 hover:bg-accent/60"
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-crimson-400" />
            <p className="mt-3 text-sm text-muted-foreground">
              Uploading… {progress}%
            </p>
          </>
        ) : (
          <>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-crimson/10">
              <UploadCloud className="h-6 w-6 text-crimson-400" />
            </span>
            <p className="mt-3 text-sm font-medium text-foreground">
              Drag & drop images here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse (PNG, JPG, WEBP)
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            {images.length} image{images.length !== 1 ? "s" : ""} • click ★ to
            set main
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((img, i) => (
              <div
                key={i}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border-2 bg-muted",
                  img.is_main ? "border-crimson" : "border-border"
                )}
              >
                <img
                  src={img.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setMain(i)}
                    aria-label="Set main image"
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        img.is_main
                          ? "fill-crimson text-crimson"
                          : "text-white"
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
                {img.is_main && (
                  <span className="absolute left-1 top-1 rounded bg-crimson px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
