'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { TableSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  // Search
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  // Extra controls
  filtersNode?: React.ReactNode;
  actionsNode?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no items matching your criteria.',
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  currentPage = 1,
  totalPages = 1,
  totalItems,
  onPageChange,
}: DataTableProps<T>) {
  const safeData: T[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : [];

  return (
    <div className="bg-white rounded-2xl border border-[#E9E3EB] shadow-xs overflow-hidden transition-all">
      {/* Search Header */}
      {onSearchChange && (
        <div className="p-4 border-b border-[#E9E3EB] flex items-center justify-between gap-4 bg-[#FAF8FB]/40">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#716975] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="admin-datatable-search-input"
              name="admin-datatable-search-input"
              type="text"
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              autoComplete="off"
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E9E3EB] rounded-xl text-xs text-[#29252B] placeholder:text-[#716975] focus:outline-none focus:border-[#74189B] transition"
            />
          </div>
        </div>
      )}

      {/* Main Table Content */}
      {loading ? (
        <div className="p-4">
          <TableSkeleton rows={6} cols={columns.length} />
        </div>
      ) : safeData.length === 0 ? (
        <div className="p-8">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E9E3EB] bg-[#FAF8FB]/70 text-[11px] font-bold text-[#716975] uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className={`py-3 px-4 ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E3EB]/70 text-xs">
              {safeData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="hover:bg-[#FAF8FB]/60 transition-colors duration-150"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-3.5 px-4 text-[#29252B] ${col.className || ''}`}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? (row[col.accessorKey] as React.ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination footer */}
      {!loading && safeData.length > 0 && onPageChange && totalPages > 1 && (
        <div className="p-4 border-t border-[#E9E3EB] flex items-center justify-between text-xs text-[#716975] bg-[#FAF8FB]/40">
          <div>
            {totalItems !== undefined ? (
              <span>
                Showing Page <strong className="text-[#29252B]">{currentPage}</strong> of{' '}
                <strong className="text-[#29252B]">{totalPages}</strong> ({totalItems} total)
              </span>
            ) : (
              <span>
                Page <strong className="text-[#29252B]">{currentPage}</strong> of{' '}
                <strong className="text-[#29252B]">{totalPages}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-[#E9E3EB] text-slate-600 hover:bg-white hover:text-[#74189B] disabled:opacity-40 disabled:pointer-events-none transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-[#74189B] bg-white border border-[#E9E3EB] rounded-lg">
              {currentPage}
            </span>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-[#E9E3EB] text-slate-600 hover:bg-white hover:text-[#74189B] disabled:opacity-40 disabled:pointer-events-none transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
