"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface Props {
  invoiceId: string;
  totalKop: number;
}

export function PayInvoiceButton({ invoiceId, totalKop }: Props) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function pay() {
    setPending(true);
    try {
      const res = await fetch("/api/lk/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountRub: totalKop / 100,
          invoiceId,
          method: "card",
          note: "Оплата картой через ЛК",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Не удалось провести платёж");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button size="sm" onClick={pay} disabled={pending}>
      {pending ? "Оплата…" : "Оплатить"}
    </Button>
  );
}
