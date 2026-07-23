export class DownloadInvoiceQuery {
  constructor(
    public readonly invoiceId: number,
    public readonly authId: number | null,
    public readonly canReadAll: boolean,
  ) {}
}
