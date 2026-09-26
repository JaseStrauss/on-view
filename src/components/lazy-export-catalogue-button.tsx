import { lazy, Suspense, type ComponentProps } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const ExportCatalogueButton = lazy(() =>
  import("@/components/export-catalogue-button").then((module) => ({
    default: module.ExportCatalogueButton,
  })),
);

type LazyExportCatalogueButtonProps = ComponentProps<
  typeof import("@/components/export-catalogue-button").ExportCatalogueButton
>;

function ExportCatalogueButtonFallback({
  variant = "outline",
  size = "default",
}: Pick<LazyExportCatalogueButtonProps, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} disabled>
      <FileDown className="size-4" />
      Export catalogue (PDF)
    </Button>
  );
}

export function LazyExportCatalogueButton(props: LazyExportCatalogueButtonProps) {
  return (
    <Suspense
      fallback={
        <ExportCatalogueButtonFallback
          variant={props.variant}
          size={props.size}
        />
      }
    >
      <ExportCatalogueButton {...props} />
    </Suspense>
  );
}
