export type ReservationInvoiceLineItem = {
  reservationId: number;
  roomName: string;
  propertyName: string;
  propertyCity: string | null;
  propertyAddress: string;
  propertyCountry: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  nights: number;
  unitPrice: number;
  totalPrice: number;
  propertyOwnerId: number;
};

export type HostPaymentNotificationGroup = {
  ownerId: number;
  ownerEmail: string;
  ownerName: string;
  items: ReservationInvoiceLineItem[];
};

export type ReservationInvoiceContext = {
  paymentId: number;
  invoiceNumber: string;
  transactionId: string;
  paidAt: Date;
  amountCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  lineItems: ReservationInvoiceLineItem[];
  totals?: {
    subtotalCents: number;
    vatCents: number;
    touristTaxCents: number;
    serviceFeeCents: number;
    totalCents: number;
  };
};
