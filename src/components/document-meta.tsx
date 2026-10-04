import { useEffect } from "react";
import {
  applyDocumentMeta,
  resetDocumentMeta,
  type ExhibitionShareMeta,
} from "@/lib/exhibition/social-meta";

interface DocumentMetaProps {
  meta: ExhibitionShareMeta | null;
}

export function DocumentMeta({ meta }: DocumentMetaProps) {
  useEffect(() => {
    if (meta) {
      applyDocumentMeta(meta);
    } else {
      resetDocumentMeta();
    }

    return () => {
      resetDocumentMeta();
    };
  }, [meta]);

  return null;
}
