"use client";

import { useEffect, useState } from "react";

type Feedback = {
  accuracy: "Too high" | "About right" | "Too low";
  targetRightsHolder: string;
  intent: "Contact" | "Monitor" | "Deprioritize";
  notes: string;
  updatedAt: string;
};

const STORAGE_KEY = "signal_scout_feedback_v1";

function loadAllFeedback(): Record<string, Feedback> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, Feedback>;
  } catch {
    return {};
  }
}

function loadFeedback(companyId: string): Feedback | null {
  const all = loadAllFeedback();
  return all[companyId] ?? null;
}

function saveFeedback(companyId: string, feedback: Feedback) {
  if (typeof window === "undefined") return;
  const all = loadAllFeedback();
  all[companyId] = feedback;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function toCsv(data: Record<string, Feedback>) {
  const headers = [
    "companyId",
    "accuracy",
    "intent",
    "targetRightsHolder",
    "notes",
    "updatedAt"
  ];
  const rows = Object.entries(data).map(([companyId, feedback]) => [
    companyId,
    feedback.accuracy,
    feedback.intent,
    feedback.targetRightsHolder,
    `"${feedback.notes.replace(/"/g, '""')}"`,
    feedback.updatedAt
  ]);
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export default function FeedbackPanel({
  companyId,
  rightsOptions
}: {
  companyId: string;
  rightsOptions: string[];
}) {
  const [accuracy, setAccuracy] = useState<Feedback["accuracy"]>("About right");
  const [intent, setIntent] = useState<Feedback["intent"]>("Monitor");
  const [targetRightsHolder, setTargetRightsHolder] = useState(
    rightsOptions[0] ?? ""
  );
  const [notes, setNotes] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadFeedback(companyId);
    if (existing) {
      setAccuracy(existing.accuracy);
      setIntent(existing.intent);
      setTargetRightsHolder(existing.targetRightsHolder);
      setNotes(existing.notes);
      setSavedAt(existing.updatedAt);
    }
  }, [companyId]);

  const onSave = () => {
    const updatedAt = new Date().toISOString();
    saveFeedback(companyId, {
      accuracy,
      intent,
      targetRightsHolder,
      notes,
      updatedAt
    });
    setSavedAt(updatedAt);
  };

  const onExportJson = () => {
    const data = loadAllFeedback();
    download("feedback.json", JSON.stringify(data, null, 2), "application/json");
  };

  const onExportCsv = () => {
    const data = loadAllFeedback();
    download("feedback.csv", toCsv(data), "text/csv");
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate">
            ML feedback
          </div>
          <h3 className="mt-2 text-lg font-semibold">Refine the model</h3>
          <p className="mt-1 text-sm text-slate">
            Your feedback will be used to improve scoring and recommendations.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExportJson}
            className="rounded-full border border-ink/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
          >
            Export JSON
          </button>
          <button
            onClick={onExportCsv}
            className="rounded-full border border-ink/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.2em] text-slate">
            Score accuracy
          </div>
          {["Too high", "About right", "Too low"].map((value) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="accuracy"
                value={value}
                checked={accuracy === value}
                onChange={() => setAccuracy(value as Feedback["accuracy"])}
              />
              {value}
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.2em] text-slate">
            Outreach intent
          </div>
          <select
            value={intent}
            onChange={(event) =>
              setIntent(event.target.value as Feedback["intent"])
            }
            className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm"
          >
            <option>Contact</option>
            <option>Monitor</option>
            <option>Deprioritize</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.2em] text-slate">
            Best-fit rights holder
          </div>
          <select
            value={targetRightsHolder}
            onChange={(event) => setTargetRightsHolder(event.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm"
          >
            {rightsOptions.map((right) => (
              <option key={right}>{right}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-[0.2em] text-slate">
          Notes
        </div>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm"
          placeholder="Why this score feels off or right, signals you’ve seen, deal context..."
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={onSave}
          className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-mist"
        >
          Save feedback
        </button>
        {savedAt && (
          <span className="text-xs text-slate">
            Saved {new Date(savedAt).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
