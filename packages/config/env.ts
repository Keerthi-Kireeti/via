export const sharedEnv = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "pk.demo-token"
};
