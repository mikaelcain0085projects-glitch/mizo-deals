export default function Loading() {
  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="h-4 w-28 animate-pulse rounded bg-white/10" />

          <div className="mt-8 h-16 w-64 animate-pulse rounded bg-white/10" />

          <div className="mt-5 h-5 w-96 max-w-full animate-pulse rounded bg-white/10" />
        </div>

        <div className="mb-12 flex gap-3">
          <div className="h-10 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-28 animate-pulse rounded-full bg-white/10" />
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              <div className="aspect-[4/5] animate-pulse bg-white/10" />

              <div className="space-y-3 p-5">
                <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}