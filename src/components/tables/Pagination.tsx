import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  disabled?: boolean;
}

const buttonClasses =
  'flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-md border border-gray-300';
const selectClasses =
  'border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand disabled:opacity-50';

/**
 * Presentational only — no fetching, no internal page state. The caller owns page/pageSize
 * and passes the allowed page sizes explicitly, since Factory caps at 10 while Depot allows
 * up to 100 (see docs/api/factory.md, docs/api/depot.md).
 */
export function Pagination({
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  disabled,
}: PaginationProps) {
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <span className="text-sm text-gray-500">
        Page {currentPage} of {totalPages} · {totalItems} total
      </span>
      <div className="flex items-center gap-3">
        {onPageSizeChange && pageSizeOptions && pageSizeOptions.length > 0 && (
          <select
            value={pageSize}
            disabled={disabled}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={selectClasses}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={disabled || !hasPrevPage}
            className={buttonClasses}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={disabled || !hasNextPage}
            className={buttonClasses}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
