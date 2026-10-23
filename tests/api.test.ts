import { beforeAll, describe, expect, it } from "vitest";
import { GET as getHealth } from "@/app/health/route";
import { GET as listTickets, POST as createTicket } from "@/app/tickets/route";
import { GET as getTicket, PATCH as patchTicket } from "@/app/tickets/[id]/route";
import { GET as listMessages, POST as addMessage } from "@/app/tickets/[id]/messages/route";
import { GET as getCustomer } from "@/app/customers/[id]/route";
import { GET as searchKb } from "@/app/kb/articles/route";
import { GET as getArticle } from "@/app/kb/articles/[id]/route";
import { GET as slaReport } from "@/app/reports/sla/route";
import { POST as devLogin } from "@/app/auth/dev-login/route";
import { get, json, login, params } from "./helpers";

let lina: string;   // agent, Helpdesk HQ
let omar: string;   // lead, Helpdesk HQ
let yousef: string; // agent, Cedar Bank

beforeAll(async () => {
  [lina, omar, yousef] = await Promise.all([login("lina@hq.test"), login("omar@hq.test"), login("yousef@cedarbank.test")]);
});

describe("health and auth", () => {
  it("reports the database as ok", async () => {
    const res = await getHealth();
    expect(await res.json()).toEqual({ status: "ok", db: "ok" });
  });

  it("refuses an unknown email", async () => {
    const res = await devLogin(json("POST", "/auth/dev-login", { email: "nobody@hq.test" }), undefined);
    expect(res.status).toBe(401);
    expect(res.headers.get("content-type")).toContain("application/problem+json");
  });

  it("refuses requests without a token", async () => {
    const res = await listTickets(get("/tickets"), undefined);
    expect(res.status).toBe(401);
  });

  it("refuses a forged token", async () => {
    const res = await listTickets(get("/tickets", `${lina.slice(0, -4)}AAAA`), undefined);
    expect(res.status).toBe(401);
  });
});

describe("tickets", () => {
  it("lists only the caller's tenant", async () => {
    const res = await listTickets(get("/tickets?pageSize=5", lina), undefined);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.total).toBeGreaterThanOrEqual(1200);
    expect(body.items).toHaveLength(5);
  });

  it("filters by status and searches subjects", async () => {
    const res = await listTickets(get("/tickets?status=new&q=export", lina), undefined);
    const body = await res.json();
    expect(body.items.length).toBeGreaterThan(0);
    for (const t of body.items) {
      expect(t.status).toBe("new");
      expect(t.subject.toLowerCase()).toContain("export");
    }
  });

  it("rejects an unknown status filter with problem details", async () => {
    const res = await listTickets(get("/tickets?status=archived", lina), undefined);
    expect(res.status).toBe(400);
  });

  it("gets a ticket by number with customer and SLA state", async () => {
    const res = await getTicket(get("/tickets/1042", lina), params({ id: "1042" }));
    const t = await res.json();
    expect(t.subject).toBe("Charged twice for invoice INV-2026-0041");
    expect(t.customer.code).toBe("CUS-10442");
    expect(t.sla.firstResponse).toHaveProperty("breached");
    expect(t.messageCount).toBe(6);
  });

  it("does not reveal another tenant's ticket by id", async () => {
    const hqTicket = await (await getTicket(get("/tickets/1042", lina), params({ id: "1042" }))).json();
    const res = await getTicket(get(`/tickets/${hqTicket.id}`, yousef), params({ id: hqTicket.id }));
    expect(res.status).toBe(404);
  });

  it("creates a ticket with SLA due times and its first message", async () => {
    const res = await createTicket(json("POST", "/tickets", {
      subject: "CSV export is empty", body: "Reports > Export gives a blank file since this morning.",
      customerEmail: "new.customer@api-test.test", channel: "web",
    }, lina), undefined);
    expect(res.status).toBe(201);
    const t = await res.json();
    expect(t.number).toBeGreaterThanOrEqual(2209);
    expect(t.status).toBe("new");
    expect(t.customer.code).toMatch(/^CUS-\d+$/);
    expect(new Date(t.sla.firstResponse.dueAt).getTime()).toBeGreaterThan(Date.now());
    expect(t.messageCount).toBe(1);
  });

  it("validates the body", async () => {
    const res = await createTicket(json("POST", "/tickets", { subject: "", channel: "fax" }, lina), undefined);
    expect(res.status).toBe(400);
    const p = await res.json();
    expect(p.errors.map((e: { field: string }) => e.field)).toEqual(expect.arrayContaining(["subject", "channel", "customerEmail"]));
  });

  it("defaults priority to normal and accepts one on create", async () => {
    const plain = await (await createTicket(json("POST", "/tickets", {
      subject: "Question about seats", body: "How many seats do we have?", customerEmail: "seats@api-test.test", channel: "web",
    }, lina), undefined)).json();
    expect(plain.priority).toBe("normal");

    const res = await createTicket(json("POST", "/tickets", {
      subject: "Checkout is down", body: "Nobody can pay.", customerEmail: "outage@api-test.test", channel: "chat", priority: "urgent",
    }, lina), undefined);
    expect(res.status).toBe(201);
    const t = await res.json();
    expect(t.priority).toBe("urgent");
    const id = String(t.number);
    expect((await (await getTicket(get(`/tickets/${id}`, lina), params({ id }))).json()).priority).toBe("urgent");
  });

  it("rejects an unknown priority on create and in the filter", async () => {
    const res = await createTicket(json("POST", "/tickets", {
      subject: "x", body: "y", customerEmail: "bad.priority@api-test.test", channel: "web", priority: "critical",
    }, lina), undefined);
    expect(res.status).toBe(400);
    expect((await res.json()).errors.map((e: { field: string }) => e.field)).toContain("priority");
    expect((await listTickets(get("/tickets?priority=critical", lina), undefined)).status).toBe(400);
  });

  it("changes priority with PATCH and filters by it", async () => {
    const created = await (await createTicket(json("POST", "/tickets", {
      subject: "Priority filter check", body: "Please look at this.", customerEmail: "priority.filter@api-test.test", channel: "email",
    }, lina), undefined)).json();
    const id = String(created.number);

    const res = await patchTicket(json("PATCH", `/tickets/${id}`, { priority: "high" }, lina), params({ id }));
    expect(res.status).toBe(200);
    const patched = await res.json();
    expect(patched.priority).toBe("high");
    expect(patched.status).toBe("new"); // nothing else changes

    const high = await (await listTickets(get("/tickets?priority=high&q=Priority%20filter%20check", lina), undefined)).json();
    expect(high.items.map((t: { number: number }) => t.number)).toContain(created.number);
    for (const t of high.items) expect(t.priority).toBe("high");

    const low = await (await listTickets(get("/tickets?priority=low,normal&q=Priority%20filter%20check", lina), undefined)).json();
    expect(low.items.map((t: { number: number }) => t.number)).not.toContain(created.number);
  });

  it("rejects an unknown priority on PATCH", async () => {
    const res = await patchTicket(json("PATCH", "/tickets/1105", { priority: "asap" }, lina), params({ id: "1105" }));
    expect(res.status).toBe(400);
  });

  it("refuses an invalid status change with 409", async () => {
    const res = await patchTicket(json("PATCH", "/tickets/1105", { status: "closed" }, lina), params({ id: "1105" }));
    expect(res.status).toBe(409);
  });
});

