"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface Props {
  url: string;
  label?: string;
  confirmText?: string;
  redirectTo?: string;
}

export function DeleteButton({
  url,
  label = "Удалить",
  confirmText = "Удалить запись?",
  redirectTo,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function handle() {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        window.alert(data.error || "Не удалось удалить");
        return;
      }
      startTransition(() => {
        if (redirectTo) router.replace(redirectTo);
        router.refresh();
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="danger" size="sm" onClick={handle} loading={busy}>
      {label}
    </Button>
  );
}
