import "server-only";
import ExcelJS from "exceljs";

export interface XlsxColumn<T> {
  header: string;
  key: string;
  width?: number;
  value: (row: T) => string | number | Date | null | undefined;
  numFmt?: string;
}

export async function buildXlsxResponse<T>(opts: {
  filename: string;
  sheetName: string;
  rows: T[];
  columns: XlsxColumn<T>[];
}): Promise<Response> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Rutega Admin";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(opts.sheetName, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = opts.columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width ?? Math.max(12, c.header.length + 2),
  }));

  // Style header row.
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FF0747B5" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEAF2FF" },
  };
  header.alignment = { vertical: "middle", horizontal: "left" };
  header.height = 22;
  header.commit();

  for (const row of opts.rows) {
    const values: Record<string, string | number | Date | null | undefined> = {};
    for (const col of opts.columns) {
      values[col.key] = col.value(row);
    }
    const added = sheet.addRow(values);
    for (const col of opts.columns) {
      if (col.numFmt) {
        added.getCell(col.key).numFmt = col.numFmt;
      }
    }
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: opts.columns.length },
  };

  const buf = await workbook.xlsx.writeBuffer();
  // Convert ExcelJS Buffer (Node) to a fresh ArrayBuffer for the Web Response.
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(new Uint8Array(buf as ArrayBuffer));
  const safeName = opts.filename.replace(/[^a-z0-9._-]/gi, "_");
  return new Response(ab, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "no-store",
      "Content-Length": String(buf.byteLength),
    },
  });
}
