"use client";

import jsPDF from "jspdf";
import type { ManagedRecord, ManagedUser } from "@/types/admin";
import { dateTime } from "@/utils/format";
import { formatRole } from "@/utils/permissions";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCell(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function exportHtmlWorkbook(filename: string, columns: string[], rows: Array<Array<string | number>>) {
  const html = `
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <table>
          <thead>
            <tr>${columns.map((column) => `<th>${escapeCell(column)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) =>
                  `<tr>${row.map((cell) => `<td>${escapeCell(cell)}</td>`).join("")}</tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  downloadBlob(
    new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }),
    filename,
  );
}

export function exportUsersToExcel(users: ManagedUser[]) {
  exportHtmlWorkbook(
    "admin-kullanicilar.xls",
    ["Ad", "Eposta", "Rol", "Durum", "Plan", "Gelir", "Konum", "Son aktiflik"],
    users.map((user) => [
      user.name,
      user.email,
      formatRole(user.role),
      user.status,
      user.plan,
      user.revenue,
      user.location,
      dateTime.format(new Date(user.lastActive)),
    ]),
  );
}

export function exportRecordsToExcel(records: ManagedRecord[]) {
  exportHtmlWorkbook(
    "admin-veri-kayitlari.xls",
    ["Baslik", "Sahip", "Kategori", "Durum", "Oncelik", "Tutar", "Etiketler"],
    records.map((record) => [
      record.title,
      record.owner,
      record.category,
      record.status,
      record.priority,
      record.amount,
      record.tags.join(", "),
    ]),
  );
}

export function exportRecordsToCsv(records: ManagedRecord[]) {
  const rows = [
    ["Baslik", "Sahip", "Kategori", "Durum", "Oncelik", "Tutar", "Etiketler"],
    ...records.map((record) => [
      record.title,
      record.owner,
      record.category,
      record.status,
      record.priority,
      String(record.amount),
      record.tags.join("|"),
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "admin-verileri.csv");
}

export function exportUsersToPdf(users: ManagedUser[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Admin Kullanici Raporu", 14, 18);
  doc.setFontSize(9);
  users.slice(0, 32).forEach((user, index) => {
    const y = 32 + index * 7;
    doc.text(
      `${index + 1}. ${user.name} | ${user.email} | ${formatRole(user.role)} | ${user.status}`,
      14,
      y,
    );
  });
  doc.save("admin-kullanicilar.pdf");
}

export function exportRecordsToPdf(records: ManagedRecord[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Admin Veri Raporu", 14, 18);
  doc.setFontSize(9);
  records.slice(0, 32).forEach((record, index) => {
    const y = 32 + index * 7;
    doc.text(
      `${index + 1}. ${record.title} | ${record.category} | ${record.status} | ${record.amount}`,
      14,
      y,
    );
  });
  doc.save("admin-verileri.pdf");
}
