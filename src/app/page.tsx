import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoopLogo } from "@/components/LoopLogo";

export default function HomePage() {
  return (
    <main>
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Hero */}
        <section className="space-y-3 text-center animate-fade-slide-up">
          <LoopLogo size="lg" className="justify-center mx-auto" />
          <p className="text-base text-text-secondary">
            A memória criativa da sua agência.
          </p>
          <p className="mx-auto max-w-xl text-sm leading-6 text-text-secondary">
            Registre o que funcionou. Gere briefs melhores. Reaproveite presets do time.
          </p>
        </section>

        {/* Action cards */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 stagger-children">
          <Link href="/debrief" className="block group">
            <Card className="h-full border-border transition-all duration-300 hover:border-accent hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:-translate-y-0.5">
              <CardHeader className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 transition-transform group-hover:scale-110">
                  <BookOpen className="h-5 w-5" />
                </div>
                <CardTitle>Registrar Campanha</CardTitle>
                <CardDescription>
                  Documente os resultados com seleção guiada, presets e menos preenchimento manual.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/brief" className="block group">
            <Card className="h-full border-border transition-all duration-300 hover:border-accent hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:-translate-y-0.5">
              <CardHeader className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 transition-transform group-hover:scale-110">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle>Criar Brief Inteligente</CardTitle>
                <CardDescription>
                  Gere um brief criativo baseado no histórico real da sua agência e em presets reutilizáveis.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </section>

        {/* Library link */}
        <Card className="overflow-hidden">
          <CardContent className="pt-5 text-center">
            <Link
              href="/biblioteca"
              className="text-sm text-text-secondary transition-colors hover:text-accent"
            >
              Ver histórico de campanhas -&gt;
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
