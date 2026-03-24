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
  AlertTriangle,
  PauseCircle,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";
import { useLabels } from "../contexts/UILabelsContext";
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

function getRankRowClass(rank: number): string {
  if (rank === 1) return "bg-amber-50/50 dark:bg-amber-950/20";
  if (rank === 2) return "bg-slate-50/50 dark:bg-slate-900/20";
  if (rank === 3) return "bg-orange-50/50 dark:bg-orange-950/20";
  return "";
}

function getRankBadge(rank: number) {
  if (rank === 1)
    return <span className="text-amber-500 font-bold text-base">🥇</span>;
  if (rank === 2)
    return <span className="text-slate-400 font-bold text-base">🥈</span>;
  if (rank === 3)
    return <span className="text-orange-500 font-bold text-base">🥉</span>;
  return (
    <span className="text-muted-foreground text-sm font-medium">#{rank}</span>
  );
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, isError } = useGoogleSheetData();

  const activeCount = data?.activeCount ?? 0;
  const onHoldCount = data?.onHoldCount ?? 0;
  const totalCount = data?.totalCount ?? 0;
  const topPerformers = data?.topPerformers ?? [];

  const { labels } = useLabels();

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
            <h1 className="text-2xl font-bold">{labels.dashboardTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {labels.dashboardSubtitle}
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
          title={labels.statActiveCount}
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
          title={labels.statTotalEmployees}
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
            {labels.topPerformersSectionHeader}
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
    </div>
  );
}
