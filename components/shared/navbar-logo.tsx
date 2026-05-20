import Image from "next/image";

const APP_LOGO_SRC = "/logo.png";

type NavbarLogoProps = {
  priority?: boolean;
};

export function NavbarLogo({ priority }: NavbarLogoProps) {
  return (
    <Image
      src={APP_LOGO_SRC}
      alt="TenantShield"
      width={866}
      height={288}
      priority={priority}
      className="h-[clamp(2.5rem,5vw+0.75rem,3.75rem)] w-auto max-w-[min(72vw,16rem)] shrink-0 object-contain object-left sm:max-w-[min(85vw,20rem)] md:max-w-none lg:h-[clamp(2.75rem,4vw+1.25rem,4rem)]"
    />
  );
}
