import { House, Table2, Tags, Utensils } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Button from './common/Button';

type PageKey = 'home' | 'categories' | 'dishes' | 'tables';

interface FooterNavProps {
  activePage: PageKey;
  onChangePage: (page: PageKey) => void;
}

const navItems: Array<{ key: PageKey; label: string; icon: LucideIcon }> = [
  { key: 'home', label: 'Accueil', icon: House },
  { key: 'tables', label: 'Tables', icon: Table2 },
  { key: 'categories', label: 'Catégories', icon: Tags },
  { key: 'dishes', label: 'Plats', icon: Utensils },
];

export default function FooterNav({ activePage, onChangePage }: FooterNavProps) {
  return (
    <nav className="z-50 w-full shrink-0 border-t border-emerald-800 bg-teal-900 text-white shadow-[0_-2px_10px_rgba(0,0,0,0.12)]">
      <div className="mx-auto flex max-w-5xl items-center justify-around gap-2 px-3 py-2">
        {navItems.map((item) => (
          <Button
            key={item.key}
            type="button"
            onClick={() => onChangePage(item.key)}
            ariaCurrent={activePage === item.key ? 'page' : undefined}
            icon={item.icon}
            iconSize={20}
            iconStrokeWidth={2}
            label={item.label}
            className={[
              'flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[10px] font-semibold leading-none transition-colors',
              activePage === item.key ? 'bg-white text-teal-900' : 'text-emerald-100 hover:bg-emerald-800/40',
            ].join(' ')}
          />
        ))}
      </div>
    </nav>
  );
}
