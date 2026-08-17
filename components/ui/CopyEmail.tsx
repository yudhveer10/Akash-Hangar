"use client";

import { useEffect, useState } from "react";

type State = "idle" | "copied" | "selected";

const LABEL: Record<State, string> = {
  idle: "Copy address",
  copied: "Copied",
  selected: "Selected — press copy",
};

/**
 * Copy-to-clipboard for the contact address.
 *
 * The mailto link beside it stays the primary route; this is for anyone reading on a
 * machine where the mail client is not the browser's. Clipboard access can be refused
 * outright — by permissions, or by an insecure origin — so the fallback selects the
 * address instead of failing silently, leaving a plain keyboard copy to hand.
 */
export function CopyEmail({ email, addressId }: { email: string; addressId: string }) {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 2500);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <button
      type="button"
      aria-label={`Copy ${email}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setState("copied");
        } catch {
          const node = document.getElementById(addressId);
          const selection = window.getSelection();
          if (node && selection) {
            const range = document.createRange();
            range.selectNodeContents(node);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          setState("selected");
        }
      }}
      className="rounded-md border border-white/[0.12] bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-300 transition-colors hover:border-white/30 hover:text-white"
    >
      <span aria-live="polite">{LABEL[state]}</span>
    </button>
  );
}
