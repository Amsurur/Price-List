// Client-side parsing for the bulk product upload screen. No React here —
// pure functions that turn an uploaded file into rows the review screen can
// render and edit before anything is sent to the API.
import ExcelJS from "exceljs";
import Papa from "papaparse";
import type { ProductInput } from "./types";

export interface ParsedProductRow {
  // Client-only key for React lists/editing — never sent to the API.
  id: string;
  data: ProductInput;
}

export class ParseError extends Error {}

// Fixed template headers (Russian, matching the rest of the admin UI) for
// .xlsx/.csv uploads. .json uploads use the same field names as ProductInput
// instead, since that's "our own" product shape.
const TEMPLATE_HEADERS = [
  "Название",
  "Категория",
  "Теги",
  "Цена",
  "Скидка для студентов, %",
  "Остаток",
  "Описание",
  "Активен",
] as const;

function newRowId(): string {
  return crypto.randomUUID();
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  const s = String(value).trim().toLowerCase();
  if (["да", "true", "1", "yes"].includes(s)) return true;
  if (["нет", "false", "0", "no"].includes(s)) return false;
  return fallback;
}

// Same normalization ProductForm applies on submit (product-form.tsx:86-89).
function toTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

function toNumber(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toText(value: unknown): string | undefined {
  const s = value === undefined || value === null ? "" : String(value).trim();
  return s.length > 0 ? s : undefined;
}

function fromTemplateRow(row: Record<string, unknown>): ProductInput {
  return {
    name: toText(row["Название"]) ?? "",
    category: toText(row["Категория"]),
    tags: toTags(row["Теги"]),
    price: toNumber(row["Цена"], 0),
    memberDiscount: toNumber(row["Скидка для студентов, %"], 15),
    stock: toNumber(row["Остаток"], 0),
    description: toText(row["Описание"]),
    active: toBoolean(row["Активен"], true),
    images: [],
  };
}

function fromJsonRow(row: Record<string, unknown>): ProductInput {
  return {
    name: toText(row.name) ?? "",
    category: toText(row.category),
    tags: toTags(row.tags),
    price: toNumber(row.price, 0),
    memberDiscount: toNumber(row.memberDiscount, 15),
    stock: toNumber(row.stock, 0),
    description: toText(row.description),
    active: row.active === undefined ? true : Boolean(row.active),
    images: Array.isArray(row.images) ? row.images.map(String) : [],
  };
}

export async function parseProductsFile(file: File): Promise<ParsedProductRow[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "json") return parseJsonFile(file);
  if (ext === "csv") return parseCsvFile(file);
  if (ext === "xlsx") return parseXlsxFile(file);
  throw new ParseError("Поддерживаются только файлы .xlsx, .csv и .json");
}

async function parseJsonFile(file: File): Promise<ParsedProductRow[]> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ParseError("Файл повреждён — это не корректный JSON");
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new ParseError("JSON должен содержать список товаров");
  }
  return parsed.map((row) => ({
    id: newRowId(),
    data: fromJsonRow(row as Record<string, unknown>),
  }));
}

async function parseCsvFile(file: File): Promise<ParsedProductRow[]> {
  const text = await file.text();
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  if (result.errors.length > 0) {
    throw new ParseError("Не удалось прочитать CSV-файл");
  }
  if (result.data.length === 0) {
    throw new ParseError("В файле нет строк с товарами");
  }
  return result.data.map((row) => ({ id: newRowId(), data: fromTemplateRow(row) }));
}

async function parseXlsxFile(file: File): Promise<ParsedProductRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new ParseError("В файле нет ни одного листа");
  }

  const headers: string[] = [];
  sheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? "").trim();
  });

  const rows: ParsedProductRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, unknown> = {};
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (header) record[header] = cell.value;
    });
    if (Object.keys(record).length > 0) {
      rows.push({ id: newRowId(), data: fromTemplateRow(record) });
    }
  });

  if (rows.length === 0) {
    throw new ParseError("В файле нет строк с товарами");
  }
  return rows;
}

// Generates and downloads a starter .xlsx with the fixed headers + one
// example row, so the owner doesn't have to guess the column names.
export async function downloadProductsTemplate(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Товары");
  sheet.addRow([...TEMPLATE_HEADERS]);
  sheet.addRow([
    "Ноутбук Lenovo IdeaPad 3",
    "Ноутбуки",
    "ноутбук, для учёбы",
    4500000,
    15,
    3,
    "Лёгкий ноутбук для учёбы",
    "Да",
  ]);
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((col) => {
    col.width = 24;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "шаблон-товаров.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}
