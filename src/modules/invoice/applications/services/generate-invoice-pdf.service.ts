import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { INVOICE_BRAND } from '../../domain/constants/invoice-source.constant';
import type { InvoiceData } from '../../domain/types/invoice-data.type';
import {
  formatInvoiceAmount,
  formatInvoiceDate,
} from '../utils/format-invoice.util';

@Injectable()
export class GenerateInvoicePdfService {
  async execute(data: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        info: {
          Title: `Facture ${data.invoiceNumber}`,
          Author: INVOICE_BRAND.name,
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.drawHeader(doc, data);
      this.drawCustomerSection(doc, data);
      this.drawLineItemsTable(doc, data);
      this.drawTotals(doc, data);
      this.drawFooter(doc, data);

      doc.end();
    });
  }

  private drawHeader(doc: InstanceType<typeof PDFDocument>, data: InvoiceData): void {
    doc.rect(0, 0, doc.page.width, 120).fill(INVOICE_BRAND.color);

    doc
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .fontSize(28)
      .text(INVOICE_BRAND.name, 50, 36);

    doc
      .font('Helvetica')
      .fontSize(12)
      .text('Facture', 50, 72);

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
      .text(`Date : ${formatInvoiceDate(data.paidAt)}`, doc.page.width - 200, 84, {
        width: 150,
        align: 'right',
      });

    doc.fillColor('#111827');
  }

  private drawCustomerSection(
    doc: InstanceType<typeof PDFDocument>,
    data: InvoiceData,
  ): void {
    const top = 150;

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
        .text(`${reference.label} : ${reference.value}`, doc.page.width - 250, referenceY, {
          width: 200,
          align: 'right',
        });
      referenceY += 16;
    }
  }

  private drawLineItemsTable(
    doc: InstanceType<typeof PDFDocument>,
    data: InvoiceData,
  ): void {
    const tableTop = 250;
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
      if (rowY > doc.page.height - 160) {
        doc.addPage();
        rowY = 60;
      }

      if (index % 2 === 1) {
        doc
          .rect(40, rowY - 6, doc.page.width - 80, 52)
          .fill('#F9FAFB');
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
        .text(item.columns?.dates ?? '—', columns.dates, rowY + 6, { width: 95 })
        .text(String(item.columns?.guests ?? '—'), columns.guests, rowY + 6)
        .text(String(item.columns?.nights ?? '—'), columns.nights, rowY + 6)
        .text(
          formatInvoiceAmount(item.unitPriceCents, data.currency),
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

      rowY += 58;
    }
  }

  private drawTotals(doc: InstanceType<typeof PDFDocument>, data: InvoiceData): void {
    const boxTop = doc.page.height - 170;
    const boxLeft = doc.page.width - 260;

    doc
      .roundedRect(boxLeft - 20, boxTop, 220, 72, 8)
      .fill('#FFF1F2');

    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#374151')
      .text('Sous-total', boxLeft, boxTop + 16)
      .text('Total TTC', boxLeft, boxTop + 42);

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#111827')
      .text(
        formatInvoiceAmount(data.totalCents, data.currency),
        boxLeft + 80,
        boxTop + 16,
        { width: 100, align: 'right' },
      )
      .fontSize(16)
      .fillColor(INVOICE_BRAND.color)
      .text(
        formatInvoiceAmount(data.totalCents, data.currency),
        boxLeft + 60,
        boxTop + 38,
        { width: 120, align: 'right' },
      );
  }

  private drawFooter(doc: InstanceType<typeof PDFDocument>, data: InvoiceData): void {
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#6B7280')
      .text(
        `Merci pour votre confiance. Cette facture confirme le règlement de ${formatInvoiceAmount(data.totalCents, data.currency)} pour ${data.items.length} article${data.items.length > 1 ? 's' : ''}.`,
        50,
        doc.page.height - 90,
        { width: doc.page.width - 100, align: 'center' },
      )
      .text(
        `Questions ? ${INVOICE_BRAND.supportEmail}`,
        50,
        doc.page.height - 72,
        { width: doc.page.width - 100, align: 'center' },
      );
  }
}
