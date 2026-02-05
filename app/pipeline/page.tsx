"use client";

import { companies } from "@/lib/data";
import { usePipeline } from "@/lib/pipeline";
import { PipelineStage } from "@/lib/types";
import ScorePill from "@/components/ScorePill";

const stages: PipelineStage[] = ["Target", "Contacted", "Outcome"];

export default function PipelinePage() {
  const { items, setStage, setNotes, remove } = usePipeline();

  const grouped = stages.map((stage) => ({
    stage,
    items: items.filter((i) => i.stage === stage)
  }));

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-slate">
          Outreach pipeline
        </div>
        <h1 className="mt-2 text-3xl font-semibold">
          Track your outreach momentum.
        </h1>
        <p className="mt-2 text-sm text-slate">
          Quick status changes and notes are stored locally in your browser.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {grouped.map((column) => (
          <div key={column.stage} className="panel p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate">
              {column.stage}
            </div>
            <div className="mt-3 space-y-4">
              {column.items.map((item) => {
                const company = companies.find((c) => c.id === item.companyId);
                if (!company) return null;

                return (
                  <div key={item.companyId} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{company.name}</div>
                      <ScorePill score={company.score} />
                    </div>
                    <div className="mt-2 text-xs text-slate">
                      {company.industry} • {company.region}
                    </div>
                    <div className="mt-3">
                      <select
                        value={item.stage}
                        onChange={(event) =>
                          setStage(item.companyId, event.target.value as PipelineStage)
                        }
                        className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-xs uppercase tracking-[0.2em]"
                      >
                        {stages.map((stage) => (
                          <option key={stage}>{stage}</option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      value={item.notes}
                      onChange={(event) => setNotes(item.companyId, event.target.value)}
                      placeholder="Notes or next step..."
                      className="mt-3 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-xs"
                      rows={3}
                    />
                    <button
                      onClick={() => remove(item.companyId)}
                      className="mt-3 text-xs uppercase tracking-[0.2em] text-slate underline"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
              {column.items.length === 0 && (
                <div className="text-sm text-slate">No companies yet.</div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
