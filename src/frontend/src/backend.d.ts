import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SWOT {
    weaknesses: Array<string>;
    strengths: Array<string>;
    threats: Array<string>;
    opportunities: Array<string>;
    cesScore: number;
    fiplCode: string;
}
export interface Attendance {
    date: string;
    recordId: bigint;
    labType: Variant_eod_daysBrief_attendance;
    fiplCode: string;
    reason: string;
    daysOff: bigint;
}
export interface Performance {
    videoCallDemos: bigint;
    operationalDiscipline: number;
    softSkillsScore: number;
    productKnowledgeScore: number;
    salesInfluenceIndex: number;
    reviewCount: bigint;
    complaintVisits: bigint;
    demoVisits: bigint;
    fiplCode: string;
}
export interface Employee {
    region: string;
    status: Variant_active_onHold;
    joinDate: string;
    name: string;
    role: string;
    fseCategory: string;
    department: string;
    fiplCode: string;
}
export interface SalesRecord {
    saleType: Variant_accessories_extendedWarranty;
    recordId: bigint;
    quantity: bigint;
    brand: Variant_tineco_ecovacs_coway_kuvings_instant;
    amount: number;
    product: string;
    saleDate: string;
    fiplCode: string;
}
export interface FeedbackEntry {
    remark: string;
    customerName: string;
    contact: string;
    agent: string;
    callDate: string;
    entryId: bigint;
    cesScore: number;
    brand: Variant_tineco_ecovacs_coway_kuvings_instant;
    product: string;
    fiplCode: string;
}
export interface DashboardStats {
    totalEmployees: bigint;
    totalSalesAmount: number;
    activeCount: bigint;
    averageCesScore: number;
}
export enum Variant_accessories_extendedWarranty {
    accessories = "accessories",
    extendedWarranty = "extendedWarranty"
}
export enum Variant_active_onHold {
    active = "active",
    onHold = "onHold"
}
export enum Variant_eod_daysBrief_attendance {
    eod = "eod",
    daysBrief = "daysBrief",
    attendance = "attendance"
}
export enum Variant_tineco_ecovacs_coway_kuvings_instant {
    tineco = "tineco",
    ecovacs = "ecovacs",
    coway = "coway",
    kuvings = "kuvings",
    instant = "instant"
}
export interface backendInterface {
    addAttendance(record: Attendance): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addEmployee(employee: Employee): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addFeedback(entry: FeedbackEntry): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addSalesRecord(record: SalesRecord): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteEmployee(fiplCode: string): Promise<void>;
    getActiveEmployees(): Promise<Array<Employee>>;
    getAllEmployees(): Promise<Array<Employee>>;
    getAllPerformancesSortedBySII(): Promise<Array<Performance>>;
    getAttendanceByFIPL(fiplCode: string): Promise<Array<Attendance>>;
    getDashboardStats(): Promise<DashboardStats>;
    getEmployee(fiplCode: string): Promise<Employee | null>;
    getFeedbackByFIPL(fiplCode: string): Promise<Array<FeedbackEntry>>;
    getPerformanceByFIPL(fiplCode: string): Promise<Performance | null>;
    getSWOTByFIPL(fiplCode: string): Promise<SWOT | null>;
    getSalesByFIPL(fiplCode: string): Promise<Array<SalesRecord>>;
    updateEmployee(employee: Employee): Promise<void>;
    upsertPerformance(performance: Performance): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    upsertSWOT(swot: SWOT): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
