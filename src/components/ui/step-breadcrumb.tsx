import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface StepBreadcrumbItem {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  isActive?: boolean;
}

interface StepBreadcrumbProps {
  items: StepBreadcrumbItem[];
  className?: string;
}

/**
 * Arrow-step breadcrumb matching the chevron/funnel design:
 *   [ Home ] ❯ [ Shop ] ❯ [ Cart ] ❯ [ Checkout ← active/blue ]
 *
 * Uses CSS clip-path to create the right-pointing arrow shape on each step.
 */
export const StepBreadcrumb: React.FC<StepBreadcrumbProps> = ({ items, className }) => {
  return (
    <nav aria-label="breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center" style={{ gap: 0 }}>
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const isActive = item.isActive || isLast;

          const content = (
            <span className="flex items-center gap-1.5 font-medium text-sm whitespace-nowrap select-none">
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              {item.label}
            </span>
          );

          const stepEl = (
            <li
              key={index}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex items-center"
              style={{
                /* Overlap each step by 10px so the arrow clips correctly */
                marginLeft: isFirst ? 0 : '-10px',
                zIndex: isActive ? 10 : items.length - index,
              }}
            >
              {/* Outer arrow shape (shadow layer) */}
              <div
                className={cn(
                  'relative flex items-center h-10 px-5 transition-all duration-150',
                  isFirst ? 'pl-4' : 'pl-6',
                  !isLast && 'pr-3',
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                )}
                style={{
                  clipPath: isFirst
                    ? isLast
                      ? 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)'
                      : 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)'
                    : isLast
                    ? 'polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)'
                    : 'polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0 50%)',
                }}
              >
                {item.href && !isActive ? (
                  <Link to={item.href} className="flex items-center gap-1.5 outline-none">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            </li>
          );

          return stepEl;
        })}
      </ol>
    </nav>
  );
};
