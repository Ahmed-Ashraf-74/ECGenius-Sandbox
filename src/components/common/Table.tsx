import type { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  render: (row: T, index: number) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export default function Table<T>({
  columns,
  data,
  rowKey,
  emptyMessage = "No clinical records found.",
  onRowClick,
}: TableProps<T>) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[#eef4fb] border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-[#052e6e]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3.5 whitespace-nowrap ${alignClass[col.align || "left"]}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-xs font-normal text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={rowKey(row, idx)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition-colors ${
                  onRowClick
                    ? "hover:bg-sky-50/60 cursor-pointer"
                    : "hover:bg-slate-50/70"
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 text-slate-700 ${alignClass[col.align || "left"]}`}
                  >
                    {col.render(row, idx)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
