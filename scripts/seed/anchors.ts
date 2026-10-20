// Hand-written "anchor" customers and tickets. Exercises and evals in the course refer to
// these by number (1042, 1105, 1188, 1311, 2207 …). Keep numbers and facts stable:
// changing them breaks data/evals/*.json and data/labels/*.json.
import type { Plan, TenantSeed } from "./tenants";

type Slug = TenantSeed["slug"];

export interface AnchorCustomer {
  tenant: Slug; code: string; legacy?: number; name: string; email: string; language: "en" | "ar"; plan: Plan;
}
export interface AnchorMessage {
  from: "customer" | "agent" | "system"; agent?: string; internal?: boolean; body: string; minutesAfter: number;
}
export interface AnchorTicket {
  tenant: Slug; number: number; subject: string; product: string | null; channel: "email" | "web" | "chat";
  language: "en" | "ar"; customer: string; status: "new" | "open" | "pending" | "solved" | "closed";
  team?: string; assignee?: string; createdHoursAgo: number; solvedHoursAgo?: number; messages: AnchorMessage[];
}

const c = (tenant: Slug, code: string, name: string, email: string, plan: Plan = "standard", language: "en" | "ar" = "en", legacy?: number): AnchorCustomer =>
  ({ tenant, code, name, email, plan, language, ...(legacy ? { legacy } : {}) });

export const ANCHOR_CUSTOMERS: AnchorCustomer[] = [
  c("hq", "CUS-10442", "Sara Haddad", "sara.haddad@brightlane.test", "priority", "en", 10442),
  c("hq", "CUS-10518", "Karim Nassar", "karim.nassar@cedarwood.test"),
  c("hq", "CUS-10460", "Rania Khoury", "rania@khoury-design.test", "standard", "ar"),
  c("hq", "CUS-10471", "Tony Saliba", "tony@saliba-logistics.test", "enterprise"),
  c("hq", "CUS-10480", "Lea Mansour", "lea@mansour-media.test", "priority"),
  c("hq", "CUS-10481", "Hadi Farah", "hadi@farah-travel.test"),
  c("hq", "CUS-10482", "Joelle Azar", "joelle@azar-retail.test", "priority"),
  c("hq", "CUS-10483", "Fadi Rizk", "fadi@rizk-group.test", "enterprise"),
  c("hq", "CUS-10484", "Carla Bitar", "carla@bitar-studio.test"),
  c("hq", "CUS-10501", "Maha Najjar", "maha@najjar-foods.test"),
  c("hq", "CUS-10502", "Marc Tannous", "marc@tannous-legal.test"),
  c("hq", "CUS-10503", "Zeina Karam", "zeina@karam-events.test"),
  c("hq", "CUS-10504", "Walid Aziz", "walid@aziz-motors.test", "priority"),
  c("hq", "CUS-10505", "Mira Sleiman", "mira.sleiman@northpeak.test"),
  c("hq", "CUS-10506", "Elie Chami", "elie@chami-tech.test", "enterprise"),
  c("hq", "CUS-10507", "Samir Hariri", "samir@hariri-shop.test", "priority"),
  c("hq", "CUS-10508", "Yara Sabbagh", "yara@sabbagh-care.test"),
  c("hq", "CUS-10509", "Dana Matar", "dana@matar-labs.test", "priority"),
  c("hq", "CUS-10510", "Bilal Jaber", "bilal@jaber-builders.test"),
  c("hq", "CUS-10511", "George Fayad", "george@fayad-erp.test", "enterprise"),
  c("hq", "CUS-10512", "Ibrahim Qasim", "ibrahim@qasim-trading.test"),
  c("hq", "CUS-10513", "Lama Zahran", "lama@zahran-architects.test"),
  c("hq", "CUS-10514", "Youssef Bitar", "youssef@bitar-finance.test", "enterprise"),
  c("hq", "CUS-10515", "Reem Hamdan", "reem@hamdan-boutique.test"),
  c("hq", "CUS-10516", "Nour Al Hashimi", "nour@alhashimi-health.test", "enterprise"),
  c("hq", "CUS-10517", "Salma Menon", "salma@menon-learning.test"),
  c("hq", "CUS-10519", "Arjun Nair", "arjun@nair-imports.test"),
  c("hq", "CUS-10520", "Aya Rashid", "aya@rashid-clinic.test", "priority"),
  c("hq", "CUS-10521", "Khaled Al Suwaidi", "khaled@alsuwaidi-group.test", "priority"),
  c("cedar-bank", "CUS-20101", "Hassan Mansour", "hassan.mansour@mail.test"),
  c("cedar-bank", "CUS-20102", "Noura Al Hashimi", "noura.hashimi@mail.test", "standard", "ar"),
  c("cedar-bank", "CUS-20103", "Priya Menon", "priya.menon@mail.test", "priority"),
  c("cedar-bank", "CUS-20104", "Mohammed Al Suwaidi", "m.alsuwaidi@mail.test", "standard", "ar"),
  c("cedar-bank", "CUS-20105", "Rashid Qasim", "rashid.qasim@mail.test", "enterprise"),
  c("cedar-bank", "CUS-20106", "Tamer Fayad", "tamer.fayad@mail.test"),
  c("cedar-bank", "CUS-20107", "Huda Saliba", "huda.saliba@mail.test"),
  c("cedar-bank", "CUS-20108", "Ali Chami", "ali.chami@mail.test"),
  c("cedar-bank", "CUS-20109", "Lea Rizk", "lea.rizk@mail.test", "priority"),
  c("souk-market", "CUS-30101", "Fatima Zahran", "fatima.zahran@mail.test"),
  c("souk-market", "CUS-30102", "Marc Bitar", "marc.bitar@mail.test"),
  c("souk-market", "CUS-30103", "Dana Najjar", "dana.najjar@mail.test", "priority"),
  c("souk-market", "CUS-30104", "Reem Jaber", "reem.jaber@mail.test", "standard", "ar"),
  c("souk-market", "CUS-30105", "Samir Karam", "samir@karam-home.test", "enterprise"),
  c("souk-market", "CUS-30106", "Joelle Tannous", "joelle@tannous-crafts.test"),
  c("souk-market", "CUS-30107", "Omar Hamdan", "omar.hamdan@mail.test"),
];

