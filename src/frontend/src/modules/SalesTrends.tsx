import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Variant_accessories_extendedWarranty,
  Variant_tineco_ecovacs_coway_kuvings_instant,
  useAllEmployees,
  useAllSales,
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

const BRAND_COLORS: Record<string, string> = {
  ecovacs: "bg-blue-100 text-blue-800",
  kuvings: "bg-green-100 text-green-800",
  coway: "bg-purple-100 text-purple-800",
  tineco: "bg-orange-100 text-orange-800",
  instant: "bg-red-100 text-red-800",
};

const PAGE_SIZE = 15;

export default function SalesTrends() {
  const { data: employees = [] } = useAllEmployees();
  const employeeCodes = employees.map((e) => e.fiplCode);
  const { data: allSales = [], isLoading } = useAllSales(employeeCodes);

  const nameMap = Object.fromEntries(
    employees.map((e) => [e.fiplCode, e.name]),
  );

  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allSales.filter((s) => {
      const matchSearch =
        s.fiplCode.toLowerCase().includes(q) ||
        s.product.toLowerCase().includes(q) ||
        (nameMap[s.fiplCode] || "").toLowerCase().includes(q);
      const matchBrand = brandFilter === "all" || s.brand === brandFilter;
      const matchType = typeFilter === "all" || s.saleType === typeFilter;
      return matchSearch && matchBrand && matchType;
    });
  }, [allSales, search, brandFilter, typeFilter, nameMap]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Aggregates
  const totalRevenue = allSales.reduce((s, r) => s + r.amount, 0);
  const totalQty = allSales.reduce((s, r) => s + Number(r.quantity), 0);

  const byBrand = useMemo(() => {
    const acc: Record<string, { revenue: number; qty: number }> = {};
    for (const s of allSales) {
      if (!acc[s.brand]) acc[s.brand] = { revenue: 0, qty: 0 };
      acc[s.brand].revenue += s.amount;
      acc[s.brand].qty += Number(s.quantity);
    }
    return Object.entries(acc).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [allSales]);

  const byType = useMemo(() => {
    const acc: Record<string, { revenue: number; qty: number }> = {};
    for (const s of allSales) {
      if (!acc[s.saleType]) acc[s.saleType] = { revenue: 0, qty: 0 };
      acc[s.saleType].revenue += s.amount;
      acc[s.saleType].qty += Number(s.quantity);
    }
    return Object.entries(acc);
  }, [allSales]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales Trends</h1>
        <p className="text-muted-foreground text-sm">
          {allSales.length} transactions &middot; Total Revenue:{" "}
          <span className="font-semibold">
            ₹{totalRevenue.toLocaleString()}
          </span>
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              ₹{totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{allSales.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total Transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{totalQty}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total Units Sold
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              {allSales.length > 0
                ? `₹${(totalRevenue / allSales.length).toFixed(0)}`
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg per Transaction
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* By Brand */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Brand</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {["a", "b", "c", "d", "e"].map((k) => (
                  <Skeleton key={k} className="h-8" />
                ))}
              </div>
            ) : byBrand.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No data
              </p>
            ) : (
              <div className="space-y-2">
                {byBrand.map(([brand, data]) => (
                  <div
                    key={brand}
                    className="flex items-center justify-between py-1.5 border-b last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${BRAND_COLORS[brand] || ""}`}
                      >
                        {BRAND_LABELS[
                          brand as Variant_tineco_ecovacs_coway_kuvings_instant
                        ] || brand}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {data.qty} units
                      </span>
                    </div>
                    <span className="font-semibold">
                      ₹{data.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Sale Type</CardTitle>
          </CardHeader>
          <CardContent>
            {byType.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No data
              </p>
            ) : (
              <div className="space-y-3">
                {byType.map(([type, data]) => (
                  <div key={type} className="p-3 rounded-lg bg-muted/40">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {SALE_TYPE_LABELS[
                          type as Variant_accessories_extendedWarranty
                        ] || type}
                      </span>
                      <span className="font-bold">
                        ₹{data.revenue.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.qty} units sold
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters + Table */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by FIPL, name, product..."
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
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Brands" />
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
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(SALE_TYPE_LABELS).map(([k, v]) => (
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
                "Brand",
                "Product",
                "Type",
                "Qty",
                "Amount (₹)",
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
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No records found
                </td>
              </tr>
            ) : (
              paginated.map((s) => (
                <tr
                  key={s.recordId.toString()}
                  className="border-t hover:bg-muted/30"
                >
                  <td className="px-4 py-3 whitespace-nowrap">{s.saleDate}</td>
                  <td className="px-4 py-3">
                    <div>{nameMap[s.fiplCode] || s.fiplCode}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {s.fiplCode}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${BRAND_COLORS[s.brand] || ""}`}
                    >
                      {BRAND_LABELS[s.brand]}
                    </span>
                  </td>
                  <td className="px-4 py-3">{s.product}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {SALE_TYPE_LABELS[s.saleType]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{s.quantity.toString()}</td>
                  <td className="px-4 py-3 font-semibold">
                    ₹{s.amount.toLocaleString()}
                  </td>
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
            <button
              type="button"
              className="text-sm px-3 py-1.5 border rounded hover:bg-muted disabled:opacity-40"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>
            <button
              type="button"
              className="text-sm px-3 py-1.5 border rounded hover:bg-muted disabled:opacity-40"
              disabled={page >= pages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
