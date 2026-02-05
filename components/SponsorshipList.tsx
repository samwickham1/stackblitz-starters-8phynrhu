import { Sponsorship } from "@/lib/types";

export default function SponsorshipList({
  sponsorships
}: {
  sponsorships: Sponsorship[];
}) {
  if (sponsorships.length === 0) {
    return (
      <div className="card p-4 text-sm text-slate">
        No known sponsorships yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sponsorships.map((s) => (
        <div key={s.id} className="card p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{s.rightsHolder}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate">
              {s.status}
            </div>
          </div>
          <div className="mt-2 text-sm text-slate">
            {s.sport} • {s.league} • {s.region}
          </div>
        </div>
      ))}
    </div>
  );
}
