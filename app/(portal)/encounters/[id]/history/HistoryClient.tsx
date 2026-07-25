"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { HistoryCollection } from "@/components/history/HistoryCollection";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function HistoryClient({ id }: { id: string }) {
  const router = useRouter();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href={`/encounters/${id}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to encounter
        </Link>
      </div>

      <PageHeader
        title="History Collection"
        subtitle="AI-powered medical history interview via WebSocket"
      />

      <HistoryCollection
        encounterId={id}
        onComplete={() => router.push(`/encounters/${id}/dashboard`)}
      />
    </div>
  );
}
