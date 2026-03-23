import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAllEmployeeData } from "./useAllEmployeeData";

export interface GoogleSheetDashboardData {
  activeCount: number;
  onHoldCount: number;
  totalCount: number;
  topPerformers: Array<{
    rank: number;
    fiplCode: string;
    name: string;
    region: string;
    accessories: number;
    extendedWarranty: number;
    totalSales: number;
  }>;
  lastRefreshed: Date | null;
}

export function useGoogleSheetData() {
  const {
    data: employees,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useAllEmployeeData();

  const dashboardData = useMemo((): GoogleSheetDashboardData | null => {
    if (!employees) return null;
    const activeCount = employees.filter(
      (e) => e.status.toLowerCase() === "active",
    ).length;
    const onHoldCount = employees.filter(
      (e) => e.status.toLowerCase() === "on hold",
    ).length;
    const totalCount = employees.length;

    const topPerformers = employees
      .map((e) => ({
        fiplCode: e.fiplCode,
        name: e.name,
        region: e.region ?? "",
        totalSales: e.sales.reduce((sum, s) => sum + s.amount, 0),
        accessories: e.sales
          .filter((s) => s.type?.toLowerCase() === "accessories")
          .reduce((sum, s) => sum + s.amount, 0),
        extendedWarranty: e.sales
          .filter((s) => s.type?.toLowerCase().includes("warranty"))
          .reduce((sum, s) => sum + s.amount, 0),
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    return {
      activeCount,
      onHoldCount,
      totalCount,
      topPerformers,
      lastRefreshed: new Date(),
    };
  }, [employees]);

  return { data: dashboardData, isLoading, isFetching, isError, refetch };
}
