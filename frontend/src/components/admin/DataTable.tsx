"use client";

import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  actions?: (row: T) => ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

// Shared table shell used by every "Manage X" admin screen (Users, Articles, Jobs,
// Accommodation, Universities, Categories, Comments, Newsletter). Each screen only
// needs to define its columns and row actions — pagination/empty/loading states are
// handled once, here.
export function DataTable<T>({ columns, rows, rowKey, actions, loading, emptyMessage = "No records found." }: Props<T>) {
  if (loading) {
    return <p className="py-12 text-center text-sm text-slate-400">Loading...</p>;
  }

  if (rows.length === 0) {
    return <p className="py-12 text-center text-sm text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className={`px-4 py-3 font-medium ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 ${col.className || ""}`}>
                  {col.accessor(row)}
                </td>
              ))}
              {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
