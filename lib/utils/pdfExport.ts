import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ── Constants ──────────────────────────────────────────────────── */
const PAGE_MARGIN = 20;
const BRAND_COLOR: [number, number, number] = [67, 56, 202]; // indigo-600
const HEADER_BG: [number, number, number] = [241, 245, 249]; // slate-100
const TEXT_DARK: [number, number, number] = [30, 41, 59]; // slate-800
const TEXT_LIGHT: [number, number, number] = [100, 116, 139]; // slate-500

/* ── Types ──────────────────────────────────────────────────────── */
export interface PdfField {
  label: string;
  value: string;
}

export interface PdfTableColumn {
  header: string;
  dataKey: string;
}

export interface PdfTableOptions {
  title: string;
  columns: PdfTableColumn[];
  rows: Record<string, string | number>[];
}

/* ── Helpers ─────────────────────────────────────────────────────── */

/** Create a new PDF document with KAMATS header */
export function createPdf(title: string, subtitle?: string): jsPDF {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageW = doc.internal.pageSize.getWidth();

  // Brand bar
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageW, 56, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('KAMATS', PAGE_MARGIN, 24);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Kano State Water Board — Chemical Tracking System', PAGE_MARGIN, 40);

  // Document title
  doc.setTextColor(...TEXT_DARK);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, PAGE_MARGIN, 80);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_LIGHT);
    doc.text(subtitle, PAGE_MARGIN, 96);
  }

  // Timestamp
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_LIGHT);
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, pageW - PAGE_MARGIN, 80, { align: 'right' });

  return doc;
}

/** Add a section of key-value fields (2-column layout) */
export function addFieldSection(
  doc: jsPDF,
  startY: number,
  sectionTitle: string,
  fields: PdfField[],
): number {
  const pageW = doc.internal.pageSize.getWidth();
  const colW = (pageW - PAGE_MARGIN * 2) / 2;
  let y = startY;

  // Section title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_DARK);
  doc.text(sectionTitle, PAGE_MARGIN, y);
  y += 6;

  // Underline
  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(1.5);
  doc.line(PAGE_MARGIN, y, PAGE_MARGIN + 40, y);
  y += 14;

  for (let i = 0; i < fields.length; i += 2) {
    const leftField = fields[i];
    const rightField = fields[i + 1];

    // Check page break
    if (y > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      y = PAGE_MARGIN + 20;
    }

    // Left column
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT_LIGHT);
    doc.text(leftField.label, PAGE_MARGIN, y);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_DARK);
    doc.text(leftField.value || '—', PAGE_MARGIN, y + 12);

    // Right column
    if (rightField) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEXT_LIGHT);
      doc.text(rightField.label, PAGE_MARGIN + colW, y);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_DARK);
      doc.text(rightField.value || '—', PAGE_MARGIN + colW, y + 12);
    }

    y += 28;
  }

  return y;
}

/** Add a data table */
export function addTable(
  doc: jsPDF,
  startY: number,
  options: PdfTableOptions,
): number {
  // Table title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_DARK);
  doc.text(options.title, PAGE_MARGIN, startY);
  startY += 6;
  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(1.5);
  doc.line(PAGE_MARGIN, startY, PAGE_MARGIN + 40, startY);
  startY += 10;

  autoTable(doc, {
    startY,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [options.columns.map((c) => c.header)],
    body: options.rows.map((r) => options.columns.map((c) => String(r[c.dataKey] ?? ''))),
    headStyles: {
      fillColor: HEADER_BG,
      textColor: TEXT_DARK,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      textColor: TEXT_DARK,
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    theme: 'grid',
    styles: {
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.5,
      cellPadding: 6,
    },
  });

  // Get the Y after table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? startY + 40;
  return finalY + 16;
}

/** Add a footer with page numbers */
export function addFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_LIGHT);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageW / 2,
      pageH - 12,
      { align: 'center' },
    );
    doc.text(
      'KAMATS — Confidential',
      PAGE_MARGIN,
      pageH - 12,
    );
  }
}

/** Download the PDF */
export function downloadPdf(doc: jsPDF, filename: string): void {
  addFooter(doc);
  doc.save(filename);
}
