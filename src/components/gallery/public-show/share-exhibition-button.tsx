import { Share2 } from "lucide-react";
import { shareExhibitionWithFeedback } from "@/lib/share-exhibition";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface ShareExhibitionButtonProps {
  slug: string;
  title: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function ShareExhibitionButton({
  slug,
  title,
  variant = "ghost",
  size = "sm",
}: ShareExhibitionButtonProps) {
  const isMobile = useMobile();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={() => {
        void shareExhibitionWithFeedback({
          slug,
          title,
          preferNativeShare: isMobile,
        });
      }}
    >
      <Share2 className="size-4" />
      Share
    </Button>
  );
}
