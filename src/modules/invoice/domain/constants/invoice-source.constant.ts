type EnvSource = NodeJS.ProcessEnv;

export type InvoiceBrandConfig = {
  name: string;
  color: string;
  supportEmail: string;
  logoPath: string | null;
};

export type InvoiceIssuerConfig = {
  name: string;
  address: string;
  siret: string;
  vatNumber: string;
};

function readEnv(env: EnvSource, key: string): string | undefined {
  const value = env[key]?.trim();
  return value || undefined;
}

export function getInvoiceBrand(env: EnvSource = process.env): InvoiceBrandConfig {
  return {
    name: readEnv(env, 'INVOICE_BRAND_NAME') ?? readEnv(env, 'BRAND_NAME') ?? 'StayBook',
    color: readEnv(env, 'INVOICE_BRAND_COLOR') ?? '#FF385C',
    supportEmail:
      readEnv(env, 'SUPPORT_EMAIL') ?? readEnv(env, 'INVOICE_SUPPORT_EMAIL') ?? 'support@staybook.app',
    logoPath: readEnv(env, 'INVOICE_LOGO_PATH') ?? null,
  };
}

export function getInvoiceIssuer(env: EnvSource = process.env): InvoiceIssuerConfig {
  return {
    name: readEnv(env, 'INVOICE_ISSUER_NAME') ?? readEnv(env, 'BRAND_NAME') ?? 'StayBook',
    address: readEnv(env, 'INVOICE_ISSUER_ADDRESS') ?? '',
    siret: readEnv(env, 'INVOICE_SIRET') ?? '',
    vatNumber: readEnv(env, 'INVOICE_VAT_NUMBER') ?? '',
  };
}

/** @deprecated Use getInvoiceBrand() */
export const INVOICE_BRAND = getInvoiceBrand();
