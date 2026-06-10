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
    if (!payment.id || payment.invoiceNotificationsSentAt != null) {
      return;
    }

    const invoiceData = await this.buildPaymentInvoiceData.execute(payment);
    if (!invoiceData) {
      this.logger.warn(
        `Impossible de générer la facture pour le paiement #${payment.id}.`,
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
      if (group.ownerEmail === invoiceData.customerEmail) {
        continue;
      }

      await this.mailService.sendSimple({
        to: group.ownerEmail,
        subject: `Nouvelle réservation confirmée · ${group.items[0]?.propertyName ?? 'Votre établissement'}`,
        body: this.buildHostPaymentNotificationEmailBody.execute(
          invoiceData,
          group,
        ),
        sourceModule: INVOICE_SOURCE_MODULE.HOST,
      });
    }

    await this.paymentRepository.update(
      new Payment(
        payment.amount,
        payment.currency,
        payment.status,
        payment.provider,
        payment.transactionId,
        payment.userId,
        payment.roomId,
        payment.checkInDate,
        payment.checkOutDate,
        payment.guestCount,
        payment.nights,
        payment.reservationId,
        payment.cartId,
        payment.reservationIds,
        payment.errorMessage,
        payment.id,
        payment.createdAt,
        payment.updatedAt,
        new Date(),
      ),
    );
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
