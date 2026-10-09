import { type Clock, systemClock } from "../shared/clock";
import { DomainError } from "../shared/errors";
import { type IdGenerator, SequentialIdGenerator } from "../shared/id";
import { err, ok, type Result } from "../shared/result";
import { availableUnits, type StockLevel } from "./stock-level";
import type { Reservation, ReservationLine, ShortfallLine } from "./reservation";

export class OutOfStockError extends DomainError {
  readonly shortfall: readonly ShortfallLine[];

  constructor(shortfall: readonly ShortfallLine[]) {
    const detail = shortfall
      .map((line) => `${line.sku} (requested ${line.requested}, available ${line.available})`)
      .join(", ");
    super(`Insufficient stock for ${detail}`, "OUT_OF_STOCK");
    this.name = "OutOfStockError";
    this.shortfall = shortfall;
  }
}

export interface InventoryServiceOptions {
  initialStock?: readonly StockLevel[];
  clock?: Clock;
  ids?: IdGenerator;
}

/**
 * Stock reservation. Reserving does not move stock: it records a promise
 * against it. Stock leaves on `consume`, and a cancelled order `release`s it.
 */
export class InventoryService {
  private readonly levels = new Map<string, StockLevel>();
  private readonly reservations = new Map<string, Reservation>();
  private readonly clock: Clock;
  private readonly ids: IdGenerator;

  constructor(options: InventoryServiceOptions = {}) {
    for (const level of options.initialStock ?? []) {
      this.levels.set(level.sku, { ...level });
    }
    this.clock = options.clock ?? systemClock;
    this.ids = options.ids ?? new SequentialIdGenerator();
  }

  levelFor(sku: string): StockLevel {
    return this.levels.get(sku) ?? { sku, onHand: 0, reserved: 0 };
  }

  available(sku: string): number {
    return availableUnits(this.levelFor(sku));
  }

  receive(sku: string, quantity: number): void {
    const level = this.levelFor(sku);
    this.levels.set(sku, { ...level, onHand: level.onHand + quantity });
  }

  reserve(orderId: string, lines: readonly ReservationLine[]): Result<Reservation> {
    const shortfall: ShortfallLine[] = [];
    for (const line of lines) {
      const available = this.available(line.sku);
      if (available < line.quantity) {
        shortfall.push({ sku: line.sku, requested: line.quantity, available });
      }
    }
    if (shortfall.length > 0) {
      return err(new OutOfStockError(shortfall));
    }

    for (const line of lines) {
      const level = this.levelFor(line.sku);
      this.levels.set(line.sku, { ...level, reserved: level.reserved + line.quantity });
    }

    const reservation: Reservation = {
      id: this.ids.next("rsv"),
      orderId,
      lines: lines.map((line) => ({ ...line })),
      status: "held",
      createdAt: this.clock.now().toISOString(),
    };
    this.reservations.set(reservation.id, reservation);
    return ok(reservation);
  }

  release(reservationId: string): void {
    const reservation = this.reservations.get(reservationId);
    if (!reservation || reservation.status !== "held") {
      return;
    }
    for (const line of reservation.lines) {
      const level = this.levelFor(line.sku);
      this.levels.set(line.sku, {
        ...level,
        reserved: Math.max(0, level.reserved - line.quantity),
      });
    }
    this.reservations.set(reservationId, { ...reservation, status: "released" });
  }

  consume(reservationId: string): void {
    const reservation = this.reservations.get(reservationId);
    if (!reservation || reservation.status !== "held") {
      return;
    }
    for (const line of reservation.lines) {
      const level = this.levelFor(line.sku);
      this.levels.set(line.sku, {
        onHand: Math.max(0, level.onHand - line.quantity),
        reserved: Math.max(0, level.reserved - line.quantity),
        sku: line.sku,
      });
    }
    this.reservations.set(reservationId, { ...reservation, status: "consumed" });
  }

  reservationFor(id: string): Reservation | undefined {
    return this.reservations.get(id);
  }
}
