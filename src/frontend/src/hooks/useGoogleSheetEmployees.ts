import { useAllEmployeeData } from "./useAllEmployeeData";

export interface GoogleSheetEmployee {
  fiplCode: string;
  name: string;
  role: string;
  department: string;
  fseCategory: string;
  status: string;
  joinDate: string;
  avatarUrl: string;
  region: string;
  familyDetails: string;
  pastExperience: string;
}

export function useGoogleSheetEmployees() {
  const { data, isLoading, isFetching, isError } = useAllEmployeeData();
  const employees: GoogleSheetEmployee[] = (data ?? []).map((e) => ({
    fiplCode: e.fiplCode,
    name: e.name,
    role: e.role,
    department: e.department,
    fseCategory: e.category,
    status: e.status,
    joinDate: e.joinDate ?? "",
    avatarUrl: e.avatarUrl ?? "",
    region: e.region ?? "",
    familyDetails: e.familyDetails ?? "",
    pastExperience: e.pastExperience ?? "",
  }));
  return { data: employees, isLoading, isFetching, isError };
}