describe("messages and the SLA clock", () => {
  it("records the first response and opens a new ticket when an agent replies", async () => {
    const created = await (await createTicket(json("POST", "/tickets", {
      subject: "Help with macros", body: "How do I create a macro?", customerEmail: "macro.question@api-test.test", channel: "email",
    }, lina), undefined)).json();
    const id = String(created.number);

    const note = await addMessage(json("POST", `/tickets/${id}/messages`, { body: "Checking the docs.", internal: true }, lina), params({ id }));
    expect(note.status).toBe(201);
    let t = await (await getTicket(get(`/tickets/${id}`, lina), params({ id }))).json();
    expect(t.status).toBe("new");                     // an internal note is not a response
    expect(t.sla.firstResponse.respondedAt).toBeNull();

    await addMessage(json("POST", `/tickets/${id}/messages`, { body: "Hi! Settings > Macros > New." }, lina), params({ id }));
    t = await (await getTicket(get(`/tickets/${id}`, lina), params({ id }))).json();
    expect(t.status).toBe("open");
    expect(t.sla.firstResponse.respondedAt).not.toBeNull();

    const thread = await (await listMessages(get(`/tickets/${id}/messages`, lina), params({ id }))).json();
    expect(thread.messages.map((m: { internal: boolean }) => m.internal)).toEqual([false, true, false]);
  });

  it("pauses the resolution clock while pending and reopens on a customer reply", async () => {
    const created = await (await createTicket(json("POST", "/tickets", {
      subject: "Waiting on customer", body: "Something is wrong.", customerEmail: "pending.case@api-test.test", channel: "web",
    }, lina), undefined)).json();
    const id = String(created.number);
    const pending = await (await patchTicket(json("PATCH", `/tickets/${id}`, { status: "pending" }, lina), params({ id }))).json();
    expect(pending.sla.resolution.paused).toBe(true);

    await addMessage(json("POST", `/tickets/${id}/messages`, { body: "Here are the details.", authorType: "customer" }, lina), params({ id }));
    const reopened = await (await getTicket(get(`/tickets/${id}`, lina), params({ id }))).json();
    expect(reopened.status).toBe("open");
    expect(reopened.sla.resolution.paused).toBe(false);
  });
});

describe("customers, knowledge base and reports", () => {
  it("gets a customer by code with recent tickets", async () => {
    const res = await getCustomer(get("/customers/CUS-10442", lina), params({ id: "CUS-10442" }));
    const c = await res.json();
    expect(c.name).toBe("Sara Haddad");
    expect(c.plan).toBe("priority");
    expect(c.recentTickets.map((t: { number: number }) => t.number)).toEqual(expect.arrayContaining([1042, 1500, 1720]));
  });

  it("finds the duplicate-charges article by keyword", async () => {
    const res = await searchKb(get("/kb/articles?q=charged%20twice%20duplicate", lina), undefined);
    const body = await res.json();
    expect(body.items[0].slug).toBe("kb-billing-duplicate-charges");
  });

  it("gets an article by slug", async () => {
    const res = await getArticle(get("/kb/articles/kb-api-rate-limits", lina), params({ id: "kb-api-rate-limits" }));
    expect((await res.json()).body).toContain("600 API requests per minute");
  });

  it("does not show another tenant's articles", async () => {
    const res = await getArticle(get("/kb/articles/kb-cards-lost-card", lina), params({ id: "kb-cards-lost-card" }));
    expect(res.status).toBe(404);
  });

  it("limits the SLA report to leads and admins", async () => {
    expect((await slaReport(get("/reports/sla", lina), undefined)).status).toBe(403);
    const res = await slaReport(get("/reports/sla?days=90", omar), undefined);
    const report = await res.json();
    expect(res.status).toBe(200);
    expect(report.teams.map((t: { team: string }) => t.team)).toEqual(expect.arrayContaining(["Billing", "Technical"]));
  });
});
