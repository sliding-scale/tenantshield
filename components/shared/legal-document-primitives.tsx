import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type LegalDocVariant = "page" | "modal";

type CalloutVariant = "neutral" | "red" | "green" | "gold" | "orange";

const calloutStyles: Record<CalloutVariant, string> = {
  neutral: "border-border bg-muted/40 text-foreground",
  red: "border-destructive/30 bg-destructive/10 text-foreground",
  green: "border-secondary/30 bg-secondary/10 text-foreground",
  gold: "border-primary/30 bg-primary/10 text-foreground",
  orange: "border-warning/30 bg-warning/10 text-foreground",
};

export function LegalCallout({
  variant,
  icon,
  children,
  docVariant = "page",
  className,
}: {
  variant: CalloutVariant;
  icon?: string;
  children: ReactNode;
  docVariant?: LegalDocVariant;
  className?: string;
}) {
  const isModal = docVariant === "modal";
  const showInfoIcon = variant === "neutral" && icon == null;

  return (
    <div
      className={cn(
        "mt-4 flex gap-3 rounded-2xl border p-3 sm:mt-6 sm:p-4",
        isModal ? "text-xs leading-5 sm:text-sm sm:leading-6" : "text-sm leading-6 sm:p-5 sm:text-base",
        calloutStyles[variant],
        variant === "neutral" && "text-muted-foreground [&_strong]:text-foreground",
        className,
      )}
    >
      {showInfoIcon ? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground sm:size-9">
          <Info className="size-4 sm:size-5" aria-hidden />
        </span>
      ) : icon ? (
        <span className="shrink-0 text-base sm:text-lg" aria-hidden>
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 [&_strong]:font-semibold">{children}</div>
    </div>
  );
}

export function LegalSection({
  id,
  sectionNum,
  title,
  children,
  docVariant = "page",
}: {
  id: string;
  sectionNum: string;
  title: string;
  children: ReactNode;
  docVariant?: LegalDocVariant;
}) {
  const isModal = docVariant === "modal";
  return (
    <section
      id={id}
      className={cn(
        "border-t pt-6 first:border-t-0 first:pt-0 sm:pt-8",
        isModal ? "scroll-mt-4 border-border" : "scroll-mt-24 border-border pt-10",
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {sectionNum}
      </p>
      <h2
        className={cn(
          "mt-1.5 font-heading font-semibold text-foreground sm:mt-2",
          isModal ? "text-base sm:text-lg" : "text-xl sm:text-2xl",
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "mt-3 space-y-3 sm:mt-4 sm:space-y-4",
          isModal
            ? "text-xs leading-relaxed text-muted-foreground sm:text-sm"
            : "text-sm leading-7 text-muted-foreground sm:text-base",
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function LegalHighlightBox({
  title,
  children,
  docVariant = "page",
}: {
  title: string;
  children: ReactNode;
  docVariant?: LegalDocVariant;
}) {
  const isModal = docVariant === "modal";
  return (
    <div
      className={cn(
        "mt-4 rounded-2xl border p-4 sm:p-5",
        "border-border bg-muted/30 text-foreground",
      )}
    >
      <h3
        className={cn(
          "font-semibold text-foreground",
          isModal ? "text-sm" : "text-base",
        )}
      >
        {title}
      </h3>
      <div
        className={cn(
          "mt-2 space-y-2 text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
          isModal ? "text-xs leading-relaxed sm:text-sm" : "text-sm leading-6 sm:text-base",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function LegalToc({
  items,
  docVariant = "page",
}: {
  items: { href: string; label: string }[];
  docVariant?: LegalDocVariant;
}) {
  if (docVariant === "modal") return null;

  return (
    <nav
      aria-label="Table of contents"
      className="mt-8 rounded-2xl border border-border bg-muted/30 p-5 sm:p-6"
    >
      <p className="text-sm font-semibold text-foreground">Table of Contents</p>
      <ol className="mt-3 columns-1 gap-x-8 space-y-1.5 text-sm sm:columns-2">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
