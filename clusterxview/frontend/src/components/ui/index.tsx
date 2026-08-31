import clsx from "clsx";

export function StatusBadge({ status, children }: { status: "green" | "yellow" | "red" | "blue"; children: React.ReactNode }) {
  const colors = {
    green: "bg-emerald-100 text-emerald-800 border-emerald-200",
    yellow: "bg-amber-100 text-amber-800 border-amber-200",
    red: "bg-red-100 text-red-800 border-red-200",
    blue: "bg-sky-100 text-sky-800 border-sky-200",
  };
  const dots = { green: "🟢", yellow: "🟡", red: "🔴", blue: "🔵" };
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm", colors[status])}>
      <span>{dots[status]}</span>
      {children}
    </span>
  );
}

export function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      {title && <h2 className="mb-4 text-lg font-semibold text-slate-800">{title}</h2>}
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-slate-800 text-white hover:bg-slate-700",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-500",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx("rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50", styles[variant])}
    >
      {children}
    </button>
  );
}

export function DataTable({ headers, rows }: { headers: string[]; rows: (string | number | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
