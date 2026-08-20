export type PropertyArrivalGuide = {
  houseRules: string;
  checkInInstructions: string;
  wifiName: string;
  wifiPassword: string;
  emergencyContact: string;
};

export const EMPTY_PROPERTY_ARRIVAL_GUIDE: PropertyArrivalGuide = {
  houseRules: '',
  checkInInstructions: '',
  wifiName: '',
  wifiPassword: '',
  emergencyContact: '',
};

export function parseOptionalText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

export function parseArrivalGuide(
  source: Partial<PropertyArrivalGuide> | Record<string, unknown>,
): PropertyArrivalGuide {
  return {
    houseRules: parseOptionalText(source.houseRules),
    checkInInstructions: parseOptionalText(source.checkInInstructions),
    wifiName: parseOptionalText(source.wifiName),
    wifiPassword: parseOptionalText(source.wifiPassword),
    emergencyContact: parseOptionalText(source.emergencyContact),
  };
}
