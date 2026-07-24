export type PricingBreakdownLine = {
  roomId?: number;
  propertyId?: number | null;
  subtotalCents: number;
  vatCents: number;
  touristTaxCents: number;
  serviceFeeCents: number;
  totalCents: number;
};

export type PricingBreakdown = {
  subtotalCents: number;
  vatCents: number;
  touristTaxCents: number;
  serviceFeeCents: number;
  totalCents: number;
  lines: PricingBreakdownLine[];
};

export type PricingLineInput = {
  checkIn: string;
  checkOut: string;
  pricePerNight: number;
  guestCount: number;
  touristTaxPerGuestNight: number;
  roomId?: number;
  propertyId?: number | null;
};
