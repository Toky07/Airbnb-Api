import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import { getInvoiceBrand } from '../../domain/constants/invoice-source.constant';
import type { InvoiceData } from '../../domain/types/invoice-data.type';
import {
  formatInvoiceAmount,
  formatInvoiceDate,
} from '../utils/format-invoice.util';

@Injectable()
export class GenerateInvoicePdfService {
  async execute(data: InvoiceData): Promise<Buffer> {
    const brand = getInvoiceBrand();

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        info: {
          Title: `Facture ${data.invoiceNumber}`,
          Author: brand.name,
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.drawHeader(doc, data, brand);
      this.drawCustomerSection(doc, data);
      this.drawLineItemsTable(doc, data);
      this.drawTotals(doc, data, brand);
      this.drawFooter(doc, data, brand);

      doc.end();
    });
  }

  private drawHeader(
    doc: InstanceType<typeof PDFDocument>,
    data: InvoiceData,
    brand: ReturnType<typeof getInvoiceBrand>,
  ): void {
    doc.rect(0, 0, doc.page.width, 130).fill(brand.color);

    if (brand.logoPath && existsSync(brand.logoPath)) {
      doc.image(brand.logoPath, 50, 24, { fit: [80, 40] });
      doc
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(22)
        .text(brand.name, 140, 32);
    } else {
      doc
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(28)
        .text(brand.name, 50, 36);
    }

    doc.font('Helvetica').fontSize(10).text(data.issuer.name, 50, 72);
    if (data.issuer.address) {
      doc.text(data.issuer.address, 50, 86, { width: 260 });
    }
    const legalLines = [
      data.issuer.siret ? `SIRET : ${data.issuer.siret}` : null,
      data.issuer.vatNumber ? `TVA : ${data.issuer.vatNumber}` : null,
    ].filter(Boolean);
    if (legalLines.length > 0) {
      doc.text(legalLines.join(' · '), 50, 104, { width: 280 });
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('FACTURE', doc.page.width - 200, 40, {
        width: 150,
        align: 'right',
      });

    doc
      .font('Helvetica')
      .fontSize(10)
      .text(data.invoiceNumber, doc.page.width - 200, 68, {
        width: 150,
        align: 'right',
      })
      .text(
        `Date : ${formatInvoiceDate(data.paidAt)}`,
        doc.page.width - 200,
        84,
        {
          width: 150,
          align: 'right',
        },
      );

    doc.fillColor('#111827');
  }

  private drawCustomerSection(
    doc: InstanceType<typeof PDFDocument>,
    data: InvoiceData,
  ): void {
    const top = 160;

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#6B7280')
      .text('FACTURÉ À', 50, top);

    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#111827')
      .text(data.recipient.name, 50, top + 18);

    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#374151')
      .text(data.recipient.email, 50, top + 38);

    if (data.recipient.phone) {
      doc.text(data.recipient.phone, 50, top + 54);
    }

    let referenceY = top + 18;
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#6B7280')
      .text('RÉFÉRENCES', doc.page.width - 250, top);

    for (const reference of data.references) {
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#374151')
        .text(
          `${reference.label} : ${reference.value}`,
          doc.page.width - 250,
          referenceY,
          {
            width: 200,
            align: 'right',
          },
        );
      referenceY += 16;
    }
  }

  private drawLineItemsTable(
    doc: InstanceType<typeof PDFDocument>,
    data: InvoiceData,
  ): void {
    const tableTop = 260;
    const columns = {
      description: 50,
      dates: 230,
      guests: 340,
      nights: 390,
      unit: 440,
      total: 500,
    };

    doc
      .roundedRect(40, tableTop - 8, doc.page.width - 80, 28, 6)
      .fill('#FFF1F2');

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#9F1239')
      .text('Description', columns.description, tableTop)
      .text('Séjour', columns.dates, tableTop)
      .text('Voyageurs', columns.guests, tableTop)
      .text('Nuits', columns.nights, tableTop)
      .text('Prix/nuit', columns.unit, tableTop)
      .text('Total', columns.total, tableTop);

    let rowY = tableTop + 34;

    for (const [index, item] of data.items.entries()) {
      if (rowY > doc.page.height - 200) {
        doc.addPage();
        rowY = 60;
      }

      if (index % 2 === 1) {
        doc.rect(40, rowY - 6, doc.page.width - 80, 52).fill('#F9FAFB');
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#111827')
        .text(item.label, columns.description, rowY, { width: 160 });

      if (item.subtitle) {
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#6B7280')
          .text(item.subtitle, columns.description, rowY + 14, { width: 160 });
      }

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#374151')
        .text(item.columns?.dates ?? '—', columns.dates, rowY + 6, {
          width: 95,
        })
        .text(String(item.columns?.guests ?? '—'), columns.guests, rowY + 6)
        .text(String(item.columns?.nights ?? '—'), columns.nights, rowY + 6)
        .text(
          item.columns
            ? formatInvoiceAmount(item.unitPriceCents, data.currency)
            : '—',
          columns.unit,
          rowY + 6,
        )
        .font('Helvetica-Bold')
        .fillColor('#111827')
        .text(
          formatInvoiceAmount(item.totalPriceCents, data.currency),
          columns.total,
          rowY + 6,
        );

      rowY += item.columns ? 58 : 42;
    }
  }

  private drawTotals(
    doc: InstanceType<typeof PDFDocument>,
    data: InvoiceData,
    brand: ReturnType<typeof getInvoiceBrand>,
  ): void {
    const rows = [
      { label: 'Total HT', value: data.totals.subtotalCents },
      ...(data.totals.vatCents > 0
        ? [{ label: 'TVA', value: data.totals.vatCents }]
        : []),
      ...(data.totals.touristTaxCents > 0
        ? [{ label: 'Taxe de séjour', value: data.totals.touristTaxCents }]
        : []),
      ...(data.totals.serviceFeeCents > 0
        ? [{ label: 'Frais de service', value: data.totals.serviceFeeCents }]
        : []),
    ];

    const boxHeight = 28 + rows.length * 18 + 34;
    const boxTop = doc.page.height - boxHeight - 80;
    const boxLeft = doc.page.width - 260;

    doc.roundedRect(boxLeft - 20, boxTop, 220, boxHeight, 8).fill('#FFF1F2');

    let rowY = boxTop + 16;
    for (const row of rows) {
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#374151')
        .text(row.label, boxLeft, rowY)
        .font('Helvetica-Bold')
        .fillColor('#111827')
        .text(formatInvoiceAmount(row.value, data.currency), boxLeft + 80, rowY, {
          width: 100,
          align: 'right',
        });
      rowY += 18;
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#374151')
      .text('Total TTC', boxLeft, rowY + 4)
      .fontSize(16)
      .fillColor(brand.color)
      .text(
        formatInvoiceAmount(data.totals.totalCents, data.currency),
        boxLeft + 60,
        rowY,
        { width: 120, align: 'right' },
      );
  }

  private drawFooter(
    doc: InstanceType<typeof PDFDocument>,
    data: InvoiceData,
    brand: ReturnType<typeof getInvoiceBrand>,
  ): void {
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#6B7280')
      .text(
        `Merci pour votre confiance. Cette facture confirme le règlement de ${formatInvoiceAmount(data.totals.totalCents, data.currency)}.`,
        50,
        doc.page.height - 90,
        { width: doc.page.width - 100, align: 'center' },
      )
      .text(
        `Questions ? ${brand.supportEmail}`,
        50,
        doc.page.height - 72,
        { width: doc.page.width - 100, align: 'center' },
      );
  }
}
