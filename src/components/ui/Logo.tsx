import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
  href?: string;
  showTagline?: boolean;
}

export function Logo({ className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center group", className)}
      aria-label="Rutega — на главную"
    >
      <Image
        src="/logo.png"
        alt="Rutega"
        width={160}
        height={48}
        priority
        className="h-10 w-auto object-contain transition-opacity group-hover:opacity-90 sm:h-12"
      />
    </Link>
  );
}
