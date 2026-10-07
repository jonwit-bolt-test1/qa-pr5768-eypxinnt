import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Copy,
  CircleCheck,
  RefreshCw,
  Server,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import {
  StatusCheck,
  initialChecks,
  type CheckItem,
  type CheckState,
} from "@/components/StatusCheck";
import { ProgressRing } from "@/components/ProgressRing";

type OverallState = "checking" | "ready" | "failed";

const latencyData: Record<string, string> = {
  network: "12ms RTT · 0% packet loss",
  database: "Pool: 8/10 conns · 12 migrations applied",
  auth: "Token exchange: 34ms · session OK",
  api: "REST: 200 · WS: connected · 41ms",
  storage: "Bucket: prod-assets · RW 88ms",
  edge: "Cold start: 210ms · 6 functions live",
};

export default function App() {
  const [checks, setChecks] = useState<CheckItem[]>(initialChecks);
  const [overall, setOverall] = useState<OverallState>("checking");
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const progress = useMemo(() => {
    const total = checks.length;
    const done = checks.filter((c) => c.state === "passed" || c.state === "failed").length;
    return (done / total) * 100;
  }, [checks]);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 100), 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (overall !== "checking") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    checks.forEach((check, i) => {
      timers.push(
        setTimeout(() => {
          setChecks((prev) =>
            prev.map((c) =>
              c.id === check.id ? { ...c, state: "running" as CheckState } : c
            )
          );
          timers.push(
            setTimeout(() => {
              setChecks((prev) =>
                prev.map((c) =>
                  c.id === check.id
                    ? { ...c, state: "passed" as CheckState, detail: latencyData[c.id] }
                    : c
                )
              );
            }, 600 + Math.random() * 500)
          );
        }, 400 + i * 650)
      );
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overall === "checking"]);

  useEffect(() => {
    const allDone = checks.every((c) => c.state === "passed" || c.state === "failed");
    if (allDone && overall === "checking") {
      const anyFailed = checks.some((c) => c.state === "failed");
      setOverall(anyFailed ? "failed" : "ready");
    }
  }, [checks, overall]);

  const handleRecheck = () => {
    setChecks(initialChecks.map((c) => ({ ...c, state: "pending" as CheckState, detail: "—" })));
    setOverall("checking");
    setElapsed(0);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const readyCount = checks.filter((c) => c.state === "passed").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-teal-500/5 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 sm:px-8 lg:py-12">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 shadow-lg shadow-cyan-500/20">
              <Activity className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-100">QA Bolt</p>
              <p className="text-xs text-slate-500">Environment Health</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              {overall === "ready" ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              ) : overall === "failed" ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              ) : (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  overall === "ready"
                    ? "bg-emerald-400"
                    : overall === "failed"
                    ? "bg-rose-400"
                    : "bg-cyan-400"
                }`}
              />
            </span>
            <span className="text-xs font-medium text-slate-400">
              {overall === "ready"
                ? "All systems operational"
                : overall === "failed"
                ? "Action required"
                : "Running checks..."}
            </span>
          </div>
        </header>

        {/* Main content */}
        <main className="mt-10 flex flex-1 flex-col gap-8 lg:mt-16">
          {/* Hero status block */}
          <section className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1">
                <Server className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-slate-400">
                  us-east-2 · production
                </span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
                {overall === "ready" ? (
                  <>
                    You&apos;re{" "}
                    <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                      connect-ready
                    </span>
                  </>
                ) : overall === "failed" ? (
                  "Connection issues detected"
                ) : (
                  "Verifying your environment"
                )}
              </h1>

              <p className="max-w-lg text-base leading-relaxed text-slate-400">
                {overall === "ready"
                  ? "All six subsystems passed their health checks. Your project is wired up and ready to accept traffic."
                  : overall === "failed"
                  ? "One or more subsystems didn't pass. Review the details below and re-run the checks once resolved."
                  : "We're running connectivity, database, auth, API, storage, and edge-function checks. This usually takes a few seconds."}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {overall === "ready" && (
                  <button className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 hover:brightness-110">
                    Launch dashboard
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
                <button
                  onClick={handleRecheck}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:border-slate-700 hover:text-slate-100"
                >
                  <RefreshCw className={`h-4 w-4 ${overall === "checking" ? "animate-spin" : ""}`} />
                  Re-run checks
                </button>
              </div>
            </div>

            {/* Progress ring */}
            <div className="flex flex-col items-center justify-center gap-3">
              <ProgressRing progress={progress} />
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  {readyCount}/{checks.length} passed
                </span>
                <span className="text-slate-600">·</span>
                <span className="font-mono tabular-nums text-slate-500">
                  {(elapsed / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
          </section>

          {/* Checks grid */}
          <section className="grid gap-3 sm:grid-cols-2">
            {checks.map((check) => (
              <StatusCheck key={check.id} item={check} />
            ))}
          </section>

          {/* Connection info panel — only when ready */}
          {overall === "ready" && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-400/30">
                      <CircleCheck className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">
                        Connection details
                      </h3>
                      <p className="text-xs text-slate-500">
                        Use these values to connect your client
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:border-slate-700 hover:text-slate-200"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 rounded-lg border border-slate-800/60 bg-slate-950/60 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-600">
                    <Terminal className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">connection string</span>
                  </div>
                  <code className="block font-mono text-xs leading-relaxed text-slate-400 break-all">
                    <span className="text-emerald-400">postgresql</span>://
                    <span className="text-cyan-400">prod_user</span>:
                    <span className="text-slate-500">••••••</span>@
                    <span className="text-slate-300">db.us-east-2.qabolt.io</span>:
                    <span className="text-slate-300">5432</span>/
                    <span className="text-slate-300">production</span>
                  </code>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Region" value="us-east-2" />
                  <StatCard label="Latency" value="12ms" />
                  <StatCard label="Uptime" value="99.98%" />
                  <StatCard label="Version" value="v2.4.1" />
                </div>
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="mt-auto flex flex-col items-center justify-between gap-2 border-t border-slate-900 pt-6 text-xs text-slate-600 sm:flex-row">
            <span>Last checked: {new Date().toLocaleTimeString()}</span>
            <span>QA Bolt · Environment Health Monitor</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3">
      <p className="text-[11px] uppercase tracking-wider text-slate-600">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}

// Re-export to satisfy import tracking for LucideIcon type
export type { LucideIcon };
