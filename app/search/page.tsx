"use client";

import { useMemo, useState } from "react";
import CompanyCard from "@/components/CompanyCard";
import { companies, rightsHolders } from "@/lib/data";
import { scoreTier } from "@/lib/score";

const industries = Array.from(new Set(companies.map((c) => c.industry)));
const regions = Array.from(new Set(companies.map((c) => c.region)));
const marketingObjectives = Array.from(
  new Set(companies.flatMap((c) => c.marketingObjectives ?? []))
);

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All");
  const [region, setRegion] = useState("All");
  const [rights, setRights] = useState("All");
  const [tier, setTier] = useState("All");
  const [objective, setObjective] = useState("All");

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return companies
      .filter((company) => {
        const matchesQuery =
          !q ||
          company.name.toLowerCase().includes(q) ||
          company.domain.toLowerCase().includes(q) ||
          company.industry.toLowerCase().includes(q) ||
          company.description.toLowerCase().includes(q);

        const matchesIndustry = industry === "All" || company.industry === industry;
        const matchesRegion = region === "All" || company.region === region;
        const matchesRights =
          rights === "All" || company.rightsFit.includes(rights);
        const matchesTier = tier === "All" || scoreTier(company.score) === tier;
        const matchesObjective =
          objective === "All" ||
          (company.marketingObjectives ?? []).includes(objective);

        return (
          matchesQuery &&
          matchesIndustry &&
          matchesRegion &&
          matchesRights &&
          matchesTier &&
          matchesObjective
        );
      })
      .sort((a, b) => b.score - a.score);
  }, [query, industry, region, rights, tier, objective]);

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-slate">
          Search companies
        </div>
        <h1 className="mt-2 text-3xl font-semibold">
          Find companies with sponsorship momentum.
        </h1>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-6">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, domain, or industry"
            className="md:col-span-2 rounded-xl border border-black/10 bg-white/80 px-4 py-2 text-sm focus:outline-none"
          />

          <select
            value={industry}
            onChange={(event) => setIndustry(event.target.value)}
            className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm"
          >
            <option>All</option>
            {industries.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>

          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm"
          >
            <option>All</option>
            {regions.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>

          <select
            value={rights}
            onChange={(event) => setRights(event.target.value)}
            className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm"
          >
            <option>All</option>
            {rightsHolders.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>

          <select
            value={tier}
            onChange={(event) => setTier(event.target.value)}
            className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm"
          >
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            className="rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm"
          >
            <option>All</option>
            {marketingObjectives.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-xs uppercase tracking-[0.2em] text-slate">
          {results.length} results
        </div>
        {results.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </section>
    </div>
  );
}
