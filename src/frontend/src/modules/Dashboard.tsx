import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Star, TrendingUp, Users } from "lucide-react";
import {
  useAllEmployees,
  useAllPerformancesSortedBySII,
  useDashboardStats,
} from "../hooks/useQueries";
import { Variant_active_onHold } from "../hooks/useQueries";

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: employees = [] } = useAllEmployees();
  const { data: performances = [], isLoading: perfLoading } =
    useAllPerformancesSortedBySII();

  // Build a name lookup from employees
  const nameMap = Object.fromEntries(
    employees.map((e) => [e.fiplCode, e.name]),
  );
  const onHoldCount = employees.filter(
    (e) => e.status === Variant_active_onHold.onHold,
  ).length;

  // Department distribution
  const deptCounts = employees.reduce<Record<string, number>>((acc, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {});
  const topDepts = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxDeptCount = topDepts[0]?.[1] || 1;

  // Region distribution
  const regionCounts = employees.reduce<Record<string, number>>((acc, e) => {
    acc[e.region] = (acc[e.region] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Employee performance overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={stats ? stats.totalEmployees.toString() : "—"}
          sub={`${onHoldCount} on hold`}
          icon={Users}
          loading={statsLoading}
        />
        <StatCard
          title="Active Employees"
          value={stats ? stats.activeCount.toString() : "—"}
          sub={
            stats
              ? `${Math.round((Number(stats.activeCount) / Math.max(Number(stats.totalEmployees), 1)) * 100)}% of total`
              : undefined
          }
          icon={Activity}
          loading={statsLoading}
        />
        <StatCard
          title="Total Sales Revenue"
          value={stats ? `₹${stats.totalSalesAmount.toLocaleString()}` : "—"}
          icon={TrendingUp}
          loading={statsLoading}
        />
        <StatCard
          title="Avg CES Score"
          value={stats ? stats.averageCesScore.toFixed(2) : "—"}
          sub="Across all feedback"
          icon={Star}
          loading={statsLoading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* SII Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Top Performers by Sales Influence Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            {perfLoading ? (
              <div className="space-y-3">
                {["a", "b", "c", "d", "e"].map((k) => (
                  <Skeleton key={k} className="h-10" />
                ))}
              </div>
            ) : performances.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No performance data yet
              </p>
            ) : (
              <div className="space-y-3">
                {performances.slice(0, 8).map((p, i) => (
                  <div key={p.fiplCode} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium truncate">
                          {nameMap[p.fiplCode] || p.fiplCode}
                        </span>
                        <span className="text-sm font-bold ml-2">
                          {p.salesInfluenceIndex.toFixed(1)}
                        </span>
                      </div>
                      <Progress
                        value={(p.salesInfluenceIndex / 10) * 100}
                        className="h-1.5"
                      />
                    </div>
                    {i === 0 && <Badge className="text-xs">Top</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {topDepts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No employee data yet
              </p>
            ) : (
              <div className="space-y-3">
                {topDepts.map(([dept, count]) => (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate">
                        {dept || "Unassigned"}
                      </span>
                      <span className="font-medium ml-2">{count}</span>
                    </div>
                    <Progress
                      value={(count / maxDeptCount) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Region Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Region Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(regionCounts).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No data yet
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(regionCounts).map(([region, count]) => (
                  <div
                    key={region}
                    className="text-center p-3 bg-muted/40 rounded-lg"
                  >
                    <p className="text-xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">
                      {region || "Unknown"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            {performances.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No performance data yet
              </p>
            ) : (
              <div className="space-y-3">
                {(
                  [
                    [
                      "Avg Product Knowledge",
                      performances.reduce(
                        (s, p) => s + p.productKnowledgeScore,
                        0,
                      ) / performances.length,
                    ],
                    [
                      "Avg Soft Skills",
                      performances.reduce((s, p) => s + p.softSkillsScore, 0) /
                        performances.length,
                    ],
                    [
                      "Avg Operational Discipline",
                      performances.reduce(
                        (s, p) => s + p.operationalDiscipline,
                        0,
                      ) / performances.length,
                    ],
                    [
                      "Avg Sales Influence Index",
                      performances.reduce(
                        (s, p) => s + p.salesInfluenceIndex,
                        0,
                      ) / performances.length,
                    ],
                  ] as [string, number][]
                ).map(([label, avg]) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{avg.toFixed(1)}</span>
                    </div>
                    <Progress value={(avg / 10) * 100} className="h-2" />
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
