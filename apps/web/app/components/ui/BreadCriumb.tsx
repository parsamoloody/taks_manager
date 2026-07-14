// app/components/ui/Breadcrumb.tsx
import { Link } from "react-router";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-400">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {item.to ? (
            <Link to={item.to} className="transition hover:text-white">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-200">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="text-slate-600">/</span>}
        </span>
      ))}
    </nav>
  );
}