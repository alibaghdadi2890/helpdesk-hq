import type { TicketStatus } from "@/db/schema";
import { conflict } from "./errors";

/**
 * Allowed status changes.
 *   new     → open, pending, solved
 *   open    → pending, solved
 *   pending → open, solved
 *   solved  → open (reopened), closed
 *   closed  → nothing: closed tickets are read only
 * "closed" is normally set by the close-solved job after 7 days in "solved".
 */
const ALLOWED: Record<TicketStatus, readonly TicketStatus[]> = {
  new: ["open", "pending", "solved"],
  open: ["pending", "solved"],
  pending: ["open", "solved"],
  solved: ["open", "closed"],
  closed: [],
};

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return ALLOWED[from].includes(to);
}

export function assertTransition(from: TicketStatus, to: TicketStatus): void {
  if (from === to) return;
  if (!canTransition(from, to)) {
    const options = ALLOWED[from];
    throw conflict(
      options.length
        ? `A ${from} ticket cannot become ${to}. Allowed: ${options.join(", ")}.`
        : `A ${from} ticket cannot be changed.`,
    );
  }
}
