import { Inject, Injectable, Logger } from '@nestjs/common';
import type { UploadFile } from '../../../media/types/upload-file';
import { MailService } from '../../../mail/applications/services/mail.service';
import { Payment } from '../../../payment/domain/entities/payment.entity';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../../../payment/domain/repositories/payment.repository';
import { INVOICE_SOURCE_MODULE } from '../../domain/constants/invoice-source.constant';
import { BuildCustomerInvoiceEmailBodyService } from '../services/build-customer-invoice-email-body.service';
import { BuildHostPaymentNotificationEmailBodyService } from '../services/build-host-payment-notification-email-body.service';
import { BuildPaymentInvoiceDataService } from '../services/build-payment-invoice-data.service';
import { GenerateInvoicePdfService } from '../services/generate-invoice-pdf.service';

@Injectable()
export class SendPaymentInvoiceNotificationsUseCase {
  private readonly logger = new Logger(SendPaymentInvoiceNotificationsUseCase.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly buildPaymentInvoiceData: BuildPaymentInvoiceDataService,
    private readonly generateInvoicePdf: GenerateInvoicePdfService,
    private readonly buildCustomerInvoiceEmailBody: BuildCustomerInvoiceEmailBodyService,
    private readonly buildHostPaymentNotificationEmailBody: BuildHostPaymentNotificationEmailBodyService,
    private readonly mailService: MailService,
  ) {}

  async execute(payment: Payment): Promise<void> {
    if (!payment.id) {
      return;
    }

    const fresh = await this.paymentRepository.findById(payment.id);
    if (!fresh || fresh.invoiceNotificationsSentAt != null) {
      return;
    }

    await this.paymentRepository.update(
      new Payment(
        fresh.amount,
        fresh.currency,
        fresh.status,
        fresh.provider,
        fresh.transactionId,
        fresh.userId,
        fresh.roomId,
        fresh.checkInDate,
        fresh.checkOutDate,
        fresh.guestCount,
        fresh.nights,
        fresh.reservationId,
        fresh.cartId,
        fresh.reservationIds,
        fresh.errorMessage,
        fresh.id,
        fresh.createdAt,
        fresh.updatedAt,
        new Date(),
      ),
    );

    const invoiceData = await this.buildPaymentInvoiceData.execute(fresh);
    if (!invoiceData) {
      this.logger.warn(
        `Impossible de générer la facture pour le paiement #${fresh.id}.`,
      );
      return;
    }

    const pdfBuffer = await this.generateInvoicePdf.execute(invoiceData);
    const pdfFile = this.toUploadFile(
      `facture-${invoiceData.invoiceNumber}.pdf`,
      pdfBuffer,
    );

    await this.mailService.sendSimple({
      to: invoiceData.customerEmail,
      subject: `Confirmation de paiement · ${invoiceData.invoiceNumber}`,
      body: this.buildCustomerInvoiceEmailBody.execute(invoiceData),
      isHtml: true,
      sourceModule: INVOICE_SOURCE_MODULE.CUSTOMER,
      files: [pdfFile],
    });

    const hostGroups =
      await this.buildPaymentInvoiceData.buildHostNotificationGroups(invoiceData);

    for (const group of hostGroups) {
      await this.mailService.sendSimple({
        to: group.ownerEmail,
        subject: `Nouvelle réservation confirmée · ${group.items[0]?.propertyName ?? 'Votre établissement'}`,
        body: this.buildHostPaymentNotificationEmailBody.execute(
          invoiceData,
          group,
        ),
        isHtml: true,
        sourceModule: INVOICE_SOURCE_MODULE.HOST,
      });
    }
  }

  private toUploadFile(filename: string, buffer: Buffer): UploadFile {
    return {
      fieldname: 'attachments',
      originalname: filename,
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: buffer.length,
      buffer,
    };
  }
}
