"use client";

import Link from "next/link";
import ScorePill from "@/components/ScorePill";
import SignalBars from "@/components/SignalBars";
import Badge from "@/components/Badge";
import { Company } from "@/lib/types";
import { usePipeline } from "@/lib/pipeline";
import { scoreTier } from "@/lib/score";

export default function CompanyCard({ company }: { company: Company }) {
  const { addToPipeline, getItem } = usePipeline();
  const item = getItem(company.id);

  return (
    <div className="card animate-fadeUp p-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold">{company.name}</h3>
            <Badge label={company.industry} />
            <Badge label={company.region} />
          </div>
          <p className="mt-2 max-w-2xl text-sm text-slate">
            {company.description}
          </p>
        </div>
        <ScorePill score={company.score} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-black/10 bg-white/70 p-4">
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate">
            Rights Fit
          </div>
          <div className="flex flex-wrap gap-2">
            {company.rightsFit.map((right) => (
              <span
                key={right}
                className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink"
              >
                {right}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white/70 p-4">
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate">
            Signal Drivers
          </div>
          <SignalBars signals={company.signals} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] text-slate">
          Tier: {scoreTier(company.score)}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => addToPipeline(company.id)}
            className="rounded-full border border-ink/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-mist"
          >
            {item ? "In Pipeline" : "Add to Pipeline"}
          </button>
          <Link
            href={`/company/${company.id}`}
            className="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-mist hover:bg-ink/90"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
