import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-800/80 bg-[#0d1424]/90 p-5 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

type BadgeTone =
  | "neutral"
  | "indigo"
  | "emerald"
  | "amber"
  | "rose"
  | "sky"
  | "demo";

const BADGE_STYLES: Record<BadgeTone, string> = {
  neutral: "border-slate-700/80 bg-slate-800/70 text-slate-300",
  indigo: "border-indigo-500/30 bg-indigo-500/15 text-indigo-300",
  emerald: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  amber: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  rose: "border-rose-500/30 bg-rose-500/15 text-rose-300",
  sky: "border-sky-500/30 bg-sky-500/15 text-sky-300",
  demo: "border-amber-400/50 bg-amber-500/20 text-amber-200 font-semibold tracking-wide",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        BADGE_STYLES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/40 shadow-sm",
  secondary:
    "bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-slate-700",
  ghost:
    "bg-transparent hover:bg-slate-800/70 text-slate-300 hover:text-white border border-transparent",
  danger:
    "bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-500/40",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        BUTTON_STYLES[variant],
        className
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-slate-700/90 bg-[#090f1d] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-slate-700/90 bg-[#090f1d] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-slate-700/90 bg-[#090f1d] px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function AlertBanner({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: "info" | "warning" | "error" | "success";
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    info: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    warning: "border-amber-500/40 bg-amber-500/15 text-amber-200",
    error: "border-rose-500/40 bg-rose-500/15 text-rose-200",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  }[tone];

  const Icon = {
    info: Info,
    warning: TriangleAlert,
    error: AlertCircle,
    success: CheckCircle2,
  }[tone];

  return (
    <div
      role="status"
      className={cn("flex items-start gap-3 rounded-xl border p-4 text-sm", styles, className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-[#0a101e] px-6 py-12 text-center">
      {icon && <div className="mb-3 text-slate-400">{icon}</div>}
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-slate-800/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
