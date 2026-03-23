import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Variant_tineco_ecovacs_coway_kuvings_instant,
  useAllEmployees,
  useAllFeedback,
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

const PAGE_SIZE = 15;

export default function Feedback() {
  const { data: employees = [] } = useAllEmployees();
  const employeeCodes = employees.map((e) => e.fiplCode);
  const { data: allFeedback = [], isLoading } = useAllFeedback(employeeCodes);

  const nameMap = Object.fromEntries(
    employees.map((e) => [e.fiplCode, e.name]),
  );

  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allFeedback.filter((f) => {
      const matchSearch =
        f.customerName.toLowerCase().includes(q) ||
        f.fiplCode.toLowerCase().includes(q) ||
        f.product.toLowerCase().includes(q) ||
        f.agent.toLowerCase().includes(q);
      const matchBrand = brandFilter === "all" || f.brand === brandFilter;
      return matchSearch && matchBrand;
    });
  }, [allFeedback, search, brandFilter]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const avgCes =
    allFeedback.length > 0
      ? allFeedback.reduce((s, f) => s + f.cesScore, 0) / allFeedback.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Feedback / Calling Records</h1>
          <p className="text-muted-foreground text-sm">
            {allFeedback.length} records &middot; Avg CES:{" "}
            <span className="font-medium">{avgCes.toFixed(2)}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search customer, agent, product, FIPL..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <Select
          value={brandFilter}
          onValueChange={(v) => {
            setBrandFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {Object.entries(BRAND_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {[
                "Date",
                "FSE",
                "Customer",
                "Contact",
                "Brand",
                "Product",
                "CES",
                "Remark",
                "Agent",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No records found
                </td>
              </tr>
            ) : (
              paginated.map((f) => (
                <tr
                  key={f.entryId.toString()}
                  className="border-t hover:bg-muted/30"
                >
                  <td className="px-4 py-3 whitespace-nowrap">{f.callDate}</td>
                  <td className="px-4 py-3">
                    <div>{nameMap[f.fiplCode] || f.fiplCode}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {f.fiplCode}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{f.customerName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {f.contact}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{BRAND_LABELS[f.brand]}</Badge>
                  </td>
                  <td className="px-4 py-3">{f.product}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        f.cesScore >= 7
                          ? "default"
                          : f.cesScore >= 5
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {f.cesScore.toFixed(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 max-w-[180px] truncate text-muted-foreground">
                    {f.remark}
                  </td>
                  <td className="px-4 py-3">{f.agent}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {pages} &middot; {filtered.length} results
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= pages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
