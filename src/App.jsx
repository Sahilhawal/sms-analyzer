import React, { useState } from "react";
import { predictCategory } from "./predict";

const debitKeywords = [
  "debited",
  "spent",
  "paid",
  "withdrawn",
  "purchase",
  "debit",
];
const creditKeywords = [
  "credited",
  "credit",
  "received",
  "added",
  "deposited",
  "refunded",
];

const debitTemplates = {
  HDFC: {
    keyword: "HDFC",
    pattern:
      /Spent Rs\.([\d.]+) On HDFC Bank Card \d+ At (.+?) On ([\d-:]+)\./i,
    extract: (match) => ({
      type: "debit",
      amount: match[1],
      to: match[2],
      date: match[3],
    }),
  },
  ICICI: {
    keyword: "ICICI",
    pattern:
      /ICICI Bank Acct .*? debited for Rs ([\d.]+) on ([\d]{2}-[A-Za-z]{3}-[\d]{2}); (.*?) credited/i,
    extract: (match) => ({
      type: "debit",
      amount: parseFloat(match[1].replace(/,/g, "")),
      date: match[2],
      to: match[3].trim(),
    }),
  },
  SBI: {
    keyword: "SBI",
    pattern:
      /Dear UPI user A\/C .*? debited by ([\d.]+) on date ([\d]{2}[A-Za-z]{3}\d{2}) trf to (.+?) Refno/i,
    extract: (match) => ({
      type: "debit",
      amount: parseFloat(match[1]),
      date: match[2],
      to: match[3].trim(),
    }),
  },
};

