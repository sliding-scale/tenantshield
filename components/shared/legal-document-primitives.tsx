import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type LegalDocVariant = "page" | "modal";

type CalloutVariant = "red" | "green" | "gold" | "orange";

const calloutStylesPage: Record<CalloutVariant, string> = {
  red: "border-red-200 bg-red-50 text-red-950",
  green: "border-emerald-200 bg-emerald-50 text-emerald-950",
  gold: "border-amber-200 bg-amber-50 text-amber-950",
  orange: "border-orange-200 bg-orange-50 text-orange-950",
};

const calloutStylesModal: Record<CalloutVariant, string> = {
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
  icon: string;
  children: ReactNode;
  docVariant?: LegalDocVariant;
  className?: string;
}) {
  const styles = docVariant === "modal" ? calloutStylesModal : calloutStylesPage;
  return (
    <div
      className={cn(
        "mt-4 flex gap-3 rounded-2xl border-2 p-3 sm:mt-6 sm:p-4",
        docVariant === "modal" ? "text-xs leading-5 sm:text-sm sm:leading-6" : "text-sm leading-6 sm:p-5 sm:text-base",
        styles[variant],
        className,
      )}
    >
      <span className="shrink-0 text-base sm:text-lg" aria-hidden>
        {icon}
      </span>
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
        isModal ? "border-border scroll-mt-4" : "scroll-mt-24 border-amber-100 pt-10",
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-wider",
          isModal ? "text-muted-foreground" : "text-amber-600",
        )}
      >
        {sectionNum}
      </p>
      <h2
        className={cn(
          "mt-1.5 font-bold text-foreground sm:mt-2",
          isModal ? "text-base sm:text-lg" : "text-xl text-gray-900 sm:text-2xl",
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "mt-3 space-y-3 sm:mt-4 sm:space-y-4",
          isModal
            ? "text-xs leading-relaxed text-muted-foreground sm:text-sm"
            : "text-sm leading-7 text-gray-700 sm:text-base",
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
        "mt-4 rounded-2xl border-2 p-4 sm:p-5",
        isModal
          ? "border-border bg-muted/30 text-foreground"
          : "border-amber-200 bg-amber-50/70 text-gray-800",
      )}
    >
      <h3
        className={cn(
          "font-bold",
          isModal ? "text-sm text-foreground" : "text-base text-gray-900",
        )}
      >
        {title}
      </h3>
      <div
        className={cn(
          "mt-2 space-y-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
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
      className="mt-8 rounded-2xl border-2 border-amber-100 bg-amber-50/50 p-5 sm:p-6"
    >
      <p className="text-sm font-bold text-gray-900">Table of Contents</p>
      <ol className="mt-3 columns-1 gap-x-8 space-y-1.5 text-sm sm:columns-2">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="text-amber-800 underline-offset-2 hover:text-amber-950 hover:underline"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function div({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={className}>{children}</div>;
}

