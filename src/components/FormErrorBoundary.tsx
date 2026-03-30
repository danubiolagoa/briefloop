"use client";

import React from "react";

import { Button } from "@/components/ui/button";

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  title: string;
}

interface FormErrorBoundaryState {
  hasError: boolean;
}

export class FormErrorBoundary extends React.Component<FormErrorBoundaryProps, FormErrorBoundaryState> {
  state: FormErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="rounded-[24px] border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Falha de renderizacao</p>
          <h2 className="mt-2 font-sans text-2xl font-semibold text-text-primary">{this.props.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Encontramos um problema ao carregar este formulario. Atualize a pagina para tentar novamente.
          </p>
          <div className="mt-4">
            <Button type="button" onClick={() => window.location.reload()}>
              Recarregar pagina
            </Button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
