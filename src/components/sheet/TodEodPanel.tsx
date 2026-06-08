"use client";

import { FileText, Sparkles, Sun, Sunset } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface TodEodPanelProps {
  employeeId: string;
  date: string;
  readOnly?: boolean;
}

export function TodEodPanel({ employeeId, date, readOnly }: TodEodPanelProps) {
  const { getSheet, generateTodDraft, generateEodDraft } = useApp();
  const sheet = getSheet(employeeId, date);
  const [generating, setGenerating] = useState<"tod" | "eod" | null>(null);

  const handleGenerateTod = () => {
    setGenerating("tod");
    generateTodDraft(employeeId, date);
    setTimeout(() => setGenerating(null), 400);
  };

  const handleGenerateEod = () => {
    setGenerating("eod");
    generateEodDraft(employeeId, date);
    setTimeout(() => setGenerating(null), 400);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <h3 className="font-semibold text-zinc-100">TOD / EOD Drafts</h3>
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">
          AI placeholder generation — wire to API later
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGenerateTod}
              disabled={generating === "tod"}
            >
              <Sun className="h-3.5 w-3.5" />
              Generate TOD
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGenerateEod}
              disabled={generating === "eod"}
            >
              <Sunset className="h-3.5 w-3.5" />
              Generate EOD
            </Button>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <Sun className="h-3.5 w-3.5" />
              Start of Day (TOD)
            </div>
            <pre className="max-h-40 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 text-xs leading-relaxed text-zinc-400 whitespace-pre-wrap">
              {sheet?.todDraft || "No TOD draft yet. Generate from today's sheet."}
            </pre>
          </div>
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <FileText className="h-3.5 w-3.5" />
              End of Day (EOD)
            </div>
            <pre className="max-h-40 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 text-xs leading-relaxed text-zinc-400 whitespace-pre-wrap">
              {sheet?.eodDraft || "No EOD draft yet. Generate from today's sheet."}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
