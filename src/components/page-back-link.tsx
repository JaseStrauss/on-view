import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageBackLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export function PageBackLink({ to, children, className }: PageBackLinkProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-2 h-auto gap-1.5 px-2 py-1 text-muted-foreground hover:text-foreground",
        className,
      )}
      render={<Link to={to} />}
    >
      <ArrowLeft className="size-4" />
      {children}
    </Button>
  );
}
