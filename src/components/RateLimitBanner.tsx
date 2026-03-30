import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function RateLimitBanner({ message }: { message: string }) {
  return (
    <Card className="border-danger/40">
      <CardContent className="flex items-start gap-3 pt-5 text-sm text-text-secondary">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
        <p>{message}</p>
      </CardContent>
    </Card>
  );
}
