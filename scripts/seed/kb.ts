// Knowledge-base articles. Core articles are hand-written: exercises and evals check
// facts in them (refund windows, rate limits, delivery times). The rest are generated
// from topics so each tenant has a realistic number of articles.
import { Rng } from "./random";
import type { TenantSeed } from "./tenants";

export interface ArticleSeed {
  tenant: TenantSeed["slug"];
  slug: string;
  product: string | null;
  title: string;
  body: string;
  language: "en" | "ar";
}

export const CORE_ARTICLES: ArticleSeed[] = [
  // ---------------- Helpdesk HQ
  {
    tenant: "hq", slug: "kb-billing-duplicate-charges", product: "Billing Portal", language: "en",
    title: "Duplicate charges on an invoice",
    body: "If your card was charged twice for the same invoice, the duplicate charge is refunded automatically. You do not need to do anything. Refunds take 5 to 10 business days to appear on your statement, depending on your bank. If the duplicate has not been refunded after 10 business days, reply to your ticket with the invoice number and the date of both charges, and the Billing team will trace it with our payment provider. Never send your full card number; the last four digits are enough.",
  },
  {
    tenant: "hq", slug: "kb-billing-refund-policy", product: "Billing Portal", language: "en",
    title: "Refund policy for monthly and annual plans",
    body: "Annual plans can be refunded in full within 14 days of purchase. After 14 days, annual plans are not refundable, but you can turn off automatic renewal at any time in Billing Portal > Subscription, and your plan stays active until the end of the paid period. Monthly plans are not refunded for partial months; cancelling stops the next charge. Refunds go back to the original payment method within 5 to 10 business days.",
  },
  {
    tenant: "hq", slug: "kb-billing-change-plan", product: "Billing Portal", language: "en",
    title: "Upgrading or downgrading your plan",
    body: "Upgrades take effect immediately. You are charged a prorated amount for the rest of the current billing period, shown on the confirmation screen before you pay. Downgrades take effect at the start of your next billing period, so you keep your current features until then. Change your plan in Billing Portal > Subscription > Change plan. Only account admins can change plans.",
  },
  {
    tenant: "hq", slug: "kb-billing-invoices", product: "Billing Portal", language: "en",
    title: "Downloading invoices and adding a VAT number",
    body: "Invoices are in Billing Portal > Invoices, available as PDF. To show your company name, address or VAT number on future invoices, go to Billing Portal > Billing details and update them before your next invoice is issued. Invoices that were already issued cannot be edited, but the Billing team can reissue the latest invoice with corrected company details on request.",
  },
  {
    tenant: "hq", slug: "kb-billing-payment-methods", product: "Billing Portal", language: "en",
    title: "Payment methods and declined cards",
    body: "We accept Visa, Mastercard and American Express. Enterprise plans can also pay by bank transfer. To update your card, open Billing Portal > Payment methods. If a payment is declined, check that the card has not expired and that your bank allows international online payments; we retry a failed payment automatically after 3 days.",
  },
  {
    tenant: "hq", slug: "kb-reports-export-csv", product: "Reports", language: "en",
    title: "Exporting a report as CSV",
    body: "Open Reports, choose the report, and select Export > CSV. Exports up to 50,000 rows download immediately. Larger exports are prepared in the background and emailed to you as a link, usually within 15 minutes. CSV files use UTF-8 encoding; if Arabic text looks garbled in a spreadsheet, import the file and choose UTF-8.",
  },
  {
    tenant: "hq", slug: "kb-status-incidents", product: null, language: "en",
    title: "Service status and incidents",
    body: "Current incidents are posted on our status page at status.helpdeskhq.test. During an incident we post an update at least every 30 minutes until it is resolved, and you can subscribe to updates by email. If several of your team members see the same error at the same time, check the status page before troubleshooting your own setup.",
  },
  {
    tenant: "hq", slug: "kb-accounts-password-reset", product: "Inbox", language: "en",
    title: "Resetting your password",
    body: "Select Forgot password on the sign-in page and enter the email address of your account. The reset link is sent only to that exact address and is valid for 30 minutes. If it does not arrive within a few minutes, check your spam folder and confirm that you typed the email address exactly as it appears on your account. An admin can also send you a new reset link from Settings > Users.",
  },
  {
    tenant: "hq", slug: "kb-accounts-2fa", product: "Inbox", language: "en",
    title: "Two-factor authentication and lost devices",
    body: "Two-factor authentication adds a code from an authenticator app to your sign-in. If you lose your phone, use one of the backup codes you saved when you turned it on. If you have no backup codes, an admin on your account can reset two-factor authentication for you in Settings > Users, after which you set it up again. For your security, our support team cannot turn it off for you.",
  },
  {
    tenant: "hq", slug: "kb-accounts-add-users", product: "Inbox", language: "en",
    title: "Adding and removing users",
    body: "Admins add users in Settings > Users > Invite. Each user takes one seat on your plan; you can buy more seats in Billing Portal. To remove someone who has left, open their profile in Settings > Users and select Deactivate. Their tickets stay assigned to them until you reassign them, and deactivating frees the seat immediately.",
  },
  {
    tenant: "hq", slug: "kb-accounts-sso", product: "Inbox", language: "en",
    title: "Setting up single sign-on (SAML)",
    body: "Single sign-on with SAML 2.0 is available on Enterprise plans. In Settings > Security > SSO, copy our service provider details into your identity provider, then paste your identity provider's metadata URL. Test with one user before requiring SSO for everyone. The most common error, Invalid audience, means the entity ID in your identity provider does not match the one shown in our settings.",
  },
  {
    tenant: "hq", slug: "kb-api-rate-limits", product: "API", language: "en",
    title: "API rate limits",
    body: "Each account can make 600 API requests per minute. Above that, the API returns HTTP 429 with a Retry-After header that says how many seconds to wait. Use exponential backoff and respect Retry-After rather than retrying immediately. Bulk endpoints count as one request, so batch updates where you can.",
  },
  {
    tenant: "hq", slug: "kb-api-webhooks", product: "API", language: "en",
    title: "Webhooks: delivery and retries",
    body: "Webhooks are sent as HTTPS POST requests. Your endpoint must respond with a 2xx status within 10 seconds. If it does not, we retry up to 5 times over 24 hours with increasing delays. After the last failed retry the webhook is disabled and account admins receive an email; re-enable it in Settings > Integrations > Webhooks once your endpoint is fixed.",
  },
  {
    tenant: "hq", slug: "kb-mobile-notifications", product: "Mobile App", language: "en",
    title: "Turning on mobile notifications",
    body: "If you do not receive notifications from the Helpdesk HQ mobile app, first check that notifications are on in the app under Settings > Notifications. Then check your phone's settings and allow the app to send notifications. On Android, turn off battery optimisation for the app, because it can block notifications. If they still do not arrive, sign out and sign in again to refresh the notification token.",
  },
  {
    tenant: "hq", slug: "kb-mobile-notifications-ar", product: "Mobile App", language: "ar",
    title: "تفعيل الإشعارات في تطبيق الهاتف",
    body: "إذا لم تصلك الإشعارات من تطبيق Helpdesk HQ على هاتفك، تأكد أولاً من تفعيل الإشعارات داخل التطبيق من الإعدادات ثم الإشعارات. بعد ذلك تحقق من إعدادات الهاتف واسمح للتطبيق بإرسال الإشعارات. على أجهزة أندرويد، أوقف تحسين البطارية للتطبيق لأنه قد يمنع وصول الإشعارات. إذا استمرت المشكلة، سجّل الخروج ثم سجّل الدخول مرة أخرى لتحديث رمز الإشعارات.",
  },
  {
    tenant: "hq", slug: "kb-feature-requests", product: null, language: "en",
    title: "How we handle feature requests",
    body: "Every feature request is logged and shared with the product team, who review requests every month. We cannot promise whether or when a feature will be built, but requests from many customers are more likely to be prioritised. You can see what is planned on our public roadmap at roadmap.helpdeskhq.test and vote for ideas there.",
  },
  {
    tenant: "hq", slug: "kb-inbox-email-forwarding", product: "Inbox", language: "en",
    title: "Forwarding your support email to Helpdesk HQ",
    body: "To turn emails into tickets, forward your support address (for example support@yourcompany.com) to the forwarding address shown in Settings > Channels > Email. Then send a test email; it should appear in your Inbox within a minute. If new emails stop arriving, check that the forwarding rule is still active with your email provider and that the forwarding address has not changed.",
  },
  // ---------------- Cedar Bank
  {
    tenant: "cedar-bank", slug: "kb-cards-lost-card", product: "Cards", language: "en",
    title: "Lost or stolen card",
    body: "You can freeze your card instantly in the Cedar Bank app under Cards > Freeze card. Freezing stops all new transactions and can be undone at any time. To order a replacement, choose Order new card; replacement cards arrive within 5 working days. Never share your full card number or PIN with anyone. Our staff will never ask for them.",
  },
  {
    tenant: "cedar-bank", slug: "kb-cards-lost-card-ar", product: "Cards", language: "ar",
    title: "فقدان البطاقة أو سرقتها",
    body: "يمكنك تجميد بطاقتك فوراً من تطبيق سيدار بنك عبر البطاقات ثم تجميد البطاقة. يوقف التجميد جميع المعاملات الجديدة ويمكن إلغاؤه في أي وقت. لطلب بطاقة بديلة اختر طلب بطاقة جديدة، وتصل البطاقة البديلة خلال 5 أيام عمل. لا تشارك رقم بطاقتك الكامل أو الرقم السري مع أي شخص، ولن يطلبهما منك موظفونا أبداً.",
  },
  {
    tenant: "cedar-bank", slug: "kb-cards-declined", product: "Cards", language: "en",
    title: "Why was my card declined?",
    body: "Cards are declined most often because of insufficient funds, an expired card, a daily spending limit, or online or international payments being switched off. You can check and change these in the app under Cards > Settings. For your protection, we may also decline a payment that looks unusual and send you a notification to confirm it.",
  },
  {
    tenant: "cedar-bank", slug: "kb-cards-dispute-transaction", product: "Cards", language: "en",
    title: "Disputing a card transaction",
    body: "You can dispute a card transaction within 60 days of the transaction date. In the app, open the transaction and select Dispute, then describe what happened. We review disputes within 10 business days and may contact the merchant. If you do not recognise the transaction at all, freeze your card first.",
  },
  {
    tenant: "cedar-bank", slug: "kb-digital-otp-not-received", product: "Mobile Banking", language: "en",
    title: "One-time code not received",
    body: "One-time codes are sent by SMS to the registered mobile number on your account. Check that this number is correct and that you have network coverage. A code is valid for 5 minutes and you can request a new one after 60 seconds. Never share a one-time code with anyone, even someone who says they are from the bank.",
  },
  {
    tenant: "cedar-bank", slug: "kb-digital-otp-not-received-ar", product: "Mobile Banking", language: "ar",
    title: "عدم وصول رمز التحقق",
    body: "يُرسل رمز التحقق لمرة واحدة برسالة نصية إلى رقم الهاتف المسجل في حسابك. تأكد من أن الرقم المسجل صحيح ومن وجود تغطية للشبكة. صلاحية الرمز 5 دقائق، ويمكنك طلب رمز جديد بعد 60 ثانية. لا تشارك الرمز مع أي شخص، حتى لو ادعى أنه من البنك.",
  },
  {
    tenant: "cedar-bank", slug: "kb-transfers-international-times", product: "Transfers", language: "en",
    title: "How long international transfers take",
    body: "International transfers usually arrive in 1 to 3 business days, depending on the destination country and any intermediary banks. Transfers made after 2 pm UAE time are processed the next business day. You can track a transfer in the app under Transfers > History.",
  },
  {
    tenant: "cedar-bank", slug: "kb-transfers-limits", product: "Transfers", language: "en",
    title: "Transfer limits",
    body: "The default daily limit for transfers in the app is AED 50,000. You can lower it at any time in Settings > Limits. Raising it above the default requires a branch visit or a call from our team to confirm your identity.",
  },
  // ---------------- Souk Market
  {
    tenant: "souk-market", slug: "kb-orders-track", product: "Orders", language: "en",
    title: "Tracking your order",
    body: "Open My orders and select the order to see its status and the courier's tracking link. The tracking link appears once the order has shipped, usually within one business day of ordering. If the tracking page has not updated for 3 business days, contact us with your order number.",
  },
  {
    tenant: "souk-market", slug: "kb-delivery-times", product: "Delivery", language: "en",
    title: "Delivery times",
    body: "Standard delivery within the UAE takes 2 to 4 business days. Express delivery arrives the next business day for orders placed before 2 pm. Delivery to other GCC countries takes 4 to 7 business days. Business days at Souk Market are Sunday to Thursday.",
  },
  {
    tenant: "souk-market", slug: "kb-returns-policy", product: "Returns", language: "en",
    title: "Return policy",
    body: "You can return most items within 14 days of delivery if they are unused and in their original packaging. Once we receive and inspect the item, we refund the original payment method within 7 business days. Some items cannot be returned, such as opened cosmetics and personalised products.",
  },
  {
    tenant: "souk-market", slug: "kb-returns-policy-ar", product: "Returns", language: "ar",
    title: "سياسة الإرجاع",
    body: "يمكنك إرجاع معظم المنتجات خلال 14 يوماً من تاريخ الاستلام إذا كانت غير مستخدمة وفي عبوتها الأصلية. بعد استلام المنتج وفحصه، نعيد المبلغ إلى وسيلة الدفع الأصلية خلال 7 أيام عمل. لا يمكن إرجاع بعض المنتجات مثل مستحضرات التجميل المفتوحة والمنتجات المخصصة.",
  },
  {
    tenant: "souk-market", slug: "kb-returns-how", product: "Returns", language: "en",
    title: "Starting a return",
    body: "Go to My orders, select the item and choose Return item. Pick a reason and a collection date; a courier collects the item from your address at no cost. Keep the item in its original packaging until it is collected.",
  },
  {
    tenant: "souk-market", slug: "kb-seller-payouts", product: "Seller Center", language: "en",
    title: "Seller payouts",
    body: "Payouts are made every Thursday for orders delivered and not returned during the previous week. Payouts go to the bank account in Seller Center > Payments and usually arrive within 2 business days. If a payout is missing, check that your bank details are verified; unverified accounts are paid once verification is complete.",
  },
  {
    tenant: "souk-market", slug: "kb-seller-listings", product: "Seller Center", language: "en",
    title: "Listing a new product",
    body: "In Seller Center, choose Products > Add product, then add a title, at least three photos, the price and the stock count. New listings are reviewed within 1 business day before they appear on Souk Market. Listings with missing photos or prohibited items are rejected with a reason you can fix.",
  },
  {
    tenant: "souk-market", slug: "kb-orders-cancel", product: "Orders", language: "en",
    title: "Cancelling an order",
    body: "You can cancel an order in My orders until it ships. Cancelled orders are refunded to the original payment method within 7 business days. Once an order has shipped it cannot be cancelled, but you can return it after delivery.",
  },
];

