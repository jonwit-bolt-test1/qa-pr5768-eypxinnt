import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Database,
  Cloud,
  Shield,
  Zap,
  Wifi,
  Globe,
  type LucideIcon,
} from "lucide-react";

type CheckState = "pending" | "running" | "passed" | "failed";

interface CheckItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  state: CheckState;
  detail: string;
}

const initialChecks: CheckItem[] = [
  {
    id: "network",
    label: "Network Reachability",
    description: "Latency & packet loss to edge nodes",
    icon: Wifi,
    state: "pending",
    detail: "—",
  },
  {
    id: "database",
    label: "Database Connection",
    description: "Postgres pool & migration status",
    icon: Database,
    state: "pending",
    detail: "—",
  },
  {
    id: "auth",
    label: "Auth Service",
    description: "Token exchange & session validation",
    icon: Shield,
    state: "pending",
    detail: "—",
  },
  {
    id: "api",
    label: "API Gateway",
    description: "REST & WebSocket endpoint health",
    icon: Globe,
    state: "pending",
    detail: "—",
  },
  {
    id: "storage",
    label: "Object Storage",
    description: "Bucket access & read/write round-trip",
    icon: Cloud,
    state: "pending",
    detail: "—",
  },
  {
    id: "edge",
    label: "Edge Functions",
    description: "Cold-start & runtime readiness",
    icon: Zap,
    state: "pending",
    detail: "—",
  },
];

function stateConfig(state: CheckState) {
  switch (state) {
    case "passed":
      return {
        ring: "ring-emerald-400/30",
        bg: "bg-emerald-500/10",
        iconColor: "text-emerald-400",
        barColor: "bg-emerald-400",
        labelColor: "text-emerald-400",
        label: "Ready",
      };
    case "running":
      return {
        ring: "ring-cyan-400/40",
        bg: "bg-cyan-500/10",
        iconColor: "text-cyan-400",
        barColor: "bg-cyan-400",
        labelColor: "text-cyan-400",
        label: "Checking",
      };
    case "failed":
      return {
        ring: "ring-rose-400/30",
        bg: "bg-rose-500/10",
        iconColor: "text-rose-400",
        barColor: "bg-rose-400",
        labelColor: "text-rose-400",
        label: "Failed",
      };
    default:
      return {
        ring: "ring-slate-700/50",
        bg: "bg-slate-800/40",
        iconColor: "text-slate-500",
        barColor: "bg-slate-600",
        labelColor: "text-slate-500",
        label: "Queued",
      };
  }
}

interface StatusCheckProps {
  item: CheckItem;
}

export function StatusCheck({ item }: StatusCheckProps) {
  const cfg = stateConfig(item.state);
  const Icon = item.icon;

  return (
    <div
      className={`group relative flex items-center gap-4 rounded-xl border border-slate-800/80 ${cfg.bg} p-4 transition-all duration-500 hover:border-slate-700`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ${cfg.ring} ${cfg.iconColor} transition-all duration-500`}
      >
        {item.state === "running" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : item.state === "passed" ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : item.state === "failed" ? (
          <AlertCircle className="h-5 w-5" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-100">
            {item.label}
          </p>
          <span className={`text-xs font-medium ${cfg.labelColor}`}>
            {cfg.label}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {item.description}
        </p>
        <p className="mt-1 truncate font-mono text-[11px] text-slate-600">
          {item.detail}
        </p>
      </div>

      <div
        className={`absolute bottom-0 left-4 right-4 h-px origin-left scale-x-0 ${cfg.barColor} transition-transform duration-700`}
        style={{
          transform: item.state === "passed" || item.state === "failed" ? "scaleX(1)" : "scaleX(0)",
          opacity: item.state === "passed" || item.state === "failed" ? 0.5 : 0,
        }}
      />
    </div>
  );
}

export { initialChecks, type CheckItem, type CheckState };
