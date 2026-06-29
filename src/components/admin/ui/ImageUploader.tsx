"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadSimple, CircleNotch } from "@phosphor-icons/react";

type UploadedMedia = {
  id: string;
  url: string;
  filename: string;
};

type ImageUploaderProps = {
  onUploadSuccess: (media: UploadedMedia) => void;
  categoryId?: string;
  accept?: string;
};

export default function ImageUploader({ onUploadSuccess, categoryId, accept = "image/*" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      if (categoryId) {
        formData.append("categoryId", categoryId);
      }

      try {
        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const media = await res.json();
        onUploadSuccess(media as UploadedMedia);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [categoryId, onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept === "image/*" ? {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
    } : undefined,
    maxFiles: 1,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 transition-colors ${
          isDragActive
            ? "border-ring bg-accent"
            : "border-input hover:border-ring hover:bg-accent/50"
        }`}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="flex flex-col items-center text-muted-foreground">
            <CircleNotch className="mb-2 size-5 animate-spin" />
            <p className="text-xs">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <UploadSimple className="mb-2 size-5" />
            <p className="text-xs font-medium text-foreground">
              {isDragActive ? "Drop file here" : "Click or drag file to upload"}
            </p>
            <p className="text-[11px] mt-1">Supports JPG, PNG, WEBP, GIF (Max 10MB)</p>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
