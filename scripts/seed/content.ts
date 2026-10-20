// Templates for generated tickets. Anchor tickets (anchors.ts) are hand-written instead.
import type { TenantSeed } from "./tenants";

export interface Scenario {
  product: string;
  team: string;
  weight: number;
  en: { subjects: string[]; bodies: string[] };
  ar?: { subjects: string[]; bodies: string[] };
}

export const SCENARIOS: Record<TenantSeed["slug"], Scenario[]> = {
  hq: [
    { product: "Billing Portal", team: "Billing", weight: 4,
      en: { subjects: ["Question about invoice {invoice}", "Wrong amount on our latest invoice", "Need a copy of last month's invoice", "VAT missing from invoice {invoice}"],
            bodies: ["Hi, our invoice {invoice} shows {amount} but we expected less because we removed two seats last month. Can you check?", "Hello, I can't find last month's invoice in the Billing Portal. Could you send it or tell me where to look?", "Our finance team needs our VAT number on invoice {invoice}. Can this be added?"] },
      ar: { subjects: ["استفسار عن الفاتورة {invoice}"], bodies: ["مرحباً، الفاتورة {invoice} تظهر مبلغ {amount} وهو أعلى مما توقعنا. هل يمكنكم التحقق من ذلك؟"] } },
    { product: "Billing Portal", team: "Billing", weight: 2,
      en: { subjects: ["Card declined when paying", "How do I change our payment card?"],
            bodies: ["Our renewal failed and the Billing Portal says the card was declined. The card works elsewhere. What should we do?", "We have a new company card. Where can I update the payment method before the next renewal?"] } },
    { product: "Inbox", team: "Technical", weight: 4,
      en: { subjects: ["Emails not turning into tickets", "Inbox is slow to load", "Macros not applying tags", "Assignment rule sends tickets to the wrong team"],
            bodies: ["Since this morning, emails to our support address are not showing up as tickets. Nothing changed on our side as far as I know.", "The Inbox takes about 20 seconds to load for everyone on our team. Is something wrong?", "Our 'Refund request' macro is supposed to add the refund tag but it doesn't anymore.", "We set up a rule to send billing tickets to the Finance team but they all land in General."] },
      ar: { subjects: ["الرسائل لا تتحول إلى تذاكر"], bodies: ["منذ صباح اليوم لا تظهر رسائل البريد المرسلة إلى عنوان الدعم كتذاكر جديدة. هل هناك مشكلة؟"] } },
    { product: "Inbox", team: "Accounts", weight: 3,
      en: { subjects: ["Can't sign in", "Password reset link expired", "Need to remove a user who left", "Two-factor code not accepted"],
            bodies: ["I can't sign in to my account. It says my password is wrong but I just reset it.", "The reset link says it has expired. I clicked it about an hour after I got it.", "One of our agents left the company. How do we remove their access and free the seat?", "My authenticator code is rejected every time. The time on my phone is correct."] },
      ar: { subjects: ["لا أستطيع تسجيل الدخول"], bodies: ["لا أستطيع تسجيل الدخول إلى حسابي، تظهر رسالة أن كلمة المرور غير صحيحة رغم أنني غيرتها للتو."] } },
    { product: "Reports", team: "Technical", weight: 3,
      en: { subjects: ["Report numbers don't match the Inbox", "Scheduled report not delivered", "How do I export a report?"],
            bodies: ["The first response time report says 3 hours but when I check the tickets it looks closer to 1 hour.", "Our weekly report used to arrive every Monday and stopped two weeks ago.", "How can I get the ticket volume report into Excel?"] } },
    { product: "API", team: "Technical", weight: 2,
      en: { subjects: ["API returns 401 with a new key", "Pagination skips tickets", "Webhook payload missing fields"],
            bodies: ["We created a new API key and every request returns 401 Unauthorized.", "When we page through /tickets with page and pageSize we seem to miss a few tickets between pages.", "The ticket.updated webhook doesn't include the assignee anymore."] } },
    { product: "Knowledge Base", team: "Technical", weight: 2,
      en: { subjects: ["Article not showing in help centre search", "Can we have articles in Arabic and English?"],
            bodies: ["We published an article yesterday but searching for its title on our help centre finds nothing.", "Our customers write in Arabic and English. Can the help centre show both languages?"] } },
    { product: "Mobile App", team: "Technical", weight: 2,
      en: { subjects: ["Mobile app crashes on start", "Notifications delayed on iPhone"],
            bodies: ["Since the last update the Android app closes as soon as I open it.", "Push notifications on my iPhone arrive 10 to 15 minutes late."] },
      ar: { subjects: ["التطبيق يتوقف عند الفتح"], bodies: ["منذ آخر تحديث يتوقف تطبيق أندرويد فور فتحه."] } },
    { product: "Inbox", team: "Product Feedback", weight: 2,
      en: { subjects: ["Feature request: {feature}", "Suggestion: {feature}"],
            bodies: ["It would really help our team if you added {feature}. Is this on the roadmap?", "We'd love {feature}. We currently work around it with a spreadsheet."] } },
  ],
  "cedar-bank": [
    { product: "Cards", team: "Cards", weight: 4,
      en: { subjects: ["Card declined at a shop", "Card not arrived yet", "Increase my card limit", "Card blocked after wrong PIN"],
            bodies: ["My card was declined at a supermarket today although I have enough balance.", "I ordered a replacement card 8 days ago and it hasn't arrived.", "I'd like to increase my daily card spending limit for a trip.", "I entered the wrong PIN three times and now my card is blocked."] },
      ar: { subjects: ["رفض البطاقة", "البطاقة لم تصل"], bodies: ["تم رفض بطاقتي اليوم في متجر رغم وجود رصيد كافٍ.", "طلبت بطاقة بديلة منذ أسبوع ولم تصل بعد."] } },
    { product: "Mobile Banking", team: "Digital Banking", weight: 4,
      en: { subjects: ["App won't let me sign in", "Bill payment failed", "Statement download not working"],
            bodies: ["The app says 'session expired' every time I try to sign in.", "I paid my electricity bill in the app, the money left my account but the bill shows unpaid.", "When I try to download last month's statement the app shows an error."] },
      ar: { subjects: ["لا أستطيع الدخول إلى التطبيق", "فشل دفع الفاتورة"], bodies: ["يظهر التطبيق رسالة انتهاء الجلسة كلما حاولت تسجيل الدخول.", "دفعت فاتورة الكهرباء عبر التطبيق وخُصم المبلغ لكن الفاتورة ما زالت غير مدفوعة."] } },
    { product: "Transfers", team: "Digital Banking", weight: 3,
      en: { subjects: ["Transfer not received", "How do I add a beneficiary?", "Transfer limit too low"],
            bodies: ["I sent money to my brother's account two days ago and he hasn't received it.", "I want to add a new beneficiary abroad. Where do I do this in the app?", "I need to transfer AED 80,000 for a deposit but the app limits me."] } },
    { product: "Cards", team: "Fraud and Disputes", weight: 3,
      en: { subjects: ["Transaction I don't recognise", "Charged twice by a merchant", "Merchant didn't refund me"],
            bodies: ["There's a payment of AED {amount} on my card that I didn't make.", "A restaurant charged me twice for the same meal.", "I returned an item a month ago and the shop still hasn't refunded my card."] },
      ar: { subjects: ["عملية لا أعرفها"], bodies: ["توجد عملية بقيمة {amount} درهم على بطاقتي لم أقم بها."] } },
    { product: "Loans", team: "Digital Banking", weight: 1,
      en: { subjects: ["Early settlement of my loan", "Loan instalment date"],
            bodies: ["I'd like to settle my personal loan early. What is the amount and how do I pay it?", "Can I move my monthly instalment date to after my salary arrives?"] } },
  ],
  "souk-market": [
    { product: "Orders", team: "Orders and Delivery", weight: 4,
      en: { subjects: ["Where is my order {order}?", "Order shows delivered but I didn't get it", "Change delivery address"],
            bodies: ["My order {order} was supposed to arrive yesterday. The tracking hasn't moved.", "The app says order {order} was delivered but nothing arrived at my door.", "Can I change the delivery address for order {order}? I moved last week."] },
      ar: { subjects: ["أين طلبي {order}؟"], bodies: ["كان من المفترض أن يصل طلبي {order} أمس، ولم يتغير التتبع منذ يومين."] } },
    { product: "Returns", team: "Returns", weight: 3,
      en: { subjects: ["Return for order {order}", "Refund not received for return", "Item arrived damaged"],
            bodies: ["I want to return the shoes from order {order}. They're too small.", "The courier collected my return 10 days ago and I still haven't been refunded.", "The lamp in order {order} arrived broken."] },
      ar: { subjects: ["إرجاع الطلب {order}"], bodies: ["أريد إرجاع المنتج من الطلب {order} لأنه غير مناسب."] } },
    { product: "Delivery", team: "Orders and Delivery", weight: 2,
      en: { subjects: ["Express delivery didn't arrive next day", "Delivery to Oman"],
            bodies: ["I paid for express delivery yesterday morning and it's still not here.", "Do you deliver to Muscat, and how long does it take?"] } },
    { product: "Seller Center", team: "Seller Support", weight: 2,
      en: { subjects: ["Payout missing this week", "Listing rejected", "How do I update stock?"],
            bodies: ["I didn't receive my payout this Thursday. My bank details haven't changed.", "My new listing was rejected but I don't understand the reason.", "How do I update stock for 40 products at once?"] } },
  ],
};