// ---------------- generated articles

const TOPICS: Record<string, string[]> = {
  "Inbox": ["Using views to organise your queue", "Merging duplicate tickets", "Creating macros", "Using tags", "Snoozing tickets", "Keyboard shortcuts", "Collision detection", "Assignment rules", "Customer satisfaction surveys", "Working with CC and BCC", "Internal notes", "Ticket priorities"],
  "Knowledge Base": ["Publishing an article", "Article versions", "Categories and sections", "Search settings", "Internal articles", "Translating articles", "Article feedback", "Custom domains for your help centre"],
  "Reports": ["Exporting a report as PDF", "Scheduled reports", "Custom dashboards", "The first response time report", "Filtering reports by team", "Sharing a dashboard", "Report time zones"],
  "Billing Portal": ["Understanding your invoice", "Seat counts and billing", "Paying by bank transfer", "Updating billing contacts", "Tax and VAT"],
  "API": ["Authentication with API keys", "Pagination", "Error codes", "Creating tickets through the API", "Searching tickets through the API", "API versioning", "Rotating API keys"],
  "Mobile App": ["Installing the mobile app", "Offline mode", "Replying from your phone", "Mobile app security", "Switching accounts on mobile"],
  "Cards": ["Activating a new card", "Changing your card PIN", "Card spending limits", "Contactless payments", "Using your card abroad", "Card fees"],
  "Mobile Banking": ["Signing in with biometrics", "Updating your mobile number", "Paying bills in the app", "App notifications", "Downloading statements", "Changing your app password"],
  "Transfers": ["Adding a beneficiary", "Scheduled transfers", "Transfer fees", "Cancelling a transfer", "Transfers between your own accounts"],
  "Loans": ["Applying for a personal loan", "Early loan settlement", "Loan repayment dates", "Loan statements"],
  "Orders": ["Changing a delivery address", "Order confirmation emails", "Paying cash on delivery", "Gift orders", "Splitting an order"],
  "Delivery": ["Delivery to another emirate", "Missed deliveries", "Collection points", "Delivery fees"],
  "Returns": ["Exchanging an item", "Damaged items", "Refund timelines", "Items that cannot be returned"],
  "Seller Center": ["Managing stock", "Seller ratings", "Promotions for sellers", "Shipping settings for sellers", "Seller account verification"],
};

