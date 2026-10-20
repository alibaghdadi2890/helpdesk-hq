// The three seeded companies: their calendars, people, teams, products and SLA policies.

export type Plan = "standard" | "priority" | "enterprise";
export type Role = "agent" | "lead" | "admin";

export interface TenantSeed {
  slug: "hq" | "cedar-bank" | "souk-market";
  name: string;
  utcOffsetMinutes: number;
  workdays: number[];
  workStartHour: number;
  workEndHour: number;
  firstTicketNumber: number;
  ticketCount: number;
  customerCount: number;
  articleCount: number;
  arabicShare: number;
  users: { email: string; name: string; role: Role; teams: string[] }[];
  teams: { name: string; description: string }[];
  products: string[];
  sla: Record<Plan, { name: string; firstResponseMins: number; resolutionMins: number }>;
}

export const TENANTS: TenantSeed[] = [
  {
    slug: "hq",
    name: "Helpdesk HQ",
    utcOffsetMinutes: 180,            // UTC+3, fixed
    workdays: [1, 2, 3, 4, 5],        // Monday to Friday
    workStartHour: 9,
    workEndHour: 17,
    firstTicketNumber: 1009,
    ticketCount: 1200,
    customerCount: 300,
    articleCount: 150,
    arabicShare: 0.1,
    users: [
      { email: "lina@hq.test", name: "Lina Saab", role: "agent", teams: ["Billing"] },
      { email: "omar@hq.test", name: "Omar Fares", role: "lead", teams: ["Escalations", "Billing", "Technical"] },
      { email: "admin@hq.test", name: "Nadia Rahme", role: "admin", teams: [] },
      { email: "jad@hq.test", name: "Jad Khalil", role: "agent", teams: ["Technical"] },
      { email: "tarek@hq.test", name: "Tarek Aoun", role: "agent", teams: ["Technical", "Product Feedback"] },
      { email: "maya@hq.test", name: "Maya Ghanem", role: "agent", teams: ["Billing", "Accounts"] },
      { email: "rami@hq.test", name: "Rami Issa", role: "agent", teams: ["Accounts", "Technical"] },
    ],
    teams: [
      { name: "Billing", description: "Invoices, charges, refunds, plan changes and payment methods." },
      { name: "Technical", description: "Bugs, outages, the API and integrations, and how-to questions about product features." },
      { name: "Accounts", description: "Sign-in, passwords, two-factor authentication, SSO, users and permissions." },
      { name: "Product Feedback", description: "Feature requests and suggestions for the product team." },
      { name: "Escalations", description: "Legal threats, regulators, security incidents, chargebacks and complaints a lead must handle." },
    ],
    products: ["Inbox", "Knowledge Base", "Reports", "Billing Portal", "API", "Mobile App"],
    sla: {
      standard: { name: "Standard", firstResponseMins: 480, resolutionMins: 2400 },
      priority: { name: "Priority", firstResponseMins: 120, resolutionMins: 960 },
      enterprise: { name: "Enterprise", firstResponseMins: 60, resolutionMins: 480 },
    },
  },
  {
    slug: "cedar-bank",
    name: "Cedar Bank",
    utcOffsetMinutes: 240,            // UTC+4
    workdays: [1, 2, 3, 4, 5],
    workStartHour: 8,
    workEndHour: 16,
    firstTicketNumber: 1001,
    ticketCount: 700,
    customerCount: 180,
    articleCount: 90,
    arabicShare: 0.3,
    users: [
      { email: "fatima@cedarbank.test", name: "Fatima Al Mansoori", role: "lead", teams: ["Escalations", "Fraud and Disputes"] },
      { email: "admin@cedarbank.test", name: "Sami Hamdan", role: "admin", teams: [] },
      { email: "yousef@cedarbank.test", name: "Yousef Darwish", role: "agent", teams: ["Cards"] },
      { email: "layla@cedarbank.test", name: "Layla Hassan", role: "agent", teams: ["Digital Banking"] },
      { email: "ahmed@cedarbank.test", name: "Ahmed Saleh", role: "agent", teams: ["Fraud and Disputes", "Cards"] },
      { email: "noor@cedarbank.test", name: "Noor Kassem", role: "agent", teams: ["Digital Banking", "Cards"] },
    ],
    teams: [
      { name: "Cards", description: "Debit and credit cards: lost or stolen cards, declines, limits and replacements." },
      { name: "Digital Banking", description: "The mobile and online banking apps, one-time codes, transfers and payments." },
      { name: "Fraud and Disputes", description: "Transactions the customer does not recognise, disputes and suspected fraud." },
      { name: "Escalations", description: "Legal threats, regulators, chargebacks and complaints a lead must handle." },
    ],
    products: ["Cards", "Mobile Banking", "Transfers", "Loans"],
    sla: {
      standard: { name: "Standard", firstResponseMins: 240, resolutionMins: 1440 },
      priority: { name: "Priority", firstResponseMins: 60, resolutionMins: 480 },
      enterprise: { name: "Private Banking", firstResponseMins: 30, resolutionMins: 240 },
    },
  },
  {
    slug: "souk-market",
    name: "Souk Market",
    utcOffsetMinutes: 180,            // UTC+3
    workdays: [7, 1, 2, 3, 4],        // Sunday to Thursday
    workStartHour: 9,
    workEndHour: 18,
    firstTicketNumber: 1001,
    ticketCount: 500,
    customerCount: 120,
    articleCount: 60,
    arabicShare: 0.25,
    users: [
      { email: "khalid@soukmarket.test", name: "Khalid Rahman", role: "lead", teams: ["Escalations", "Orders and Delivery"] },
      { email: "admin@soukmarket.test", name: "Hiba Nasser", role: "admin", teams: [] },
      { email: "aisha@soukmarket.test", name: "Aisha Qureshi", role: "agent", teams: ["Orders and Delivery"] },
      { email: "ziad@soukmarket.test", name: "Ziad Mourad", role: "agent", teams: ["Returns", "Orders and Delivery"] },
      { email: "dina@soukmarket.test", name: "Dina Fakhoury", role: "agent", teams: ["Seller Support", "Returns"] },
    ],
    teams: [
      { name: "Orders and Delivery", description: "Order status, tracking, delivery times and cancellations." },
      { name: "Returns", description: "Returns, refunds for returned items and exchanges." },
      { name: "Seller Support", description: "Sellers on the marketplace: listings, payouts and seller accounts." },
      { name: "Escalations", description: "Legal threats, consumer-protection complaints, chargebacks and complaints a lead must handle." },
    ],
    products: ["Orders", "Delivery", "Returns", "Seller Center"],
    sla: {
      standard: { name: "Standard", firstResponseMins: 480, resolutionMins: 2880 },
      priority: { name: "Plus", firstResponseMins: 240, resolutionMins: 1440 },
      enterprise: { name: "Business", firstResponseMins: 120, resolutionMins: 960 },
    },
  },
];
