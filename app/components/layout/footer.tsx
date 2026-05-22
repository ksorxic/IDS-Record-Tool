export default function Footer() {
    const creationYear = 2026;
    return (
        <footer className="border-t border-slate-800 bg-slate-950 px-4 py-4 text-slate-300">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:text-base">
              <p className="font-[family:var(--font-display)] font-semibold text-white">
                IDS Record Tool Admin
              </p>
              <p className="text-slate-400">Created {creationYear}</p>
            </div>
        </footer>
    )
}
