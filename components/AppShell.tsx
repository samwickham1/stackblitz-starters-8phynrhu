import TopNav from "@/components/TopNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mist">
      <div className="absolute inset-0 bg-aurora opacity-80" />
      <div className="absolute inset-0 bg-grid opacity-25" />
      <div className="relative">
        <TopNav />
        <main className="mx-auto max-w-6xl px-6 pb-16 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
