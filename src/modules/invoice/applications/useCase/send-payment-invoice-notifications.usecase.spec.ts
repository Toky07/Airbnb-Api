import { beforeEach, describe, expect, it, vi } from 'vitest';
import { INVOICE_SOURCE_MODULE } from '../../domain/constants/invoice-source.constant';
import { BuildCustomerInvoiceEmailBodyService } from '../services/build-customer-invoice-email-body.service';
import { BuildHostPaymentNotificationEmailBodyService } from '../services/build-host-payment-notification-email-body.service';
import { BuildPaymentInvoiceDataService } from '../services/build-payment-invoice-data.service';
import { GenerateInvoicePdfService } from '../services/generate-invoice-pdf.service';
import {
  createSampleInvoiceData,
  createSamplePaymentForInvoice,
} from './invoice-test.helpers';
import { SendPaymentInvoiceNotificationsUseCase } from './send-payment-invoice-notifications.usecase';

describe('SendPaymentInvoiceNotificationsUseCase', () => {
  const paymentRepository = {
    findById: vi.fn(),
    update: vi.fn(),
  };
  const buildPaymentInvoiceData = {
    execute: vi.fn(),
    buildHostNotificationGroups: vi.fn(),
  };
  const generateInvoicePdf = {
    execute: vi.fn(),
  };
  const buildCustomerInvoiceEmailBody = {
    execute: vi.fn(),
  };
  const buildHostPaymentNotificationEmailBody = {
    execute: vi.fn(),
  };
  const mailService = {
    sendSimple: vi.fn(),
  };

  let useCase: SendPaymentInvoiceNotificationsUseCase;

  beforeEach(() => {
    vi.clearAllMocks();

    buildPaymentInvoiceData.execute.mockResolvedValue(createSampleInvoiceData());
    buildPaymentInvoiceData.buildHostNotificationGroups.mockResolvedValue([
      {
        ownerId: 5,
        ownerEmail: 'host@test.com',
        ownerName: 'Marie Martin',
        items: createSampleInvoiceData().lineItems,
      },
    ]);
    generateInvoicePdf.execute.mockResolvedValue(Buffer.from('%PDF-test'));
    buildCustomerInvoiceEmailBody.execute.mockReturnValue('<p>Confirmation</p>');
    buildHostPaymentNotificationEmailBody.execute.mockReturnValue('Nouvelle réservation');
    mailService.sendSimple.mockResolvedValue({});
    paymentRepository.findById.mockResolvedValue(createSamplePaymentForInvoice());
    paymentRepository.update.mockImplementation(async (payment) => payment);

    useCase = new SendPaymentInvoiceNotificationsUseCase(
      paymentRepository as never,
      buildPaymentInvoiceData as unknown as BuildPaymentInvoiceDataService,
      generateInvoicePdf as unknown as GenerateInvoicePdfService,
      buildCustomerInvoiceEmailBody as unknown as BuildCustomerInvoiceEmailBodyService,
      buildHostPaymentNotificationEmailBody as unknown as BuildHostPaymentNotificationEmailBodyService,
      mailService as never,
    );
  });

  it('envoie la facture PDF au client et notifie le propriétaire', async () => {
    await useCase.execute(createSamplePaymentForInvoice());

    expect(generateInvoicePdf.execute).toHaveBeenCalled();
    expect(mailService.sendSimple).toHaveBeenCalledTimes(2);
    expect(mailService.sendSimple).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'jean@test.com',
        isHtml: true,
        sourceModule: INVOICE_SOURCE_MODULE.CUSTOMER,
        files: expect.arrayContaining([
          expect.objectContaining({
            mimetype: 'application/pdf',
            originalname: 'facture-FACT-2026-000042.pdf',
          }),
        ]),
      }),
    );
    expect(mailService.sendSimple).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'host@test.com',
        sourceModule: INVOICE_SOURCE_MODULE.HOST,
      }),
    );
    expect(paymentRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceNotificationsSentAt: expect.any(Date),
      }),
    );
  });

  it('ignore les paiements déjà notifiés', async () => {
    paymentRepository.findById.mockResolvedValue(
      createSamplePaymentForInvoice({
        invoiceNotificationsSentAt: new Date('2026-06-10T15:00:00.000Z'),
      }),
    );

    await useCase.execute(createSamplePaymentForInvoice());

    expect(buildPaymentInvoiceData.execute).not.toHaveBeenCalled();
    expect(mailService.sendSimple).not.toHaveBeenCalled();
    expect(paymentRepository.update).not.toHaveBeenCalled();
  });

  it('ne envoie pas d\'email si les données de facture sont indisponibles', async () => {
    buildPaymentInvoiceData.execute.mockResolvedValue(null);

    await useCase.execute(createSamplePaymentForInvoice());

    expect(mailService.sendSimple).not.toHaveBeenCalled();
  });
});
