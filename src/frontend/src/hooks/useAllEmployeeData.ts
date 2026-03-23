import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  SHEET_NAMES,
  fetchSheetByName,
  normalizeText,
  parseDate,
  parseNumber,
} from "../lib/googleSheets";

export interface EmployeeRecord {
  fiplCode: string;
  name: string;
  role: string;
  department: string;
  category: string;
  status: string;
  joinDate: string | null;
  avatarUrl: string | null;
  region: string | null;
  familyDetails: string | null;
  pastExperience: string | null;

  performance: {
    salesInfluenceIndex: number;
    reviewCount: number;
    operationalDiscipline: number;
    productKnowledgeScore: number;
    softSkillsScore: number;
    totalDemoVisits: number;
    totalComplaintVisits: number;
    totalVideoCallDemos: number;
  } | null;

  swot: {
    strengths: string | null;
    weaknesses: string | null;
    opportunities: string | null;
    threats: string | null;
    cesScore: number;
  } | null;

  attendance: Array<{
    typeOfLab: string | null;
    daysTakenOff: number;
    reasonForDayOff: string | null;
    date: string | null;
  }>;

  sales: Array<{
    brand: string | null;
    product: string | null;
    type: string | null;
    date: string | null;
    quantity: number;
    amount: number;
  }>;

  feedback: Array<{
    fseName: string | null;
    customerName: string | null;
    customerContact: string | null;
    brand: string | null;
    product: string | null;
    cesScore: number;
    remark: string | null;
    dateOfCall: string | null;
    agent: string | null;
  }>;
}

