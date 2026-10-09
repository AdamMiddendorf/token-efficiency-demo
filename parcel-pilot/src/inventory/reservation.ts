export type ReservationStatus = "held" | "released" | "consumed";

export interface ReservationLine {
  sku: string;
  quantity: number;
}

export interface Reservation {
  id: string;
  orderId: string;
  lines: ReservationLine[];
  status: ReservationStatus;
  createdAt: string;
}

export interface ShortfallLine {
  sku: string;
  requested: number;
  available: number;
}
