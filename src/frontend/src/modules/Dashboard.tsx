import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  PauseCircle,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";
import {
  STATIC_ISSUES,
  STATIC_SUGGESTIONS,
} from "../data/staticIssuesSuggestions";
import type { StaticEntry } from "../data/staticIssuesSuggestions";
import { useGoogleSheetData } from "../hooks/useGoogleSheetData";

function formatLastRefreshed(date: Date | null): string {
  if (!date) return "Never";
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  loading?: boolean;
  accent?: string;
}) {
  return (
    <Card className="flex-1">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p
                className={`text-3xl font-bold ${accent ?? "text-foreground"}`}
              >
                {value}
              </p>
            )}
          </div>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              accent ? "bg-current/10" : "bg-muted"
            }`}
          >
            <Icon size={20} className={accent ?? "text-muted-foreground"} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ priority }: { priority?: StaticEntry["priority"] }) {
  if (!priority) return null;
  const styles = {
    high: "bg-red-100 text-red-700 border-red-300",
    medium: "bg-amber-100 text-amber-700 border-amber-300",
    low: "bg-slate-100 text-slate-600 border-slate-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border shrink-0 capitalize ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function getRankBadge(rank: number) {
  if (rank === 1)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-300">
        🥇 1
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
        🥈 2
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300">
        🥉 3
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
      {rank}
    </span>
  );
}

function getRankRowClass(rank: number) {
  if (rank === 1) return "bg-amber-50/60";
  if (rank === 2) return "bg-slate-50/60";
  if (rank === 3) return "bg-orange-50/60";
  return "";
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, isError } = useGoogleSheetData();

  const activeCount = data?.activeCount ?? 0;
  const onHoldCount = data?.onHoldCount ?? 0;
  const totalCount = data?.totalCount ?? 0;
  const topPerformers = data?.topPerformers ?? [];

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ["allEmployeeData"] });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            data-ocid="dashboard.primary_button"
            className="gap-2"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Employee performance at a glance
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated:{" "}
          <span className="font-medium">
            {formatLastRefreshed(data?.lastRefreshed ?? null)}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {isError && (
        <div
          data-ocid="dashboard.error_state"
          className="flex items-center gap-2 px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm"
        >
          <AlertTriangle size={16} className="shrink-0" />
          Could not load data from Google Sheets. Retrying automatically.
        </div>
      )}

      {/* Stat Cards */}
      <div className="flex gap-4">
        <StatCard
          title="Active Employees"
          value={isLoading ? "—" : activeCount.toString()}
          icon={Activity}
          loading={isLoading}
          accent="text-emerald-600"
        />
        <StatCard
          title="On Hold Employees"
          value={isLoading ? "—" : onHoldCount.toString()}
          icon={PauseCircle}
          loading={isLoading}
          accent="text-amber-600"
        />
        <StatCard
          title="Total Employees"
          value={isLoading ? "—" : totalCount.toString()}
          icon={Users}
          loading={isLoading}
        />
      </div>

      {/* Employee Directory: Top 10 Performers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            Employee Directory — Top 10 Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {["a", "b", "c", "d", "e"].map((k) => (
                <Skeleton key={k} className="h-10" />
              ))}
            </div>
          ) : topPerformers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
              <Trophy size={32} className="opacity-20 mb-2" />
              No performers data yet. Upload via the Top Performers module.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs w-14">Rank</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">FIPL Code</TableHead>
                    <TableHead className="text-xs">Region</TableHead>
                    <TableHead className="text-xs text-right">
                      Accessories
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Ext. Warranty
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Total Sales (₹)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers.map((p, i) => {
                    const rank = p.rank || i + 1;
                    return (
                      <TableRow
                        key={p.fiplCode}
                        className={getRankRowClass(rank)}
                        data-ocid={`dashboard.item.${i + 1}`}
                      >
                        <TableCell>{getRankBadge(rank)}</TableCell>
                        <TableCell className="font-medium text-sm">
                          {p.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {p.fiplCode}
                        </TableCell>
                        <TableCell className="text-sm">
                          {p.region || (
                            <span className="text-muted-foreground text-xs">
                              N/A
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-right">
                          {p.accessories.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-sm text-right">
                          {p.extendedWarranty.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-sm text-right font-semibold">
                          ₹{p.totalSales.toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom: Issues + Suggestions (static, manually maintained) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="text-destructive" />
              Issues
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Manually maintained — edit{" "}
              <code className="text-xs bg-muted px-1 rounded">
                data/staticIssuesSuggestions.ts
              </code>{" "}
              to update
            </p>
          </CardHeader>
          <CardContent>
            {STATIC_ISSUES.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm"
                data-ocid="dashboard.empty_state"
              >
                <AlertCircle size={28} className="opacity-20 mb-2" />
                No issues added yet
              </div>
            ) : (
              <div className="space-y-2">
                {STATIC_ISSUES.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg border border-destructive/20 bg-destructive/5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {entry.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {entry.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.date}
                        </p>
                      </div>
                      <PriorityBadge priority={entry.priority} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-500" />
              Suggestions
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Manually maintained — edit{" "}
              <code className="text-xs bg-muted px-1 rounded">
                data/staticIssuesSuggestions.ts
              </code>{" "}
              to update
            </p>
          </CardHeader>
          <CardContent>
            {STATIC_SUGGESTIONS.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm"
                data-ocid="dashboard.empty_state"
              >
                <Lightbulb size={28} className="opacity-20 mb-2" />
                No suggestions added yet
              </div>
            ) : (
              <div className="space-y-2">
                {STATIC_SUGGESTIONS.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50"
                  >
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {entry.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {entry.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.date}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs shrink-0 border-emerald-300 text-emerald-700"
                      >
                        Suggestion
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
