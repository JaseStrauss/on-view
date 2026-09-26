import { Link } from "react-router-dom";
import { Check, Circle, X } from "lucide-react";
import type { StudioOnboardingProgress } from "@/lib/studio-onboarding";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GettingStartedChecklistProps {
  progress: StudioOnboardingProgress;
  exhibitionId: string | null;
  publishTargetExhibitionId: string | null;
  onDismiss: () => void;
}

interface ChecklistStep {
  id: string;
  label: string;
  hint?: string;
  complete: boolean;
  href: string;
}

export function GettingStartedChecklist({
  progress,
  exhibitionId,
  publishTargetExhibitionId,
  onDismiss,
}: GettingStartedChecklistProps) {
  const steps: ChecklistStep[] = [
    {
      id: "artwork",
      label: "Add your first work",
      hint: "Upload your own work or import pieces in bulk.",
      complete: progress.hasArtworks,
      href: "/studio/artworks/new",
    },
    {
      id: "exhibition",
      label: "Create an exhibition",
      hint: "Give your show a title and choose a gallery space.",
      complete: progress.hasExhibition,
      href: "/studio?new-exhibition=1",
    },
    {
      id: "hang",
      label: "Hang works on the wall",
      hint: "Drag works from your catalogue onto the wall plan.",
      complete: progress.hasPlacements,
      href: exhibitionId
        ? `/studio/exhibitions/${exhibitionId}`
        : "/studio?new-exhibition=1",
    },
    {
      id: "publish",
      label: "Open your exhibition and share the link",
      hint: "Open the show to visitors, then copy the link to send out.",
      complete: progress.hasPublishedExhibition,
      href: publishTargetExhibitionId
        ? `/studio/exhibitions/${publishTargetExhibitionId}`
        : "/studio?new-exhibition=1",
    },
  ];

  const completedCount = steps.filter((step) => step.complete).length;

  return (
    <Card className="mt-8 border-primary/15 bg-primary/[0.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="font-serif text-2xl italic">
              Getting started
            </CardTitle>
            <CardDescription className="mt-1">
              Your first show in four steps · {completedCount} of {steps.length}{" "}
              complete
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDismiss}
            aria-label="Dismiss getting started checklist"
          >
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={step.id} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border",
                  step.complete
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground",
                )}
                aria-hidden
              >
                {step.complete ? (
                  <Check className="size-3.5" />
                ) : (
                  <Circle className="size-3" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                {step.complete ? (
                  <p className="font-medium text-muted-foreground line-through decoration-border">
                    {index + 1}. {step.label}
                  </p>
                ) : (
                  <>
                    <Link
                      to={step.href}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {index + 1}. {step.label}
                    </Link>
                    {step.hint && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.hint}
                      </p>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
