import { useMemo } from "react";
import { useAllEmployeeData } from "./useAllEmployeeData";

export interface GoogleSheetSale {
  fiplCode: string;
  name: string;
  region: string;
  brand: string;
  product: string;
  type: string;
  date: string;
  quantity: number;
  amount: number;
}

export function useGoogleSheetSales() {
  const { data, isLoading, isError } = useAllEmployeeData();
  const sales = useMemo((): GoogleSheetSale[] => {
    if (!data) return [];
    return data.flatMap((emp) =>
      emp.sales.map((s) => ({
        fiplCode: emp.fiplCode,
        name: emp.name,
        region: emp.region ?? "",
        brand: s.brand ?? "",
        product: s.product ?? "",
        type: s.type ?? "",
        date: s.date ?? "",
        quantity: s.quantity,
        amount: s.amount,
      })),
    );
  }, [data]);
  return { data: sales, isLoading, isError };
}
