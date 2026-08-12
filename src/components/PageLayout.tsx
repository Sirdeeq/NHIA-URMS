import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BackButton from "@/src/components/BackButton";
import { cn } from "@/lib/utils";

export interface PageLayoutProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: boolean;
  backTo?: string | number;
  backLabel?: string;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  cardClassName?: string;
  bare?: boolean;
}

/**
 * Consistent app page shell: gray background + single shadcn Card
 * with header (title, description, actions) and content body.
 *
 * Use `back` on create/detail pages — back sits on the right of the header row.
 */
export function PageLayout({
  title,
  description,
  actions,
  back = false,
  backTo,
  backLabel = "Back",
  children,
  className,
  contentClassName,
  headerClassName,
  cardClassName,
  bare = false,
}: PageLayoutProps) {
  const hasHeader = back || title || description || actions;
  const headerActions = back || actions;

  const headerBlock = hasHeader ? (
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-start justify-between",
        headerClassName
      )}
    >
      <div className="min-w-0 space-y-0.5">
        {title ? (
          bare ? (
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              {title}
            </h1>
          ) : (
            <CardTitle className="text-xl font-bold tracking-tight md:text-2xl">
              {title}
            </CardTitle>
          )
        ) : null}
        {description ? (
          bare ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : (
            <CardDescription>{description}</CardDescription>
          )
        ) : null}
      </div>
      {headerActions ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {actions}
          {back ? (
            <BackButton text={backLabel} to={backTo} />
          ) : null}
        </div>
      ) : null}
    </div>
  ) : null;

  if (bare) {
    return (
      <div
        className={cn(
          "flex min-h-full flex-1 flex-col gap-2 bg-gray-50 p-2 md:p-3",
          className
        )}
      >
        {headerBlock}
        <div className={cn("flex flex-1 flex-col gap-2", contentClassName)}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-full flex-1 flex-col bg-gray-50 p-1 md:p-2",
        className
      )}
    >
      <Card
        className={cn(
          "m-0 flex flex-1 flex-col border-gray-200/80 p-0 shadow-sm gap-1",
          cardClassName
        )}
      >
        {hasHeader ? (
          <CardHeader className="space-y-0 border-b border-border/60 p-3 pb-3">
            {headerBlock}
          </CardHeader>
        ) : null}

        <CardContent
          className={cn(
            "flex flex-1 flex-col gap-2 p-2 md:p-3 min-h-0",
            contentClassName
          )}
        >
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

export default PageLayout;