export const FEATURES = ["dark mode in the Inbox", "bulk editing of tags", "SLA reports per customer", "a Slack integration", "custom fields on tickets", "scheduled replies", "WhatsApp as a channel"];

export const AGENT_REPLIES: Record<TenantSeed["slug"], { en: string[]; ar: string[] }> = {
  hq: {
    en: ["Hi {first}, thanks for reaching out. I'm looking into this now and will update you shortly.",
         "Thanks {first}. Could you send a screenshot and the approximate time this happened? That will help us trace it.",
         "Hi {first}, I've checked this and it's now fixed on our side. Could you try again and let me know?",
         "Thanks for your patience, {first}. I've passed this to our technical team and will update you as soon as I hear back."],
    ar: ["مرحباً {first}، شكراً لتواصلك معنا. أتحقق من الأمر الآن وسأعود إليك قريباً.",
         "شكراً {first}، هل يمكنك إرسال لقطة شاشة ووقت حدوث المشكلة تقريباً؟"],
  },
  "cedar-bank": {
    en: ["Dear {first}, thank you for contacting Cedar Bank. We are reviewing your request and will update you shortly.",
         "Dear {first}, for your security please do not share your card number or PIN. Could you confirm the date and amount of the transaction?",
         "Dear {first}, this has now been resolved. Please let us know if you need anything else."],
    ar: ["عزيزي {first}، شكراً لتواصلك مع سيدار بنك. نقوم بمراجعة طلبك وسنعود إليك قريباً.",
         "عزيزي {first}، حفاظاً على أمانك لا تشارك رقم بطاقتك أو الرقم السري. هل يمكنك تأكيد تاريخ العملية ومبلغها؟"],
  },
  "souk-market": {
    en: ["Hi {first}! Thanks for writing to Souk Market. I'm checking this with the courier now.",
         "Hi {first}, sorry about this. Could you send a photo of the item so we can sort it out quickly?",
         "Hi {first}, all done: you'll see the update in My orders within a few hours."],
    ar: ["مرحباً {first}، شكراً لتواصلك مع سوق ماركت. أتحقق من الأمر مع شركة الشحن الآن.",
         "مرحباً {first}، نأسف لذلك. هل يمكنك إرسال صورة للمنتج؟"],
  },
};

