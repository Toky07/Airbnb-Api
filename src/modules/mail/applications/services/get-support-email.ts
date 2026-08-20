function readEnv(env: NodeJS.ProcessEnv, key: string): string | undefined {
  const value = env[key]?.trim();
  return value || undefined;
}

export function getSupportEmail(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return (
    readEnv(env, 'SUPPORT_EMAIL') ??
    readEnv(env, 'HOST_APPLICATION_NOTIFY_EMAIL')
  );
}
