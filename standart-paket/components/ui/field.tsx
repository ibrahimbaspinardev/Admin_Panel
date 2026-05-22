import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-teal-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white ${props.className ?? ""}`}
    />
  );
}

export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition focus:border-teal-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white ${props.className ?? ""}`}
    />
  );
}
