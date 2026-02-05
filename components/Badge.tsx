export default function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-xs uppercase tracking-[0.2em] text-slate">
      {label}
    </span>
  );
}
