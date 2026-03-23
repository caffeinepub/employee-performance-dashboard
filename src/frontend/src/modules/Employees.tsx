import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../backend.d";
import { useGoogleSheetEmployees } from "../hooks/useGoogleSheetEmployees";
import {
  Variant_active_onHold,
  useAddEmployee,
  useAttendanceByFIPL,
  useDeleteEmployee,
  usePerformanceByFIPL,
  useSalesByFIPL,
  useUpdateEmployee,
} from "../hooks/useQueries";

const PAGE_SIZE = 15;

const DEPARTMENTS = [
  "Enterprise Sales",
  "SMB Sales",
  "Channel",
  "Marketing",
  "Customer Success",
  "Engineering",
  "Operations",
  "Finance",
  "HR",
];

const ROLES = [
  "FSE",
  "Senior FSE",
  "Team Lead",
  "Manager",
  "Senior Manager",
  "Area Manager",
  "Regional Manager",
];

const REGIONS = ["North", "South", "East", "West", "Central"];

const EMPTY_EMPLOYEE: Employee = {
  fiplCode: "",
  name: "",
  role: "",
  department: "",
  region: "",
  status: Variant_active_onHold.active,
  joinDate: "",
  fseCategory: "",
  avatarUrl: "",
  familyDetails: "",
  pastExperience: "",
};