const msg = (from: AnchorMessage["from"], minutesAfter: number, body: string, extra: Partial<AnchorMessage> = {}): AnchorMessage =>
  ({ from, minutesAfter, body, ...extra });

const LONG_API_MESSAGE = `Hello,

We run a logistics platform that syncs delivery exceptions into Helpdesk HQ through your API, and since Monday we are seeing a pattern of failures that I'd like help with.

Our integration does three things. Every 2 minutes it polls GET /tickets for tickets updated in the last 5 minutes. For every delivery exception from our warehouse system it creates a ticket with POST /tickets. And it listens for ticket.updated webhooks so that when an agent solves a ticket we can close the exception on our side.

What we see:

1. Between 08:00 and 10:00 our time, when our warehouses open, roughly 1 in 6 POST /tickets calls fails with HTTP 429. We retry immediately, up to 3 times, and some still fail. We create about 900 tickets in that window, plus the polling.

2. On the same mornings our webhook endpoint stops receiving ticket.updated events for a while. Later in the day they start again. We are not sure if we lose events or if they are just late. Our endpoint is behind a load balancer and sometimes takes 12 to 15 seconds to respond during that peak, because it writes to our database before replying.

3. Yesterday the webhook was disabled completely and two of our admins got an email about it. We re-enabled it but would like to understand why.

What we have already checked: our API key is valid and has full permissions, our clock is in sync, and the 429 responses include a Retry-After header, which we currently ignore.

Questions:
- What is the actual rate limit per account, and do bulk endpoints count differently?
- How many times do you retry a webhook, and over what period?
- Is there a timeout on your side for our webhook endpoint?
- Is there anything we can change in our setup to stop the webhook being disabled?

This is affecting our operations every morning, so a quick answer would be much appreciated.

Best regards,
Tony Saliba
Head of Engineering, Saliba Logistics`;