const creditTemplates = {
  ICICI: {
    keyword: "ICICI",
    pattern:
      /credited with Rs ([\d.]+) on ([\d]{2}-[A-Za-z]{3}-[\d]{2}) from (.+?)\. UPI:/i,
    extract: (match) => ({
      type: "credit",
      amount: parseFloat(match[1]),
      date: match[2],
      from: match[3].trim(),
    }),
  },
  HDFC: {
    keyword: "HDFC",
    pattern:
      /Credit Alert!\s*Rs\.([\d.]+) credited to HDFC Bank A\/c .*? on ([\d-]+) from VPA (.+?) \(UPI/i,
    extract: (match) => ({
      type: "credit",
      amount: parseFloat(match[1]),
      date: match[2],
      from: match[3].trim(),
    }),
  },
  SBI_CREDIT: {
    keyword: "SBI",
    pattern:
      /Dear SBI User, your A\/c .*?-credited by Rs\.([\d.]+) on ([\d]{2}[A-Za-z]{3}\d{2}) transfer from (.+?) Ref No/i,
    extract: (match) => ({
      type: "credit",
      amount: parseFloat(match[1]),
      date: match[2],
      from: match[3].trim(),
    }),
  },
};

function parseTransactionSMS(sms) {
  const direction = getTransactionDirection(sms);
  if (!direction) return null;

  const templates = direction === "credit" ? creditTemplates : debitTemplates;

  for (const key in templates) {
    const { keyword, pattern, extract } = templates[key];
    if (sms.includes(keyword)) {
      const match = sms.match(pattern);
      if (match) {
        return extract(match);
      }
    }
  }

  return null; // fallback to ML or manual tagging
}

export const expenseCategoryRules = {
  "Food & Dining": [
    "restaurant",
    "cafe",
    "coffee",
    "doordash",
    "uber eats",
    "grubhub",
    "zomato",
    "swiggy",
    "mcdonald",
    "starbucks",
    "chipotle",
    "food",
    "grocery",
    "bakery",
    "pizz",
    "taco",
    "burger",
    "diner",
    "meal",
    "eatery",
    "buffet",
    "subway",
    "blinkit",
    "instamart",
    "bigbasket",
    "eatclub",
    "faasos",
    "domino",
    "kfc",
    "haldiram",
    "biryani",
    "freshmenu",
  ],
  Shopping: [
    "amazon",
    "flipkart",
    "myntra",
    "ajio",
    "snapdeal",
    "shop",
    "store",
    "market",
    "purchase",
    "retail",
    "clothing",
    "apparel",
    "boutique",
    "lifestyle",
    "pantaloons",
    "reliance trends",
    "dmart",
    "big bazaar",
    "tatacliq",
    "nykaa",
    "meesho",
    "shopclues",
    "paytm mall",
    "sweets",
  ],
  Transportation: [
    "uber",
    "ola",
    "lyft",
    "taxi",
    "cab",
    "transit",
    "metro",
    "bus",
    "train",
    "transport",
    "autorickshaw",
    "rickshaw",
    "toll",
    "parking",
    "grab",
    "rapido",
    "bounce",
    "shuttl",
    "blablacar",
  ],
  Fuel: [
    "fuel",
    "petrol",
    "diesel",
    "gas station",
    "shell",
    "bp",
    "hpcl",
    "ioc",
    "bharat petroleum",
    "indian oil",
    "refuel",
    "cng",
    "pump",
    "filling station",
    "essar",
    "servo",
  ],
  "Bills & Utilities": [
    "electric",
    "electricity",
    "water bill",
    "sewer",
    "energy",
    "internet",
    "wifi",
    "cable",
    "tv",
    "dth",
    "phone",
    "mobile",
    "cell",
    "recharge",
    "airtel",
    "jio",
    "vi",
    "bsnl",
    "billdesk",
    "bill",
    "payment",
    "postpaid",
    "prepaid",
    "broadband",
    "tata sky",
    "sun direct",
    "dishtv",
  ],
  Entertainment: [
    "netflix",
    "prime video",
    "hotstar",
    "hulu",
    "disney+",
    "spotify",
    "apple music",
    "youtube premium",
    "pvr",
    "inox",
    "bookmyshow",
    "movie",
    "cinema",
    "theater",
    "concert",
    "game",
    "gaming",
    "show",
    "ticket",
    "zee5",
    "sony liv",
    "jio cinema",
  ],
  Travel: [
    "hotel",
    "booking",
    "flight",
    "airline",
    "airport",
    "trip",
    "travel",
    "makemytrip",
    "yatra",
    "cleartrip",
    "goibibo",
    "expedia",
    "airbnb",
    "stay",
    "resort",
    "oyo",
    "treebo",
    "agoda",
    "easemytrip",
    "ibibo",
  ],
  "Health & Fitness": [
    "pharmacy",
    "medical",
    "clinic",
    "hospital",
    "doctor",
    "health",
    "fitness",
    "gym",
    "workout",
    "medlife",
    "netmeds",
    "1mg",
    "practo",
    "apollo",
    "pathology",
    "diagnostics",
    "medicine",
    "lab",
    "healthcare",
    "dentist",
    "vision",
    "wellness",
    "test",
  ],
  Education: [
    "tuition",
    "school",
    "college",
    "university",
    "course",
    "class",
    "coaching",
    "exam",
    "book",
    "textbook",
    "student",
    "fee",
    "scholarship",
    "nptel",
    "byjus",
    "unacademy",
    "udemy",
    "coursera",
    "edx",
    "upgrad",
    "khan academy",
  ],
  Subscription: [
    "subscription",
    "monthly",
    "annual",
    "membership",
    "renewal",
    "auto-debit",
    "recur",
    "plan",
    "upgrade",
    "spotify",
    "netflix",
    "prime",
    "cloud",
    "storage",
    "licence",
    "app store",
    "play store",
  ],
  Investment: [
    "groww",
    "zerodha",
    "upstox",
    "angel one",
    "icici direct",
    "hdfc securities",
    "mutual fund",
    "sip",
    "nifty",
    "stock",
    "equity",
    "demat",
    "coin",
    "paytm money",
    "etmoney",
    "fund",
    "investment",
    "sharekhan",
    "mf",
  ],
  Insurance: [
    "insurance",
    "policy",
    "premium",
    "lic",
    "sbi life",
    "hdfc life",
    "icici prudential",
    "new india",
    "renewal",
    "health cover",
    "term plan",
    "car insurance",
    "bike insurance",
    "life insurance",
  ],
  Loan: [
    "emi",
    "loan",
    "interest",
    "principal",
    "nbfc",
    "capital",
    "finance",
    "bajaj",
    "moneyview",
    "paylater",
    "creditline",
    "paytm postpaid",
    "lazy pay",
    "kreditbee",
    "slice",
    "zest money",
    "earlysalary",
  ],
  Transfer: [
    "upi",
    "imps",
    "neft",
    "rtgs",
    "transferred",
    "credited",
    "debited",
    "to",
    "from",
    "account",
    "a/c",
    "pay",
    "sent",
    "received",
    "bank",
    "beneficiary",
    "payment",
    "payout",
    "payee",
  ],
  Miscellaneous: [],
};
export function categorizeByRecipient(to) {
  const normalizedTo = to.toLowerCase();

  for (const [category, keywords] of Object.entries(expenseCategoryRules)) {
    for (const keyword of keywords) {
      if (normalizedTo.includes(keyword)) {
        return category;
      }
    }
  }

  return "Miscellaneous";
}

function getTransactionDirection(sms) {
  const lowerSms = sms.toLowerCase();

  let firstKeyword = null;
  let firstType = null;
  let firstIndex = Infinity;

  for (const keyword of debitKeywords) {
    const index = lowerSms.indexOf(keyword);
    if (index !== -1 && index < firstIndex) {
      firstKeyword = keyword;
      firstType = "debit";
      firstIndex = index;
    }
  }

  for (const keyword of creditKeywords) {
    const index = lowerSms.indexOf(keyword);
    if (index !== -1 && index < firstIndex) {
      firstKeyword = keyword;
      firstType = "credit";
      firstIndex = index;
    }
  }

  return firstType; // "debit", "credit", or null if none found
}

const App = () => {
  const [sms, setSms] = useState("");
  const [category, setCategory] = useState("");

  const handleClassify = async () => {
    const { type, amount, to, date, from } = parseTransactionSMS(sms);
    const category = categorizeByRecipient(sms);
    console.log(type, amount, to, date, category, from);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>SMS Categorizer</h1>
      <textarea
        value={sms}
        onChange={(e) => setSms(e.target.value)}
        rows={5}
        cols={60}
        placeholder="Paste your SMS here"
      />
      <br />
      <button onClick={handleClassify}>Classify</button>
    </div>
  );
};

export default App;
