import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  UserCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Variant_accessories_extendedWarranty,
  Variant_eod_daysBrief_attendance,
  Variant_tineco_ecovacs_coway_kuvings_instant,
  useAttendanceByFIPL,
  useEmployee,
  usePerformanceByFIPL,
  useSWOTByFIPL,
  useSalesByFIPL,
} from "../hooks/useQueries";

const BRAND_LABELS: Record<
  Variant_tineco_ecovacs_coway_kuvings_instant,
  string
> = {
  [Variant_tineco_ecovacs_coway_kuvings_instant.ecovacs]: "Ecovacs",
  [Variant_tineco_ecovacs_coway_kuvings_instant.kuvings]: "Kuvings",
  [Variant_tineco_ecovacs_coway_kuvings_instant.coway]: "Coway",
  [Variant_tineco_ecovacs_coway_kuvings_instant.tineco]: "Tineco",
  [Variant_tineco_ecovacs_coway_kuvings_instant.instant]: "Instant",
};

const SALE_TYPE_LABELS: Record<Variant_accessories_extendedWarranty, string> = {
  [Variant_accessories_extendedWarranty.accessories]: "Accessories",
  [Variant_accessories_extendedWarranty.extendedWarranty]: "Extended Warranty",
};

const LAB_TYPE_LABELS: Record<Variant_eod_daysBrief_attendance, string> = {
  [Variant_eod_daysBrief_attendance.attendance]: "Attendance",
  [Variant_eod_daysBrief_attendance.eod]: "EOD",
  [Variant_eod_daysBrief_attendance.daysBrief]: "Days Brief",
};

function categoryBadgeClass(cat: string) {
  if (cat === "Star") return "bg-amber-100 text-amber-800 border-amber-200";
  if (cat === "Cash Cow") return "bg-green-100 text-green-800 border-green-200";
  if (cat === "Question Mark")
    return "bg-blue-100 text-blue-800 border-blue-200";
  if (cat === "Dog") return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatIndianCurrency(amount: number) {
  if (amount === 0) return "₹0";
  const s = Math.round(amount).toString();
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const formatted = rest
    ? `${rest.replace(/(\d)(?=(\d{2})+$)/g, "$1,")},${last3}`
    : last3;
  return `₹${formatted}`;
}

function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-t-lg"
        onClick={() => setOpen((o) => !o)}
        data-ocid="employees.toggle"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-foreground">{title}</span>
          {subtitle && (
            <span className="text-sm text-muted-foreground">{subtitle}</span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && <CardContent className="pt-0 pb-4">{children}</CardContent>}
    </Card>
  );
}