export const CUSTOMER_FOLLOWUPS = {
  en: ["Thanks, I'll wait for your update.", "Any news on this?", "I've attached the screenshot you asked for.", "It's still happening this morning.", "That worked, thank you!", "Sorry, I sent the wrong file earlier. Here is the right one."],
  ar: ["شكراً، سأنتظر ردكم.", "هل من جديد؟", "أرفقت لقطة الشاشة المطلوبة.", "تمت المشكلة، شكراً جزيلاً!"],
};

export const INTERNAL_NOTES = [
  "Checked the logs: nothing unusual on our side. Waiting for the customer's screenshot.",
  "Same issue reported by two other customers this week. Linked to the known issue.",
  "Customer is on an old plan; check pricing before offering anything.",
  "Escalated to engineering in the internal tracker.",
];

export const FIRST_NAMES = ["Sara", "Karim", "Rania", "Hadi", "Lea", "Omar", "Maha", "Tony", "Rasha", "Ali", "Nour", "Fadi", "Joelle", "Samir", "Dana", "Bilal", "Yara", "Elie", "Huda", "Marc", "Zeina", "Walid", "Carla", "Ibrahim", "Mira", "Hassan", "Reem", "George", "Lama", "Youssef", "Priya", "Arjun", "Fatima", "Mohammed", "Noura", "Khaled", "Aya", "Rashid", "Salma", "Tamer"];
export const LAST_NAMES = ["Haddad", "Khoury", "Nassar", "Saliba", "Mansour", "Farah", "Azar", "Hamdan", "Darwish", "Najjar", "Sabbagh", "Tannous", "Karam", "Aziz", "Rizk", "Sleiman", "Hariri", "Bitar", "Chami", "Al Suwaidi", "Al Hashimi", "Menon", "Nair", "Qasim", "Zahran", "Jaber", "Fayad", "Matar"];
