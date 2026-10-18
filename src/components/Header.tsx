export default function Header() {
  return (
    <header className="z-50 w-full shrink-0 bg-teal-900 px-4 py-3 text-white shadow-md">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span>☕</span> Vacation Café - Chez Jessie
          </h1>
          <p className="mt-1 text-left text-xs font-medium text-emerald-200">
            Commandes à préparer
          </p>
        </div>

      </div>
    </header>
  );
}
