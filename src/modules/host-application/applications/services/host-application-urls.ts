function readEnv(env: NodeJS.ProcessEnv, key: string): string | undefined {
  const value = env[key]?.trim();
  return value || undefined;
}

export function getHostApplicationNotifyEmail(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return (
    readEnv(env, 'HOST_APPLICATION_NOTIFY_EMAIL') ??
    readEnv(env, 'SUPPORT_EMAIL')
  );
}

export function getHostApplicationApplicantUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const base = (
    readEnv(env, 'APP_PUBLIC_URL') ?? 'http://localhost:5173'
  ).replace(/\/$/, '');
  return `${base}/become-host`;
}

export function getHostApplicationAdminUrl(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const base = (
    readEnv(env, 'ADMIN_PUBLIC_URL') ?? 'http://localhost:5174'
  ).replace(/\/$/, '');
  return `${base}/dashboard/hosts`;
}

export function getHostApplicationBrandName(
  env: NodeJS.ProcessEnv = process.env,
): string {
  return readEnv(env, 'BRAND_NAME') ?? 'Airbnb';
}
