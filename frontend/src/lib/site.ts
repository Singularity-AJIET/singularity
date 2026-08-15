export const getSiteUrl = () => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "http://localhost:3000";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
};