import Image from "next/image";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const WORDMARK_SRC = "/logo.png";
const ICON_SRC = "/tab_icon.png";

type BrandLogoProps = {
  variant?: "navbar" | "icon" | "landing";
  priority?: boolean;
  className?: string;
};

function LandingWordmark({
  priority,
  className,
}: {
  priority?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "hidden items-center gap-2.5 lg:inline-flex xl:gap-3",
        className,
      )}
    >
      <Image
        src={ICON_SRC}
        alt=""
        width={48}
        height={48}
        priority={priority}
        aria-hidden
        className="size-11 shrink-0 object-contain xl:size-12"
      />
      <span
        className="font-heading text-[1.65rem] font-semibold leading-none tracking-tight text-ink-warm-muted xl:text-[1.85rem]"
        aria-label="TenantShield"
      >
        Tenant
        <span className="relative inline-block">
          S
          <Leaf
            className="pointer-events-none absolute -top-0.5 left-1/2 size-2.5 -translate-x-1/2 fill-primary text-primary xl:size-3"
            aria-hidden
          />
        </span>
        hield
      </span>
    </span>
  );
}

export function BrandLogo({
  variant = "navbar",
  priority,
  className,
}: BrandLogoProps) {
  if (variant === "icon") {
    return (
      <Image
        src={ICON_SRC}
        alt="TenantShield"
        width={32}
        height={32}
        priority={priority}
        className={cn("size-8 shrink-0 object-contain sm:size-9", className)}
      />
    );
  }

  if (variant === "landing") {
    return <LandingWordmark priority={priority} className={className} />;
  }

  return (
    <Image
      src={WORDMARK_SRC}
      alt="TenantShield"
      width={866}
      height={288}
      priority={priority}
      sizes="(max-width: 640px) 52vw, 200px"
      className={cn(
        "h-[clamp(2.5rem,5vw+0.75rem,3.75rem)] w-auto max-w-[min(52vw,9.5rem)] shrink-0 object-contain object-left sm:max-w-[min(62vw,12rem)] lg:h-[clamp(2.75rem,4vw+1.25rem,4rem)] lg:max-w-[min(72vw,16rem)]",
        className,
      )}
    />
  );
}

/** @deprecated Use BrandLogo — kept for existing imports */
export function NavbarLogo(props: Omit<BrandLogoProps, "variant">) {
  return <BrandLogo variant="navbar" {...props} />;
}
