import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  SHEET_NAMES,
  fetchSheetByName,
  normalizeText,
  parseDate,
  parseNumber,
} from "../lib/googleSheets";
import { useAllEmployeeData } from "./useAllEmployeeData";

export interface GoogleSheetCallRecord {
  id: string;
  fiplCode: string;
  fseName: string;
  customerName: string;
  contact: string;
  brand: string;
  product: string;
  cesScore: number;
  remark: string;
  callDate: string;
  agent: string;
}

// Fetch calling records DIRECTLY from the sheet — no employee-linking so no rows are dropped
async function fetchCallingRecords(): Promise<GoogleSheetCallRecord[]> {
  const rows = await fetchSheetByName(SHEET_NAMES.callingRecords);
  // Columns: FIPL Code[0], FSE Name[1], Customer Name[2], Customer Contact[3],
  //          Brand[4], Product[5], CES Score[6], Remark[7], Date of Call[8], Agent[9]
  return rows
    .map((row, idx) => {
      const fiplCode = normalizeText(row[0]);
      if (!fiplCode) return null;
      return {
        id: `gscr-${idx}`,
        fiplCode,
        fseName: normalizeText(row[1]) ?? "",
        customerName: normalizeText(row[2]) ?? "",
        contact: normalizeText(row[3]) ?? "",
        brand: normalizeText(row[4]) ?? "",
        product: normalizeText(row[5]) ?? "",
        cesScore: parseNumber(row[6] ?? ""),
        remark: normalizeText(row[7]) ?? "",
        callDate: parseDate(row[8] ?? "") ?? normalizeText(row[8]) ?? "",
        agent: normalizeText(row[9]) ?? "",
      };
    })
    .filter((r): r is GoogleSheetCallRecord => r !== null);
}

export function useGoogleSheetCallRecords() {
  const { isLoading: empLoading } = useAllEmployeeData();
  const { data, isLoading, isError } = useQuery<GoogleSheetCallRecord[]>({
    queryKey: ["callingRecordsDirect"],
    queryFn: fetchCallingRecords,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
  });
  return {
    data: data ?? [],
    isLoading: isLoading || empLoading,
    isError,
  };
}
