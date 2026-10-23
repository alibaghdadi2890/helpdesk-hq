// Drizzle mapping of the tables created by migrations/. The SQL files are the source of
// truth; keep this file in step with them.
import { boolean, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  utcOffsetMinutes: integer("utc_offset_minutes").notNull(),
  workdays: integer("workdays").array().notNull(),
  workStartHour: integer("work_start_hour").notNull(),
  workEndHour: integer("work_end_hour").notNull(),
  nextTicketNumber: integer("next_ticket_number").notNull(),
  nextCustomerNumber: integer("next_customer_number").notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["agent", "lead", "admin"] }).notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
});

export const teamMembers = pgTable("team_members", {
  tenantId: uuid("tenant_id").notNull(),
  teamId: uuid("team_id").notNull(),
  userId: uuid("user_id").notNull(),
}, (t) => [primaryKey({ columns: [t.teamId, t.userId] })]);

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  code: text("code").notNull(),
  legacyNumber: integer("legacy_number"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  language: text("language").notNull().default("en"),
  plan: text("plan", { enum: ["standard", "priority", "enterprise"] }).notNull().default("standard"),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  name: text("name").notNull(),
});

export const slaPolicies = pgTable("sla_policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  name: text("name").notNull(),
  plan: text("plan", { enum: ["standard", "priority", "enterprise"] }).notNull(),
  firstResponseMins: integer("first_response_mins").notNull(),
  resolutionMins: integer("resolution_mins").notNull(),
});

export const TICKET_STATUSES = ["new", "open", "pending", "solved", "closed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export const CHANNELS = ["email", "web", "chat"] as const;
export const TICKET_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  number: integer("number").notNull(),
  subject: text("subject").notNull(),
  status: text("status", { enum: TICKET_STATUSES }).notNull().default("new"),
  priority: text("priority", { enum: TICKET_PRIORITIES }).notNull().default("normal"),
  channel: text("channel", { enum: CHANNELS }).notNull(),
  language: text("language").notNull().default("en"),
  customerId: uuid("customer_id").notNull(),
  teamId: uuid("team_id"),
  assigneeId: uuid("assignee_id"),
  productId: uuid("product_id"),
  slaPolicyId: uuid("sla_policy_id").notNull(),
  firstResponseDueAt: ts("first_response_due_at").notNull(),
  resolutionDueAt: ts("resolution_due_at").notNull(),
  firstResponseAt: ts("first_response_at"),
  pendingSince: ts("pending_since"),
  solvedAt: ts("solved_at"),
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  ticketId: uuid("ticket_id").notNull(),
  authorType: text("author_type", { enum: ["customer", "agent", "system"] }).notNull(),
  authorId: uuid("author_id"),
  body: text("body").notNull(),
  internal: boolean("internal").notNull().default(false),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const kbArticles = pgTable("kb_articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  slug: text("slug").notNull(),
  productId: uuid("product_id"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  language: text("language").notNull().default("en"),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});
