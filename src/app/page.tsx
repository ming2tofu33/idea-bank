export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="rounded-card-lg bg-surface p-12 shadow-marshmallow text-center">
        <h1 className="text-5xl font-bold text-text-main mb-4">Idea Bank</h1>
        <p className="text-lg text-text-muted">
          매일 아침 5분, 키워드 조합 기반 비즈니스 아이디어
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <span className="px-4 py-2 rounded-full bg-accent-peach/30 text-sm font-semibold text-orange-600/70">
            Who
          </span>
          <span className="px-4 py-2 rounded-full bg-accent-mint/30 text-sm font-semibold text-teal-600/70">
            Domain
          </span>
          <span className="px-4 py-2 rounded-full bg-accent-lime/40 text-sm font-semibold text-lime-700/70">
            Tech
          </span>
          <span className="px-4 py-2 rounded-full bg-accent-purple/30 text-sm font-semibold text-purple-600/70">
            Value
          </span>
          <span className="px-4 py-2 rounded-full bg-primary/20 text-sm font-semibold text-primary">
            Money
          </span>
        </div>
      </div>
    </main>
  );
}