const VARIANTS = ["", "Troubleshooting: ", "FAQ: ", "Admin guide: "];
const STEP_POOL = [
  "Open {product} and go to Settings.",
  "Select the option for {topic}.",
  "Review the details and select Save.",
  "Check the result in the list view.",
  "If you do not see the option, ask an admin to check your permissions.",
  "Changes apply immediately for everyone on your account.",
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function generateArticles(tenant: TenantSeed, need: number, rng: Rng, taken: Set<string>): ArticleSeed[] {
  const out: ArticleSeed[] = [];
  const pairs = tenant.products.flatMap((p) => (TOPICS[p] ?? []).map((t) => [p, t] as const));
  for (let round = 0; out.length < need && round < VARIANTS.length; round++) {
    for (const [product, topic] of pairs) {
      if (out.length >= need) break;
      const title = `${VARIANTS[round]}${topic}`;
      const slug = `kb-${slugify(product)}-${slugify(title)}`;
      if (taken.has(slug)) continue;
      taken.add(slug);
      const steps = shuffle(STEP_POOL, rng).slice(0, 3)
        .map((s, i) => `${i + 1}. ${s.replace("{product}", product).replace("{topic}", topic.toLowerCase())}`);
      const body = round === 1
        ? `If ${topic.toLowerCase()} is not working as expected in ${product}, try these steps:\n${steps.join("\n")}\nIf the problem continues, contact support with a screenshot and the time it happened.`
        : round === 3
          ? `For admins: how to configure ${topic.toLowerCase()} for your whole team in ${product}.\n${steps.join("\n")}\nAdmins can undo these changes at any time.`
        : round === 2
          ? `Common questions about ${topic.toLowerCase()} in ${product}. Most settings are available to admins only. ${steps.join(" ")} Changes are logged in the audit history.`
          : `This article explains ${topic.toLowerCase()} in ${product}.\n${steps.join("\n")}\nSee related articles in the ${product} section for more.`;
      out.push({ tenant: tenant.slug, slug, product, title, body, language: "en" });
    }
  }
  return out;
}

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
