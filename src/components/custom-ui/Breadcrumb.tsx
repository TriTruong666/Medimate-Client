import { Link } from "react-router-dom";

type BreadcrumbChildProps = {
  label: string;
  path?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbChildProps[];
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="transition-colors hover:text-gray-900 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-white">{item.label}</span>
            )}

            {!isLast && <span className="opacity-40">/</span>}
          </div>
        );
      })}
    </nav>
  );
}
