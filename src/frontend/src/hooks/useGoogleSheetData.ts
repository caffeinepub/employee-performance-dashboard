import { useMemo } from "react";
import { useAllEmployeeData, useTopPerformers } from "./useAllEmployeeData";

export interface GoogleSheetDashboardData {
  activeCount: number;
  onHoldCount: number;
  inactiveCount: number;
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
  const { data, isLoading, isFetching, isError, refetch } =
    useAllEmployeeData();

  const { data: topPerformersFromSheet } = useTopPerformers();

  const dashboardData = useMemo((): GoogleSheetDashboardData | null => {
    if (!data) return null;
    const employees = data.employees;

    const activeCount = employees.filter(
      (e) => e.status.toLowerCase() === "active",
    ).length;
    const onHoldCount = employees.filter(
      (e) =>
        e.status.toLowerCase() === "on hold" ||
        e.status.toLowerCase() === "onhold",
    ).length;
    const inactiveCount = employees.filter(
      (e) => e.status.toLowerCase() === "inactive",
    ).length;
    const totalCount = employees.length;

    // Use Sheet 6 Top Performers if available; otherwise derive from sales
    type TP = {
      rank: number;
      fiplCode: string;
      name: string;
      region: string;
      accessories: number;
      extendedWarranty: number;
      totalSales: number;
    };
    let topPerformers: TP[] = [];
    if (topPerformersFromSheet.length > 0) {
      topPerformers = topPerformersFromSheet.map((tp) => ({
        rank: tp.rank,
        fiplCode: tp.fiplCode,
        name: tp.name,
        region: employees.find((e) => e.fiplCode === tp.fiplCode)?.region ?? "",
        accessories: tp.accessories,
        extendedWarranty: tp.extendedWarranty,
        totalSales: tp.totalSales,
      }));
    } else {
      topPerformers = employees
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
    }

    return {
      activeCount,
      onHoldCount,
      inactiveCount,
      totalCount,
      topPerformers,
      lastRefreshed: new Date(),
    };
  }, [data, topPerformersFromSheet]);

  return { data: dashboardData, isLoading, isFetching, isError, refetch };
}