function categoryBadgeClass(cat: string) {
  if (cat === "Star") return "bg-amber-100 text-amber-800 border-amber-200";
  if (cat === "Cash Cow") return "bg-green-100 text-green-800 border-green-200";
  if (cat === "Question Mark")
    return "bg-blue-100 text-blue-800 border-blue-200";
  if (cat === "Dog") return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function formatIndianCurrency(amount: number) {
  if (amount === 0) return "\u20b90";
  const s = Math.round(amount).toString();
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const formatted = rest
    ? `${rest.replace(/(\d)(?=(\d{2})+$)/g, "$1,")},${last3}`
    : last3;
  return `\u20b9${formatted}`;
}

// Per-employee row that fetches its own data
function EmployeeRow({
  employee,
  onSelect,
  onEdit,
  onDelete,
}: {
  employee: Employee;
  onSelect: (fiplCode: string) => void;
  onEdit: (emp: Employee) => void;
  onDelete: (fiplCode: string) => void;
}) {
  const { data: perf } = usePerformanceByFIPL(employee.fiplCode);
  const { data: sales = [] } = useSalesByFIPL(employee.fiplCode);
  const { data: attendance = [] } = useAttendanceByFIPL(employee.fiplCode);

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

  const attendancePct = useMemo(() => {
    if (!attendance.length) return null;
    const totalDaysOff = attendance.reduce(
      (sum, a) => sum + Number(a.daysOff),
      0,
    );
    const totalRecords = attendance.length;
    const totalWorkingDays = totalRecords * 30;
    const presentDays = totalWorkingDays - totalDaysOff;
    return Math.round((presentDays / totalWorkingDays) * 100);
  }, [attendance]);

  const totalSales = useMemo(
    () => sales.reduce((sum, s) => sum + s.amount, 0),
    [sales],
  );

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/60 transition-colors"
      data-ocid="employees.item.1"
      onClick={() => onSelect(employee.fiplCode)}
    >
      <TableCell>
        <div>
          <div className="font-medium text-foreground">{employee.name}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {employee.fiplCode}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {employee.region || "—"}
      </TableCell>
      <TableCell>
        {efficiencyScore !== null ? (
          <span className="font-semibold text-foreground">
            {efficiencyScore}{" "}
            <span className="text-xs text-muted-foreground font-normal">
              / 100
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        )}
      </TableCell>
      <TableCell>
        {attendancePct !== null ? (
          <span className="font-medium">{attendancePct}%</span>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        )}
      </TableCell>
      <TableCell className="font-medium">
        {formatIndianCurrency(totalSales)}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={`text-xs font-medium border ${categoryBadgeClass(employee.fseCategory)}`}
        >
          {employee.fseCategory || "—"}
        </Badge>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            data-ocid="employees.edit_button"
            onClick={() => onEdit(employee)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            data-ocid="employees.delete_button"
            onClick={() => onDelete(employee.fiplCode)}
          >
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function Employees({
  onSelectEmployee,
}: {
  onSelectEmployee: (fiplCode: string) => void;
}) {
  const {
    data: sheetEmployees = [],
    isLoading,
    isError,
  } = useGoogleSheetEmployees();
  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  // Convert Google Sheet employees to the Employee type used by the UI
  const employees: Employee[] = useMemo(
    () =>
      sheetEmployees.map((e) => ({
        fiplCode: e.fiplCode,
        name: e.name,
        role: e.role,
        department: e.department,
        fseCategory: e.fseCategory,
        status:
          e.status.toLowerCase() === "on hold"
            ? Variant_active_onHold.onHold
            : Variant_active_onHold.active,
        joinDate: e.joinDate,
        avatarUrl: e.avatarUrl,
        region: e.region,
        familyDetails: e.familyDetails,
        pastExperience: e.pastExperience,
      })),
    [sheetEmployees],
  );

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<Employee>(EMPTY_EMPLOYEE);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(employees.map((e) => e.fseCategory).filter(Boolean));
    return Array.from(cats).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter((e) => {
      const matchSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.fiplCode.toLowerCase().includes(q);
      const matchCat =
        categoryFilter === "all" || e.fseCategory === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [employees, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setEditingEmployee(null);
    setForm(EMPTY_EMPLOYEE);
    setDialogOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setForm({ ...emp });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.fiplCode.trim() || !form.name.trim()) {
      toast.error("FIPL Code and Name are required");
      return;
    }
    if (editingEmployee) {
      await updateEmployee.mutateAsync(form);
      toast.success("Employee updated");
      setDialogOpen(false);
    } else {
      const res = await addEmployee.mutateAsync(form);
      if ("ok" in res) {
        toast.success("Employee added");
        setDialogOpen(false);
      } else {
        toast.error(res.err as string);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteEmployee.mutateAsync(deleteTarget);
    toast.success("Employee deleted");
    setDeleteTarget(null);
  };

  const setField = (k: keyof Employee, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-4">
      {/* Error Banner */}
      {isError && (
        <div
          data-ocid="employees.error_state"
          className="flex items-center gap-2 px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm"
        >
          <AlertTriangle size={16} className="shrink-0" />
          Could not load employee data from Google Sheets. Retrying
          automatically.
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search by name or FIPL code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              data-ocid="employees.search_input"
            />
          </div>
          <div className="flex items-center gap-1.5 min-w-[180px]">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9" data-ocid="employees.select">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={openAdd} data-ocid="employees.primary_button">
          <Plus className="w-4 h-4 mr-1" /> Add Employee
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px]">Name / FIPL</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Efficiency</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                      data-ocid="employees.loading_state"
                    >
                      Loading employees from Google Sheets...
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                      data-ocid="employees.empty_state"
                    >
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((emp) => (
                    <EmployeeRow
                      key={emp.fiplCode}
                      employee={emp}
                      onSelect={onSelectEmployee}
                      onEdit={openEdit}
                      onDelete={(fipl) => setDeleteTarget(fipl)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              data-ocid="employees.pagination_prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="flex items-center px-3">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              data-ocid="employees.pagination_next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="employees.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Edit Employee" : "Add Employee"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>FIPL Code *</Label>
              <Input
                value={form.fiplCode}
                onChange={(e) => setField("fiplCode", e.target.value)}
                disabled={!!editingEmployee}
                data-ocid="employees.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setField("role", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setField("department", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dept" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Region</Label>
              <Select
                value={form.region}
                onValueChange={(v) => setField("region", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Category (FSE)</Label>
              <Input
                value={form.fseCategory}
                onChange={(e) => setField("fseCategory", e.target.value)}
                placeholder="Star, Cash Cow..."
              />
            </div>
            <div className="space-y-1">
              <Label>Join Date</Label>
              <Input
                type="text"
                placeholder="DD-MM-YYYY"
                value={form.joinDate}
                onChange={(e) => setField("joinDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setField("status", v as Employee["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="onHold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="employees.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} data-ocid="employees.submit_button">
              {editingEmployee ? "Update" : "Add"} Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="employees.modal">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the employee and all related records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="employees.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              data-ocid="employees.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
