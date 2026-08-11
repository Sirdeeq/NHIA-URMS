import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/src/components/PageLayout";

interface SocPlaceholderPageProps {
  title: string;
  onBack?: () => void;
}

/** Heading-only placeholder for SOC/Zones pages not yet implemented. */
export default function SocPlaceholderPage({ title, onBack }: SocPlaceholderPageProps) {
  return (
    <PageLayout
      title={title}
      actions={
        onBack ? (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : undefined
      }
    >
      <p className="text-sm text-muted-foreground">This page is under development.</p>
    </PageLayout>
  );
}
