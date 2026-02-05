import Link from "next/link";
import { companies } from "@/lib/data";

export default function CompanyIndexPage() {
  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-slate">
          Company directory
        </div>
        <h1 className="mt-2 text-3xl font-semibold">
          Select a company profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          Use the search page or jump directly into a company profile.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-mist"
          >
            Go to search
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/company/${company.id}`}
            className="card p-4 hover:border-ink/30"
          >
            <div className="text-lg font-semibold">{company.name}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate">
              {company.industry} • {company.region}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
