const LOCAL_FALLBACK_URL = "http://localhost:3000";

function normalizeUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const explicitUrl = process.env.NEXTAUTH_URL?.trim();
  if (explicitUrl) {
    return normalizeUrl(explicitUrl);
  }

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) {
    return normalizeUrl(`https://${productionUrl}`);
  }

  const deploymentUrl = process.env.VERCEL_URL?.trim();
  if (deploymentUrl) {
    return normalizeUrl(`https://${deploymentUrl}`);
  }

  return LOCAL_FALLBACK_URL;
}
