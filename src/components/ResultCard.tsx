"use client";

import { Check, Copy, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultCardProps {
  title: string;
  channel?: string;
  content: string;
  copyLabel: string;
  resetLabel: string;
  onReset: () => void;
  secondaryHref?: string;
  secondaryLabel?: string;
  mode?: "live" | "demo";
}

export function ResultCard({
  title,
  channel,
  content,
  copyLabel,
  resetLabel,
  onReset,
  secondaryHref,
  secondaryLabel,
  mode
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copiado com sucesso!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="animate-scale-in overflow-hidden">
      {/* Live mode accent bar */}
      {mode === "live" && (
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
      )}

      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            {title}
            {mode === "live" && (
              <Sparkles className="h-4 w-4 text-amber-400 animate-bounce-in" />
            )}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {channel ? <Badge>{channel}</Badge> : null}
            {mode === "demo" ? (
              <Badge variant="warning">Modo demonstração</Badge>
            ) : mode === "live" ? (
              <Badge variant="success" className="animate-bounce-in">
                Gerado por IA real
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <article className="whitespace-pre-wrap rounded-2xl border border-border bg-white/[0.02] p-4 text-sm leading-relaxed text-text-primary">
          {content}
        </article>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleCopy}
            className={`gap-2 transition-all ${copied ? "bg-emerald-600 hover:bg-emerald-600" : ""}`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 animate-bounce-in" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {copyLabel}
              </>
            )}
          </Button>

          <Button type="button" variant="secondary" onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {resetLabel}
          </Button>

          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-raised"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
