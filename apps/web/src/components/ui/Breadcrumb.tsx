import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500 sm:text-sm">
        {items.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className="flex min-w-0 items-center gap-1.5"
          >
            {item.to ? (
              <Link
                href={item.to}
                className="truncate rounded-md transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate text-slate-300">
                {item.label}
              </span>
            )}
            {index < items.length - 1 ? (
              <HiChevronRight
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 text-slate-700"
              />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
