import Link from "next/link";
import CompanyCard from "@/components/CompanyCard";
import { companies } from "@/lib/data";
import { scoreTier, topSignals } from "@/lib/score";

export default function HomePage() {
  const ranked = [...companies].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-8">
      <section className="panel p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-slate">
          Sponsorship Signals
        </div>
        <h1 className="mt-2 text-4xl font-semibold">
          Companies most likely to activate partnerships soon.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate">
          Click any company to view score rationale, signals, objectives, and rights‑holder fit.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Link
            href="/search"
            className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-mist"
          >
            Search a company
          </Link>
          <div className="text-xs text-slate">
            {companies.length} tracked • High tier:{" "}
            {companies.filter((c) => scoreTier(c.score) === "High").length}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {ranked.map((company) => (
          <div key={company.id} className="space-y-2">
            <div className="text-xs uppercase tracking-[0.2em] text-slate">
              Rationale: {topSignals(company.signals).map((s) => s.type).join(" • ")}
            </div>
            <CompanyCard company={company} />
          </div>
        ))}
      </section>
    </div>
  );
}
