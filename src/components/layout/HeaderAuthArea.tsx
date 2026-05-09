"use client";

import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { MobileMenu, type NavItem } from "./MobileMenu";

interface Props {
  navItems: NavItem[];
}

interface MeResponse {
  user?: { fullName: string };
}

let cachedMe: Promise<MeResponse | null> | null = null;
function fetchMe(): Promise<MeResponse | null> {
  if (cachedMe) return cachedMe;
  cachedMe = fetch("/api/me", { credentials: "same-origin" })
    .then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : null))
    .catch(() => null);
  return cachedMe;
}

export function HeaderAuthArea({ navItems }: Props) {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchMe().then((data) => {
      if (!alive) return;
      setResolved(true);
      if (data?.user) {
        setAuthenticated(true);
        setFirstName(data.user.fullName.split(" ")[0] ?? null);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      {authenticated ? (
        <LinkButton href="/lk" variant="primary" size="sm" className="hidden sm:inline-flex">
          <LogIn aria-hidden="true" className="h-4 w-4" />
          {firstName ?? "Личный кабинет"}
        </LinkButton>
      ) : (
        <LinkButton
          href="/lk/login"
          variant="primary"
          size="sm"
          className="hidden sm:inline-flex"
          aria-busy={!resolved || undefined}
        >
          <LogIn aria-hidden="true" className="h-4 w-4" />
          Войти в ЛК
        </LinkButton>
      )}
      <MobileMenu items={navItems} authenticated={authenticated} />
    </>
  );
}