async function fetchAllData(): Promise<EmployeeRecord[]> {
  const results = await Promise.allSettled([
    fetchSheetByName(SHEET_NAMES.employeeDetails),
    fetchSheetByName(SHEET_NAMES.fseParameters),
    fetchSheetByName(SHEET_NAMES.attendance),
    fetchSheetByName(SHEET_NAMES.swotAnalysis),
    fetchSheetByName(SHEET_NAMES.salesData),
    fetchSheetByName(SHEET_NAMES.callingRecords),
  ]);

  const getRows = (
    result: PromiseSettledResult<string[][]>,
    name: string,
  ): string[][] => {
    if (result.status === "rejected") {
      console.error(`Sheet "${name}" failed to load:`, result.reason);
      return [];
    }
    return result.value;
  };

  const empRows = getRows(results[0], "Employee Details");
  const paramRows = getRows(results[1], "FSE Parameters");
  const attRows = getRows(results[2], "Attendance");
  const swotRows = getRows(results[3], "SWOT Analysis");
  const salesRows = getRows(results[4], "Sales Data");
  const callRows = getRows(results[5], "Calling Records");

  // Build employee map
  // Columns: FIPL Code[0], Name[1], Role[2], Department[3], FSE Category[4], Status[5], Joining Date[6], Avatar URL[7], Region[8], Family Details[9], Past Experience[10]
  const employeesMap: Record<string, EmployeeRecord> = {};
  for (const row of empRows) {
    const fiplCode = normalizeText(row[0]);
    if (!fiplCode) continue;
    employeesMap[fiplCode] = {
      fiplCode,
      name: normalizeText(row[1]) ?? "",
      role: normalizeText(row[2]) ?? "",
      department: normalizeText(row[3]) ?? "",
      category: normalizeText(row[4]) ?? "",
      status: normalizeText(row[5]) ?? "",
      joinDate: parseDate(row[6] ?? ""),
      avatarUrl: normalizeText(row[7]),
      region: normalizeText(row[8]),
      familyDetails: normalizeText(row[9]),
      pastExperience: normalizeText(row[10]),
      performance: null,
      swot: null,
      attendance: [],
      sales: [],
      feedback: [],
    };
  }

  // Link FSE Parameters
  // Columns: FIPL Code[0], Name[1], Sales Influence Index[2], Review Count[3],
  //   Operational Discipline[4], Product Knowledge Score[5], Soft Skills Score[6],
  //   Total Demo Visits[7], Total Complaint Visits[8], Total Video Call Demos[9]
  for (const row of paramRows) {
    const fiplCode = normalizeText(row[0]);
    if (!fiplCode) continue;
    if (!employeesMap[fiplCode]) {
      console.warn(`FSE Parameters: FIPL Code "${fiplCode}" not found`);
      continue;
    }
    employeesMap[fiplCode].performance = {
      salesInfluenceIndex: parseNumber(row[2] ?? ""),
      reviewCount: parseNumber(row[3] ?? ""),
      operationalDiscipline: parseNumber(row[4] ?? ""),
      productKnowledgeScore: parseNumber(row[5] ?? ""),
      softSkillsScore: parseNumber(row[6] ?? ""),
      totalDemoVisits: parseNumber(row[7] ?? ""),
      totalComplaintVisits: parseNumber(row[8] ?? ""),
      totalVideoCallDemos: parseNumber(row[9] ?? ""),
    };
  }

  // Link Attendance
  // Columns: FIPL Code[0], FSE Name[1], Type of Lab[2], Days Taken Off[3], Reason for Day Off[4], Date[5]
  for (const row of attRows) {
    const fiplCode = normalizeText(row[0]);
    if (!fiplCode) continue;
    if (!employeesMap[fiplCode]) {
      console.warn(`Attendance: FIPL Code "${fiplCode}" not found`);
      continue;
    }
    employeesMap[fiplCode].attendance.push({
      typeOfLab: normalizeText(row[2]),
      daysTakenOff: parseNumber(row[3] ?? ""),
      reasonForDayOff: normalizeText(row[4]),
      date: parseDate(row[5] ?? ""),
    });
  }

  // Link SWOT Analysis
  // Columns: FIPL Code[0], Strengths[1], Weaknesses[2], Opportunities[3], Threats[4], CES Score[5]
  for (const row of swotRows) {
    const fiplCode = normalizeText(row[0]);
    if (!fiplCode) continue;
    if (!employeesMap[fiplCode]) {
      console.warn(`SWOT: FIPL Code "${fiplCode}" not found`);
      continue;
    }
    employeesMap[fiplCode].swot = {
      strengths: normalizeText(row[1]),
      weaknesses: normalizeText(row[2]),
      opportunities: normalizeText(row[3]),
      threats: normalizeText(row[4]),
      cesScore: parseNumber(row[5] ?? ""),
    };
  }

  // Link Sales Data
  // Columns: FIPL Code[0], Name[1], Brand[2], Product[3], Type[4], Date[5], Quantity[6], Amount[7]
  for (const row of salesRows) {
    const fiplCode = normalizeText(row[0]);
    if (!fiplCode) continue;
    if (!employeesMap[fiplCode]) {
      console.warn(`Sales Data: FIPL Code "${fiplCode}" not found`);
      continue;
    }
    employeesMap[fiplCode].sales.push({
      brand: normalizeText(row[2]),
      product: normalizeText(row[3]),
      type: normalizeText(row[4]),
      date: parseDate(row[5] ?? ""),
      quantity: parseNumber(row[6] ?? ""),
      amount: parseNumber(row[7] ?? ""),
    });
  }

  // Link Calling Records
  // Columns: FIPL Code[0], FSE Name[1], Customer Name[2], Customer Contact[3], Brand[4], Product[5], CES Score[6], Remark[7], Date of Call[8], Agent[9]
  for (const row of callRows) {
    const fiplCode = normalizeText(row[0]);
    if (!fiplCode) continue;
    if (!employeesMap[fiplCode]) {
      console.warn(`Calling Records: FIPL Code "${fiplCode}" not found`);
      continue;
    }
    employeesMap[fiplCode].feedback.push({
      fseName: normalizeText(row[1]),
      customerName: normalizeText(row[2]),
      customerContact: normalizeText(row[3]),
      brand: normalizeText(row[4]),
      product: normalizeText(row[5]),
      cesScore: parseNumber(row[6] ?? ""),
      remark: normalizeText(row[7]),
      dateOfCall: parseDate(row[8] ?? ""),
      agent: normalizeText(row[9]),
    });
  }

  return Object.values(employeesMap);
}

export function useAllEmployeeData() {
  return useQuery<EmployeeRecord[]>({
    queryKey: ["allEmployeeData"],
    queryFn: fetchAllData,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
  });
}

export function useAllEmployeeDataDerived() {
  const query = useAllEmployeeData();
  return query;
}

export { useMemo };
