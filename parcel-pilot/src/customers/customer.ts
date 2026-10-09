import type { CustomerTier } from "./customer-tier";

export interface Customer {
  id: string;
  name: string;
  email: string;
  tier: CustomerTier;
  countryCode: string;
}
