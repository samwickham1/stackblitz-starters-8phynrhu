"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ScorePill from "@/components/ScorePill";
import SignalTimeline from "@/components/SignalTimeline";
import SponsorshipList from "@/components/SponsorshipList";
import FeedbackPanel from "@/components/FeedbackPanel";
import LiveSignals from "@/components/LiveSignals";
import { companies } from "@/lib/data";
import { topSignals } from "@/lib/score";
import { usePipeline } from "@/lib/pipeline";

export default function CompanyPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const company = companies.find((c) => c.id === id);
  const { addToPipeline, setStage, getItem } = usePipeline();

  if (!company) {
    return (
      <div className="panel p-6">
        <h1 className="text-2xl font-semibold">Company not found</h1>
        <Link href="/search" className="mt-4 inline-block text-sm underline">
          Back to search
        </Link>
      </div>
    );
  }

  const top = topSignals(company.signals);
  const rationale =
    company.rationale ??
    top.map((signal) => `${signal.type} is a top driver for this score.`);
  const marketingObjectives =
    company.marketingObjectives ?? ["Increase brand awareness", "Drive consideration"];
  const businessObjectives =
    company.businessObjectives ?? ["Expand market reach", "Accelerate revenue growth"];
  const rightsRationale =
    company.rightsholderRationale ??
    company.rightsFit.map((holder) => ({
      holder,
      reason: "Audience alignment and visibility fit."
    }));

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate">
              {company.industry} • {company.region}
            </div>
            <h1 className="mt-2 text-3xl font-semibold">{company.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate">
              {company.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
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
          <div className="space-y-3">
            <ScorePill score={company.score} />
            <div className="text-xs uppercase tracking-[0.2em] text-slate">
              Top drivers
            </div>
            <div className="text-sm">
              {top.map((signal) => signal.type).join(" • ")}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => addToPipeline(company.id)}
            className="rounded-full border border-ink/20 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-mist"
          >
            Add to pipeline
          </button>
          <button
            onClick={() => setStage(company.id, "Contacted")}
            className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-mist"
          >
            Mark contacted
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate">
            Score rationale
          </div>
          <div className="card p-4 space-y-2 text-sm">
            {rationale.map((line, index) => (
              <div key={index}>• {line}</div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate">
            Objectives
          </div>
          <div className="card p-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate">
                Marketing
              </div>
              <ul className="mt-2 space-y-2 text-sm">
                {marketingObjectives.map((objective, index) => (
                  <li key={index}>• {objective}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate">
                Business
              </div>
              <ul className="mt-2 space-y-2 text-sm">
                {businessObjectives.map((objective, index) => (
                  <li key={index}>• {objective}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate">
            Signals
          </div>
          <SignalTimeline signals={company.signals} />
        </div>
        <div>
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate">
            Rights-holder fit
          </div>
          <div className="space-y-3">
            {rightsRationale.map((item, index) => (
              <div key={index} className="card p-4">
                <div className="font-semibold">{item.holder}</div>
                <div className="mt-2 text-sm text-slate">{item.reason}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate">
              Existing sponsorships
            </div>
            <SponsorshipList sponsorships={company.sponsorships} />
          </div>
        </div>
      </section>

      <LiveSignals companyName={company.name} />

      <FeedbackPanel companyId={company.id} rightsOptions={company.rightsFit} />

      <section className="panel p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-slate">
          Pipeline status
        </div>
        <div className="mt-2 text-lg font-semibold">
          {getItem(company.id)?.stage ?? "Not in pipeline"}
        </div>
      </section>
    </div>
  );
}
