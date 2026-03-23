const SPREADSHEET_ID = "14SPX91n8Y4rCt58bpmXOj5BGpmcIR2i3-gTJbmR_fnw";

export const SHEET_NAMES = {
  employeeDetails: "Employee Details",
  fseParameters: "FSE Parameters",
  attendance: "Attendance",
  swotAnalysis: "SWOT Analysis",
  salesData: "Sales Data",
  callingRecords: "Calling Records",
};

// CSV parser that handles quoted fields with commas inside them
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());
    rows.push(fields);
  }
  return rows;
}

// Fetch sheet by name
export async function fetchSheetByName(sheetName: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Failed to fetch sheet "${sheetName}": ${res.status}`);
  const text = await res.text();
  const rows = parseCSV(text);
  return rows.slice(1).filter((row) => row.some((cell) => cell !== ""));
}

// Parse date: DD-MM-YYYY, DD/MM/YYYY, or Excel serial number
export function parseDate(val: string): string | null {
  if (!val || !val.trim()) return null;
  const v = val.trim();
  // Excel serial
  if (/^\d+$/.test(v)) {
    const serial = Number.parseInt(v);
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date.toISOString();
  }
  // DD-MM-YYYY or DD/MM/YYYY
  const m = v.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (m) {
    return new Date(
      Number.parseInt(m[3]),
      Number.parseInt(m[2]) - 1,
      Number.parseInt(m[1]),
    ).toISOString();
  }
  return null;
}

// Parse number: strip ₹, commas, whitespace
export function parseNumber(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/[₹,\s]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

// Normalize text: trim, empty → null
export function normalizeText(val: string | undefined): string | null {
  if (!val) return null;
  const t = val.trim();
  return t === "" ? null : t;
}