export const ANCHOR_TICKETS: AnchorTicket[] = [
  // ------------------------------------------------ named in Chapters 1–3
  {
    tenant: "hq", number: 1042, subject: "Charged twice for invoice INV-2026-0041", product: "Billing Portal",
    channel: "email", language: "en", customer: "CUS-10442", status: "open", team: "Billing", assignee: "lina@hq.test",
    createdHoursAgo: 30,
    messages: [
      msg("customer", 0, "Hi, my invoice INV-2026-0041 was charged twice on my Visa this morning, two payments of USD 348 a few minutes apart. Please refund one."),
      msg("agent", 95, "Hi Sara, thanks for flagging this, and sorry for the trouble. Could you confirm the last four digits of the card and the time of both charges? Please don't send the full card number.", { agent: "lina@hq.test" }),
      msg("agent", 101, "Customer is on the refund watchlist after two chargebacks last year. Check with finance before promising anything beyond the standard policy.", { agent: "lina@hq.test", internal: true }),
      msg("customer", 240, "The card ends in 4417. Both charges were at 08:12 and 08:14 Beirut time, same amount."),
      msg("system", 250, "Payment provider reference PSP-88213 attached to this ticket."),
      msg("customer", 1500, "Any update? I still see both charges on my statement and our accountant is asking."),
    ],
  },
  {
    tenant: "hq", number: 1105, subject: "CSV export downloads an empty file", product: "Reports",
    channel: "web", language: "en", customer: "CUS-10480", status: "new", createdHoursAgo: 5,
    messages: [
      msg("customer", 0, "When I export the ticket volume report as CSV, the file downloads but it's empty, only the header row. It worked fine last week."),
      msg("customer", 25, "Same thing happens with PDF export now. Two people on my team see it too."),
    ],
  },
  {
    tenant: "hq", number: 1188, subject: "Can't log in after password reset", product: "Inbox",
    channel: "email", language: "en", customer: "CUS-10518", status: "open", team: "Accounts", assignee: "maya@hq.test",
    createdHoursAgo: 52,
    messages: [
      msg("customer", 0, "I requested a password reset three times and never got the email. I can't log in at all. This looks like a bug in your login system."),
      msg("agent", 40, "Hi Karim, sorry about that. Could you tell me the exact email address you entered on the reset page?", { agent: "maya@hq.test" }),
      msg("customer", 70, "karim.nasar@cedarwood.test, same as always."),
      msg("agent", 72, "Account email is karim.nassar@cedarwood.test (double s). The reset requests went to an address that does not exist. Do not share other accounts' details.", { agent: "maya@hq.test", internal: true }),
      msg("agent", 80, "Thanks Karim. Could you check the spelling of your email address on the reset page? Reset links only go to the exact address on the account.", { agent: "maya@hq.test" }),
      msg("customer", 300, "I'm sure it's right. I've used this email for years. Can you just reset it for me?"),
      msg("agent", 320, "I understand. For security we can only send the link to the address on the account. An admin on your account can also send a reset from Settings > Users.", { agent: "maya@hq.test" }),
      msg("customer", 600, "Our admin is on holiday. This is really frustrating, I have tickets waiting."),
      msg("agent", 615, "I'm sorry for the delay. Please try the reset once more and type the address slowly, letter by letter. The link is valid for 30 minutes.", { agent: "maya@hq.test" }),
      msg("customer", 1400, "Tried again this morning. Still nothing in my inbox or spam."),
      msg("system", 1405, "Password reset requested for unknown address karim.nasar@cedarwood.test. No email sent."),
      msg("customer", 1460, "Is anyone looking at this? It must be broken on your side."),
    ],
  },
  {
    tenant: "hq", number: 1311, subject: "API 429 errors and webhooks disabled every morning", product: "API",
    channel: "email", language: "en", customer: "CUS-10471", status: "new", createdHoursAgo: 8,
    messages: [msg("customer", 0, LONG_API_MESSAGE)],
  },
  {
    tenant: "hq", number: 2207, subject: "لا تصلني الإشعارات على تطبيق الهاتف", product: "Mobile App",
    channel: "chat", language: "ar", customer: "CUS-10460", status: "open", team: "Technical", assignee: "rami@hq.test",
    createdHoursAgo: 26,
    messages: [
      msg("customer", 0, "مرحباً، منذ يومين لا تصلني أي إشعارات من تطبيق Helpdesk HQ على هاتفي عندما تصل تذكرة جديدة. هاتفي سامسونج."),
      msg("agent", 30, "مرحباً رانيا، شكراً لتواصلك. هل الإشعارات مفعّلة داخل التطبيق من الإعدادات؟", { agent: "rami@hq.test" }),
      msg("customer", 55, "نعم مفعّلة داخل التطبيق، وجربت إعادة تشغيل الهاتف."),
      msg("customer", 1300, "ما زالت المشكلة موجودة اليوم. ماذا يمكنني أن أفعل؟"),
    ],
  },
  // Sara Haddad's earlier billing tickets (Exercise 3.2, goal 2)
  {
    tenant: "hq", number: 1500, subject: "VAT number missing on invoice INV-2026-0012", product: "Billing Portal",
    channel: "email", language: "en", customer: "CUS-10442", status: "closed", team: "Billing", assignee: "lina@hq.test",
    createdHoursAgo: 1440, solvedHoursAgo: 1420,
    messages: [
      msg("customer", 0, "Our VAT number is missing from invoice INV-2026-0012. Our accountant needs it."),
      msg("agent", 60, "Hi Sara, I've added the VAT number to your billing details and reissued the invoice. You'll find it in Billing Portal > Invoices.", { agent: "lina@hq.test" }),
      msg("customer", 90, "Perfect, thank you."),
    ],
  },
  {
    tenant: "hq", number: 1720, subject: "Card update failed in Billing Portal", product: "Billing Portal",
    channel: "web", language: "en", customer: "CUS-10442", status: "closed", team: "Billing", assignee: "maya@hq.test",
    createdHoursAgo: 960, solvedHoursAgo: 930,
    messages: [
      msg("customer", 0, "I tried to update our company card in the Billing Portal and got an error saying the card could not be verified."),
      msg("agent", 45, "Hi Sara, our payment provider had a short outage this morning. It's resolved now; could you try again?", { agent: "maya@hq.test" }),
      msg("customer", 120, "Worked this time, thanks."),
    ],
  },
  // The outage cluster around 1105 (Chapter 3: find_related_tickets)
  { tenant: "hq", number: 2196, subject: "Exported report is blank", product: "Reports", channel: "web", language: "en", customer: "CUS-10481", status: "new", createdHoursAgo: 4,
    messages: [msg("customer", 0, "Every report I export comes out blank. CSV and PDF both. Is something down?")] },
  { tenant: "hq", number: 2198, subject: "Reports export not working", product: "Reports", channel: "email", language: "en", customer: "CUS-10482", status: "new", createdHoursAgo: 3,
    messages: [msg("customer", 0, "Hi, our monthly export to CSV only has column headers, no data. We need it for a board meeting today.")] },
  { tenant: "hq", number: 2201, subject: "Empty CSV from Reports", product: "Reports", channel: "chat", language: "en", customer: "CUS-10483", status: "new", createdHoursAgo: 2,
    messages: [msg("customer", 0, "CSV export from Reports is empty for all our dashboards since this morning.")] },
  { tenant: "hq", number: 2203, subject: "PDF report has no data", product: "Reports", channel: "web", language: "en", customer: "CUS-10484", status: "new", createdHoursAgo: 1,
    messages: [msg("customer", 0, "Downloaded the SLA report as PDF and it has no rows. The dashboard on screen looks fine.")] },

  // ------------------------------------------------ eval anchors: Helpdesk HQ (new tickets)
  { tenant: "hq", number: 2150, subject: "How do I export a report to Excel?", product: "Reports", channel: "web", language: "en", customer: "CUS-10501", status: "new", createdHoursAgo: 30,
    messages: [msg("customer", 0, "Hi, I need to get our monthly ticket volume report into Excel for my manager. How do I export it? It has about 80,000 rows.")] },
  { tenant: "hq", number: 2151, subject: "Refund for annual plan bought by mistake", product: "Billing Portal", channel: "email", language: "en", customer: "CUS-10502", status: "new", createdHoursAgo: 19,
    messages: [msg("customer", 0, "We bought the annual plan 5 days ago but we meant to choose monthly. Can we get a refund for the annual plan?")] },
  { tenant: "hq", number: 2152, subject: "Want a refund on our annual subscription", product: "Billing Portal", channel: "email", language: "en", customer: "CUS-10503", status: "new", createdHoursAgo: 18,
    messages: [msg("customer", 0, "We renewed our annual plan two months ago but we're moving to a different tool. Please refund the remaining months.")] },
  { tenant: "hq", number: 2153, subject: "Charged when upgrading mid-month?", product: "Billing Portal", channel: "web", language: "en", customer: "CUS-10504", status: "new", createdHoursAgo: 17,
    messages: [msg("customer", 0, "If we upgrade from Standard to Enterprise today, halfway through our billing month, what will we be charged and when do we get the new features?")] },
  { tenant: "hq", number: 2154, subject: "Password reset email never arrives", product: "Inbox", channel: "email", language: "en", customer: "CUS-10505", status: "new", createdHoursAgo: 16,
    messages: [msg("customer", 0, "I clicked Forgot password twice and no email has come. I need to get into my account today.")] },
  { tenant: "hq", number: 2155, subject: "API keeps returning 429 Too Many Requests", product: "API", channel: "email", language: "en", customer: "CUS-10506", status: "new", createdHoursAgo: 15,
    messages: [msg("customer", 0, "Our nightly sync job gets HTTP 429 responses after a few minutes. What are your limits and how should we handle this?")] },
  { tenant: "hq", number: 2156, subject: "Webhooks stopped arriving", product: "API", channel: "email", language: "en", customer: "CUS-10507", status: "new", createdHoursAgo: 14,
    messages: [msg("customer", 0, "We stopped receiving ticket.updated webhooks yesterday afternoon. Our server was down for maintenance for about an hour. Did you stop sending?")] },
  { tenant: "hq", number: 2157, subject: "Please add dark mode to the Inbox", product: "Inbox", channel: "web", language: "en", customer: "CUS-10508", status: "new", createdHoursAgo: 13,
    messages: [msg("customer", 0, "Our night shift would love a dark mode in the Inbox. When will you add it?")] },
  { tenant: "hq", number: 2158, subject: "How do I add two new agents?", product: "Inbox", channel: "web", language: "en", customer: "CUS-10509", status: "new", createdHoursAgo: 12,
    messages: [msg("customer", 0, "We hired two new support agents. How do I give them access? I'm the admin on our account.")] },
  { tenant: "hq", number: 2159, subject: "Lost my phone, locked out by two-factor", product: "Inbox", channel: "email", language: "en", customer: "CUS-10510", status: "new", createdHoursAgo: 11,
    messages: [msg("customer", 0, "I lost my phone and now I can't get the two-factor code to sign in. I didn't save the backup codes. Can you turn it off for me?")] },
  { tenant: "hq", number: 2160, subject: "Integration with Odoo?", product: null, channel: "email", language: "en", customer: "CUS-10511", status: "new", createdHoursAgo: 10,
    messages: [msg("customer", 0, "Does Helpdesk HQ have a native integration with Odoo ERP so tickets can link to customer orders?")] },
  { tenant: "hq", number: 2161, subject: "Formal complaint about data handling", product: null, channel: "email", language: "en", customer: "CUS-10512", status: "new", createdHoursAgo: 9,
    messages: [msg("customer", 0, "You sent our customer list to the wrong company in an export email. I have informed my lawyer and I am reporting this to the data protection authority unless I hear from a manager today.")] },
  { tenant: "hq", number: 2162, subject: "Company name wrong on invoices", product: "Billing Portal", channel: "web", language: "en", customer: "CUS-10513", status: "new", createdHoursAgo: 8,
    messages: [msg("customer", 0, "Our invoices show our old company name and no VAT number. How can we fix this for future invoices, and can last month's be corrected?")] },
  { tenant: "hq", number: 2163, subject: "Someone signed in to our account from abroad", product: "Inbox", channel: "email", language: "en", customer: "CUS-10514", status: "new", createdHoursAgo: 7,
    messages: [msg("customer", 0, "Our audit log shows sign-ins to my admin account from a country we've never been to, at 3 am. I think our account has been compromised.")] },
  { tenant: "hq", number: 2164, subject: "I have filed a chargeback", product: "Billing Portal", channel: "email", language: "en", customer: "CUS-10515", status: "new", createdHoursAgo: 6,
    messages: [msg("customer", 0, "Nobody answered my billing question for a week so I have filed a chargeback with my bank for last month's payment.")] },
  { tenant: "hq", number: 2165, subject: "SSO error: Invalid audience", product: "Inbox", channel: "email", language: "en", customer: "CUS-10516", status: "new", createdHoursAgo: 5,
    messages: [msg("customer", 0, "We're setting up SAML SSO with Azure AD and get 'Invalid audience' when testing. What are we missing?")] },
  { tenant: "hq", number: 2166, subject: "Suggestion: bulk edit tags", product: "Inbox", channel: "web", language: "en", customer: "CUS-10517", status: "new", createdHoursAgo: 4,
    messages: [msg("customer", 0, "It would save us hours if we could add or remove a tag on many tickets at once.")] },
  { tenant: "hq", number: 2167, subject: "Card declined paying our invoice", product: "Billing Portal", channel: "web", language: "en", customer: "CUS-10519", status: "new", createdHoursAgo: 3,
    messages: [msg("customer", 0, "Our card was declined when paying this month's invoice. The card is new and works everywhere else.")] },
  { tenant: "hq", number: 2168, subject: "New emails not appearing in Inbox", product: "Inbox", channel: "email", language: "en", customer: "CUS-10520", status: "new", createdHoursAgo: 2,
    messages: [msg("customer", 0, "Since we changed email providers yesterday, no new emails are showing up as tickets.")] },
  { tenant: "hq", number: 2169, subject: "Remove a former employee", product: "Inbox", channel: "web", language: "en", customer: "CUS-10521", status: "new", createdHoursAgo: 1,
    messages: [msg("customer", 0, "One of our agents left last week. How do I remove her access and stop paying for her seat?")] },

  // ------------------------------------------------ eval anchors: Cedar Bank
  { tenant: "cedar-bank", number: 1601, subject: "Lost my debit card", product: "Cards", channel: "chat", language: "en", customer: "CUS-20101", status: "new", createdHoursAgo: 6,
    messages: [msg("customer", 0, "I think I lost my debit card at the mall an hour ago. What should I do?")] },
  { tenant: "cedar-bank", number: 1602, subject: "لا يصلني رمز التحقق", product: "Mobile Banking", channel: "chat", language: "ar", customer: "CUS-20102", status: "new", createdHoursAgo: 5,
    messages: [msg("customer", 0, "أحاول تسجيل الدخول إلى التطبيق لكن رمز التحقق لا يصل إلى هاتفي. غيرت رقم هاتفي الشهر الماضي.")] },
  { tenant: "cedar-bank", number: 1603, subject: "Dispute a hotel charge", product: "Cards", channel: "email", language: "en", customer: "CUS-20103", status: "new", createdHoursAgo: 5,
    messages: [msg("customer", 0, "A hotel in Muscat charged my credit card AED 1,250 for a booking I cancelled within the free cancellation period. How do I dispute this?")] },
  { tenant: "cedar-bank", number: 1604, subject: "سُرقت بطاقتي", product: "Cards", channel: "chat", language: "ar", customer: "CUS-20104", status: "new", createdHoursAgo: 4,
    messages: [msg("customer", 0, "سُرقت محفظتي وفيها بطاقة الخصم. ماذا أفعل الآن؟")] },
  { tenant: "cedar-bank", number: 1605, subject: "Money taken from my account, going to the Central Bank", product: "Transfers", channel: "email", language: "en", customer: "CUS-20105", status: "new", createdHoursAgo: 3,
    messages: [msg("customer", 0, "AED 40,000 left my account in two transfers I did not make. Your phone line kept me waiting for an hour. I am filing a complaint with the Central Bank today.")] },
  { tenant: "cedar-bank", number: 1606, subject: "How long does a transfer to India take?", product: "Transfers", channel: "web", language: "en", customer: "CUS-20106", status: "new", createdHoursAgo: 3,
    messages: [msg("customer", 0, "I sent money to my family in India this afternoon at 4 pm. When will it arrive?")] },
  { tenant: "cedar-bank", number: 1607, subject: "Payment I don't recognise", product: "Cards", channel: "chat", language: "en", customer: "CUS-20107", status: "new", createdHoursAgo: 2,
    messages: [msg("customer", 0, "There's a payment of AED 312 to an online store I've never heard of on my card this morning.")] },
  { tenant: "cedar-bank", number: 1608, subject: "App closes when I sign in", product: "Mobile Banking", channel: "web", language: "en", customer: "CUS-20108", status: "new", createdHoursAgo: 2,
    messages: [msg("customer", 0, "Since yesterday the Cedar Bank app closes right after I enter my password. iPhone 13.")] },
  { tenant: "cedar-bank", number: 1609, subject: "Card declined in London", product: "Cards", channel: "chat", language: "en", customer: "CUS-20109", status: "new", createdHoursAgo: 1,
    messages: [msg("customer", 0, "I'm travelling in London and my card is declined in every shop. It works online.")] },

  // ------------------------------------------------ eval anchors: Souk Market
  { tenant: "souk-market", number: 1401, subject: "Where is my order SM-58213?", product: "Orders", channel: "chat", language: "en", customer: "CUS-30101", status: "new", createdHoursAgo: 6,
    messages: [msg("customer", 0, "I ordered a blender three days ago, order SM-58213. Where can I see where it is?")] },
  { tenant: "souk-market", number: 1402, subject: "Can I return a jacket?", product: "Returns", channel: "web", language: "en", customer: "CUS-30102", status: "new", createdHoursAgo: 5,
    messages: [msg("customer", 0, "I received a jacket 6 days ago and it doesn't fit. I haven't worn it. Can I return it and how long does the refund take?")] },
  { tenant: "souk-market", number: 1403, subject: "Need delivery by tomorrow", product: "Delivery", channel: "chat", language: "en", customer: "CUS-30103", status: "new", createdHoursAgo: 4,
    messages: [msg("customer", 0, "If I order a gift now, at 11 am, can it arrive in Dubai tomorrow? What are my options?")] },
  { tenant: "souk-market", number: 1404, subject: "أريد إرجاع حذاء", product: "Returns", channel: "chat", language: "ar", customer: "CUS-30104", status: "new", createdHoursAgo: 3,
    messages: [msg("customer", 0, "استلمت حذاء قبل أسبوع والمقاس صغير، لم أستخدمه. هل يمكنني إرجاعه؟ ومتى يعود المبلغ؟")] },
  { tenant: "souk-market", number: 1405, subject: "Payout missing this Thursday", product: "Seller Center", channel: "email", language: "en", customer: "CUS-30105", status: "new", createdHoursAgo: 3,
    messages: [msg("customer", 0, "I'm a seller and I didn't get my payout this Thursday. I updated my bank account on Monday.")] },
  { tenant: "souk-market", number: 1406, subject: "How do I list my products?", product: "Seller Center", channel: "web", language: "en", customer: "CUS-30106", status: "new", createdHoursAgo: 2,
    messages: [msg("customer", 0, "I just opened a seller account to sell handmade candles. How do I add my first product?")] },
  { tenant: "souk-market", number: 1407, subject: "Consumer protection complaint", product: "Orders", channel: "email", language: "en", customer: "CUS-30107", status: "new", createdHoursAgo: 1,
    messages: [msg("customer", 0, "You sold me a counterfeit phone. I have photos and a report from an authorised dealer. I am submitting a complaint to the Department of Economy and Tourism and will involve a lawyer.")] },
];