export default function EmployeeProfile({
  fiplCode,
  onBack,
}: {
  fiplCode: string;
  onBack: () => void;
}) {
  const { data: employee } = useEmployee(fiplCode);
  const { data: perf } = usePerformanceByFIPL(fiplCode);
  const { data: swot } = useSWOTByFIPL(fiplCode);
  const { data: sales = [] } = useSalesByFIPL(fiplCode);
  const { data: attendance = [] } = useAttendanceByFIPL(fiplCode);

  const efficiencyScore = useMemo(() => {
    if (!perf) return null;
    const avg =
      (perf.salesInfluenceIndex +
        perf.operationalDiscipline +
        perf.productKnowledgeScore +
        perf.softSkillsScore) /
      4;
    return Math.round(avg * 10) / 10;
  }, [perf]);

  const totalSales = useMemo(
    () => sales.reduce((s, r) => s + r.amount, 0),
    [sales],
  );

  // Sales trend: group by month
  const salesTrendData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const rec of sales) {
      if (!rec.saleDate) continue;
      // saleDate might be DD-MM-YYYY
      const parts = rec.saleDate.split("-");
      let key = rec.saleDate;
      if (parts.length === 3) {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthIdx = Number.parseInt(parts[1], 10) - 1;
        key = `${months[monthIdx] ?? parts[1]} ${parts[2]}`;
      }
      map[key] = (map[key] ?? 0) + rec.amount;
    }
    return Object.entries(map)
      .map(([month, amount]) => ({ month, amount }))
      .slice(-12);
  }, [sales]);

  // Attendance chart: group by month
  const attendanceChartData = useMemo(() => {
    const map: Record<string, { present: number; daysOff: number }> = {};
    for (const rec of attendance) {
      if (!rec.date) continue;
      const parts = rec.date.split("-");
      let key = rec.date;
      if (parts.length === 3) {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthIdx = Number.parseInt(parts[1], 10) - 1;
        key = `${months[monthIdx] ?? parts[1]} ${parts[2]}`;
      }
      if (!map[key]) map[key] = { present: 0, daysOff: 0 };
      const off = Number(rec.daysOff);
      map[key].daysOff += off;
      map[key].present += Math.max(0, 30 - off);
    }
    return Object.entries(map)
      .map(([month, v]) => ({ month, ...v }))
      .slice(-12);
  }, [attendance]);

  if (!employee) {
    return (
      <div
        className="flex items-center justify-center h-40 text-muted-foreground"
        data-ocid="employees.loading_state"
      >
        Loading employee...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        data-ocid="employees.link"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Employees
      </Button>

      {/* Hero card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shrink-0">
              {getInitials(employee.name)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {employee.name}
                </h1>
                <Badge
                  variant="outline"
                  className={`border ${categoryBadgeClass(employee.fseCategory)}`}
                >
                  {employee.fseCategory || "—"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground font-mono mb-2">
                {employee.fiplCode}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>📍 {employee.region || "No region"}</span>
                <span>🏢 {employee.department || "No dept"}</span>
                <span>💼 {employee.role || "No role"}</span>
                {employee.joinDate && (
                  <span>📅 Joined {employee.joinDate}</span>
                )}
              </div>
            </div>

            {/* Efficiency score */}
            <div className="flex flex-col items-center shrink-0">
              <div className="text-3xl font-bold text-foreground">
                {efficiencyScore !== null ? efficiencyScore : "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                / 100 Efficiency
              </div>
              {swot?.cesScore !== undefined && (
                <div className="mt-1 text-xs text-muted-foreground">
                  CES: {swot.cesScore}
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {formatIndianCurrency(totalSales)}
              </div>
              <div className="text-xs text-muted-foreground">Total Sales</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {sales.length}
              </div>
              <div className="text-xs text-muted-foreground">Sales Records</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {attendance.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Attendance Logs
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SWOT Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserCircle2 className="w-4 h-4" /> SWOT Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!swot ? (
            <p className="text-muted-foreground text-sm">
              No SWOT data available.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="font-semibold text-green-800 text-sm mb-2">
                  💪 Strengths
                </div>
                {swot.strengths.length === 0 ? (
                  <span className="text-xs text-green-600">None listed</span>
                ) : (
                  <ul className="space-y-1">
                    {swot.strengths.map((s) => (
                      <li
                        key={s}
                        className="text-xs text-green-700 flex items-start gap-1"
                      >
                        <span className="mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="font-semibold text-red-800 text-sm mb-2">
                  ⚠️ Weaknesses
                </div>
                {swot.weaknesses.length === 0 ? (
                  <span className="text-xs text-red-600">None listed</span>
                ) : (
                  <ul className="space-y-1">
                    {swot.weaknesses.map((w) => (
                      <li
                        key={w}
                        className="text-xs text-red-700 flex items-start gap-1"
                      >
                        <span className="mt-0.5">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="font-semibold text-blue-800 text-sm mb-2">
                  🚀 Opportunities
                </div>
                {swot.opportunities.length === 0 ? (
                  <span className="text-xs text-blue-600">None listed</span>
                ) : (
                  <ul className="space-y-1">
                    {swot.opportunities.map((o) => (
                      <li
                        key={o}
                        className="text-xs text-blue-700 flex items-start gap-1"
                      >
                        <span className="mt-0.5">•</span>
                        {o}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <div className="font-semibold text-orange-800 text-sm mb-2">
                  🔥 Threats
                </div>
                {swot.threats.length === 0 ? (
                  <span className="text-xs text-orange-600">None listed</span>
                ) : (
                  <ul className="space-y-1">
                    {swot.threats.map((t) => (
                      <li
                        key={t}
                        className="text-xs text-orange-700 flex items-start gap-1"
                      >
                        <span className="mt-0.5">•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!perf ? (
            <p className="text-muted-foreground text-sm">
              No performance data available.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  label: "Sales Influence Index",
                  value: perf.salesInfluenceIndex,
                  max: 100,
                  isScore: true,
                },
                {
                  label: "Operational Discipline",
                  value: perf.operationalDiscipline,
                  max: 100,
                  isScore: true,
                },
                {
                  label: "Product Knowledge",
                  value: perf.productKnowledgeScore,
                  max: 100,
                  isScore: true,
                },
                {
                  label: "Soft Skills",
                  value: perf.softSkillsScore,
                  max: 100,
                  isScore: true,
                },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-semibold">{m.value}</span>
                  </div>
                  <Progress value={m.value} className="h-2" />
                </div>
              ))}
              <div className="sm:col-span-2 border-t border-border pt-3 mt-1">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Review Count", value: Number(perf.reviewCount) },
                    { label: "Demo Visits", value: Number(perf.demoVisits) },
                    {
                      label: "Complaint Visits",
                      value: Number(perf.complaintVisits),
                    },
                    {
                      label: "Video Call Demos",
                      value: Number(perf.videoCallDemos),
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="text-center p-2 rounded-lg bg-muted"
                    >
                      <div className="text-xl font-bold text-foreground">
                        {m.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sales Trend (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            {salesTrendData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                No sales data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={salesTrendData}
                  margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip formatter={(v: number) => formatIndianCurrency(v)} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Sales"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Attendance Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceChartData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                No attendance data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={attendanceChartData}
                  margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="present"
                    name="Present Days"
                    fill="#22c55e"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="daysOff"
                    name="Days Off"
                    fill="#f97316"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Dropdown */}
      <CollapsibleSection
        title="Sales Records"
        subtitle={`${sales.length} records · ${formatIndianCurrency(totalSales)}`}
      >
        {sales.length === 0 ? (
          <p
            className="text-muted-foreground text-sm"
            data-ocid="employees.empty_state"
          >
            No sales records.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((s, i) => (
                  <TableRow
                    key={String(s.recordId)}
                    data-ocid={`employees.item.${i + 1}`}
                  >
                    <TableCell className="text-sm">{s.saleDate}</TableCell>
                    <TableCell className="text-sm">
                      {BRAND_LABELS[s.brand]}
                    </TableCell>
                    <TableCell className="text-sm">{s.product}</TableCell>
                    <TableCell className="text-sm">
                      {SALE_TYPE_LABELS[s.saleType]}
                    </TableCell>
                    <TableCell className="text-sm">
                      {String(s.quantity)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatIndianCurrency(s.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CollapsibleSection>

      {/* Attendance Dropdown */}
      <CollapsibleSection
        title="Attendance Records"
        subtitle={`${attendance.length} entries`}
      >
        {attendance.length === 0 ? (
          <p
            className="text-muted-foreground text-sm"
            data-ocid="employees.empty_state"
          >
            No attendance records.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Lab Type</TableHead>
                  <TableHead>Days Off</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((a, i) => (
                  <TableRow
                    key={String(a.recordId)}
                    data-ocid={`employees.item.${i + 1}`}
                  >
                    <TableCell className="text-sm">{a.date}</TableCell>
                    <TableCell className="text-sm">
                      {LAB_TYPE_LABELS[a.labType]}
                    </TableCell>
                    <TableCell className="text-sm">
                      {String(a.daysOff)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.reason || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
