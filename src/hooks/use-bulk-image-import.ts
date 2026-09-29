import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  isAcceptedImageFile,
  MAX_BULK_IMAGE_COUNT,
} from "@/lib/bulk-import";

export interface SelectedBulkImage {
  id: string;
  file: File;
  previewUrl: string;
}

export function useBulkImageImport() {
  const [selectedImages, setSelectedImages] = useState<SelectedBulkImage[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => {
      selectedImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [selectedImages]);

  const remainingImageSlots = MAX_BULK_IMAGE_COUNT - selectedImages.length;

  function addImageFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    const accepted = incoming.filter(isAcceptedImageFile);
    const rejectedCount = incoming.length - accepted.length;

    if (rejectedCount > 0) {
      toast.error("Some files were skipped", {
        description: "Only JPEG, PNG, WebP, and GIF images are supported.",
      });
    }

    if (accepted.length === 0) return;

    const availableSlots = Math.max(0, remainingImageSlots);
    const filesToAdd = accepted.slice(0, availableSlots);

    if (accepted.length > availableSlots) {
      toast.error(`You can upload up to ${MAX_BULK_IMAGE_COUNT} images at once.`);
    }

    setSelectedImages((current) => [
      ...current,
      ...filesToAdd.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }

  function removeImage(id: string) {
    setSelectedImages((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  function clearImages() {
    setSelectedImages((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }

  return {
    selectedImages,
    dragActive,
    setDragActive,
    addImageFiles,
    removeImage,
    clearImages,
  };
}
