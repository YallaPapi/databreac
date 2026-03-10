import { useState, useEffect, useRef } from "react";

// Dark web pricing - Privacy Affairs Dark Web Price Index + Comparitech research
const PRICES = {
  "Email addresses": { price: 1.0, icon: "📧", severity: "low" },
  "Passwords": { price: 1.5, icon: "🔑", severity: "high" },
  "Usernames": { price: 0.5, icon: "👤", severity: "low" },
  "IP addresses": { price: 0.5, icon: "🌐", severity: "low" },
  "Phone numbers": { price: 8.0, icon: "📱", severity: "medium" },
  "Physical addresses": { price: 3.0, icon: "📍", severity: "medium" },
  "Dates of birth": { price: 2.0, icon: "🎂", severity: "medium" },
  "Names": { price: 0.25, icon: "🏷️", severity: "low" },
  "Social media profiles": { price: 5.0, icon: "💬", severity: "medium" },
  "Credit card data": { price: 17.0, icon: "💳", severity: "critical" },
  "Bank account numbers": { price: 25.0, icon: "🏦", severity: "critical" },
  "Social security numbers": { price: 4.0, icon: "🪪", severity: "critical" },
  "Security questions and answers": { price: 3.5, icon: "❓", severity: "high" },
  "Employment information": { price: 2.0, icon: "💼", severity: "medium" },
  "Education information": { price: 1.0, icon: "🎓", severity: "low" },
  "Government issued IDs": { price: 15.0, icon: "🛂", severity: "critical" },
  "Health insurance information": { price: 10.0, icon: "🏥", severity: "critical" },
  "Income levels": { price: 3.0, icon: "💰", severity: "medium" },
  "Biometric data": { price: 20.0, icon: "🧬", severity: "critical" },
  "Geographic locations": { price: 1.5, icon: "🗺️", severity: "medium" },
  "Job titles": { price: 1.0, icon: "🏢", severity: "low" },
  "Purchases": { price: 2.5, icon: "🛒", severity: "medium" },
  "Passport numbers": { price: 18.0, icon: "🛂", severity: "critical" },
  "Pins": { price: 5.0, icon: "🔢", severity: "high" },
  "Auth tokens": { price: 8.0, icon: "🎟️", severity: "high" },
  "Chat logs": { price: 3.0, icon: "💬", severity: "medium" },
  "Credit status information": { price: 6.0, icon: "📊", severity: "high" },
  "Email messages": { price: 4.0, icon: "✉️", severity: "high" },
  "Encrypted keys": { price: 12.0, icon: "🔐", severity: "critical" },
  "Family members' names": { price: 1.5, icon: "👨‍👩‍👧", severity: "medium" },
  "Financial investments": { price: 8.0, icon: "📈", severity: "high" },
  "Marital statuses": { price: 0.5, icon: "💍", severity: "low" },
  "Net worths": { price: 5.0, icon: "💎", severity: "high" },
  "Personal health data": { price: 12.0, icon: "❤️‍🩹", severity: "critical" },
  "Photos": { price: 2.0, icon: "📸", severity: "medium" },
  "Private messages": { price: 4.0, icon: "🔒", severity: "high" },
  "Recovery email addresses": { price: 3.0, icon: "📧", severity: "high" },
  "Sexual orientations": { price: 2.0, icon: "🏳️‍🌈", severity: "medium" },
  "Spoken languages": { price: 0.1, icon: "🗣️", severity: "low" },
  "Taxation records": { price: 10.0, icon: "📑", severity: "critical" },
  "Genders": { price: 0.1, icon: "⚧", severity: "low" },
  "Religions": { price: 0.1, icon: "🕊️", severity: "low" },
  "Password hints": { price: 1.0, icon: "💡", severity: "medium" },
  "Personal interests": { price: 1.0, icon: "🎯", severity: "low" },
  "Smoking habits": { price: 0.25, icon: "🚬", severity: "low" },
};

// Attack scenarios mapped to required data types
const ATTACKS = [
  {
    name: "Log into your accounts",
    simple: "Someone could try your leaked password on every website you use. Most people use the same password everywhere.",
    requires: ["Passwords", "Email addresses"],
    icon: "🔓",
    damageCost: 12000,
    damageSource: "FTC avg identity theft loss (2023)",
  },
  {
    name: "Steal your phone number",
    simple: "A scammer could call your phone company, pretend to be you, and move your number to their phone. Then they get all your text message codes.",
    requires: ["Phone numbers", "Names"],
    icon: "📱",
    damageCost: 48000,
    damageSource: "FBI IC3 avg SIM swap loss",
  },
  {
    name: "Open a credit card in your name",
    simple: "Someone could apply for credit cards using your info. You won't know until debt collectors come after YOU.",
    requires: ["Dates of birth", "Names"],
    icon: "💳",
    damageCost: 10000,
    damageSource: "FTC new account fraud avg",
  },
  {
    name: "File your taxes before you do",
    simple: "A criminal could file a fake tax return using your info and steal your refund. You'd find out when the IRS rejects YOUR real return.",
    requires: ["Social security numbers"],
    icon: "📑",
    damageCost: 16000,
    damageSource: "IRS avg fraudulent refund",
  },
  {
    name: "Send you a scam email that looks real",
    simple: "Using your real name, employer, and personal details, a scammer could write an email that looks legit. Way harder to spot than normal spam.",
    requires: ["Email addresses", "Names", "Employment information"],
    icon: "🎣",
    damageCost: 4500,
    damageSource: "FBI BEC avg individual loss",
  },
  {
    name: "Answer your security questions",
    simple: "With your birthday, address, and personal details leaked, they can guess or already know your security questions.",
    requires: ["Security questions and answers"],
    icon: "❓",
    damageCost: 3000,
    damageSource: "Account recovery fraud avg",
  },
  {
    name: "Pretend to be you online",
    simple: "With your photos, name, and personal info, someone could create fake accounts that look exactly like you.",
    requires: ["Photos", "Names", "Email addresses"],
    icon: "🎭",
    damageCost: 7000,
    damageSource: "FTC impersonation fraud avg",
  },
  {
    name: "Access your cloud storage",
    simple: "Your old password could still work on Google Drive, iCloud, or Dropbox. That means your photos, documents, and files.",
    requires: ["Passwords", "Email addresses"],
    icon: "☁️",
    damageCost: 5000,
    damageSource: "Personal data extortion avg",
  },
  {
    name: "Get into your email",
    simple: "If they get into your email, they can reset the password on EVERYTHING else. Email is the master key to your whole digital life.",
    requires: ["Passwords", "Email addresses"],
    icon: "✉️",
    damageCost: 11000,
    damageSource: "Email account takeover avg loss",
  },
  {
    name: "Blackmail you with private info",
    simple: "Leaked personal details, messages, or sensitive data could be used to threaten or embarrass you.",
    requires: ["Private messages", "Chat logs"],
    icon: "🔪",
    damageCost: 8000,
    damageSource: "FBI sextortion/blackmail avg",
  },
  {
    name: "Drain your bank account",
    simple: "With your bank details and personal info, a criminal could attempt to transfer money or make purchases.",
    requires: ["Bank account numbers"],
    icon: "🏦",
    damageCost: 32000,
    damageSource: "ABA avg unauthorized transfer",
  },
  {
    name: "Stalk you physically",
    simple: "Your home address, workplace, and daily patterns are exposed. Someone now knows where you live and work.",
    requires: ["Physical addresses", "Employment information"],
    icon: "👁️",
    damageCost: 15000,
    damageSource: "Legal + relocation costs avg",
  },
];

// Breach database with forensics
const BREACH_DB = [
  {
    name: "LinkedIn",
    date: "2021-06-22",
    discovered: "2021-06-22",
    disclosed: "2021-06-29",
    count: 700000000,
    dataTypes: ["Email addresses", "Passwords", "Names", "Phone numbers", "Geographic locations", "Usernames", "Job titles", "Employment information"],
    logo: "https://logo.clearbit.com/linkedin.com",
    howSimple: "Hackers found a hole in LinkedIn's system that let them ask for user data over and over. LinkedIn's computers just kept handing it out. No fancy hacking needed — they basically left the front door open.",
    method: "API Scraping + SQL Injection",
    soldOn: ["RaidForums", "Telegram", "BreachForums"],
    soldPrice: 7000,
    ceoAtTime: "Ryan Roslansky",
    ceoPay: 24400000,
    settlementPerPerson: 0,
    gdprFine: null,
    gdprPotential: 746000000,
    companyRevenue: 10289000000,
    adRevenuePerUser: 65,
    grade: { disclosure: "B", compensation: "F", prevention: "D", overall: "D" },
    gradeExplain: { disclosure: "Told people within a week", compensation: "Offered nothing to affected users", prevention: "Had a similar breach in 2012 and didn't learn" },
  },
  {
    name: "Adobe",
    date: "2013-10-04",
    discovered: "2013-09-17",
    disclosed: "2013-10-04",
    count: 153000000,
    dataTypes: ["Email addresses", "Passwords", "Usernames", "Password hints"],
    logo: "https://logo.clearbit.com/adobe.com",
    howSimple: "Adobe stored everyone's passwords using an old, weak method (like writing your diary in pig latin instead of a real lock). Hackers broke in through a poorly-secured server. It took Adobe weeks to even notice.",
    method: "Server Intrusion + Weak Encryption (3DES-ECB)",
    soldOn: ["Underground forums", "Pastebin", "Torrent sites"],
    soldPrice: 500,
    ceoAtTime: "Shantanu Narayen",
    ceoPay: 15300000,
    settlementPerPerson: 1.18,
    gdprFine: null,
    gdprPotential: 432000000,
    companyRevenue: 11170000000,
    adRevenuePerUser: 0,
    grade: { disclosure: "C", compensation: "F", prevention: "C", overall: "D" },
    gradeExplain: { disclosure: "Took 17 days after discovery", compensation: "$1.18 per person in class action", prevention: "Upgraded security after, but damage was done" },
  },
  {
    name: "Canva",
    date: "2019-05-24",
    discovered: "2019-05-24",
    disclosed: "2019-05-24",
    count: 137000000,
    dataTypes: ["Email addresses", "Passwords", "Usernames", "Names", "Geographic locations"],
    logo: "https://logo.clearbit.com/canva.com",
    howSimple: "A hacker found a way into Canva's database and stole 137 million user records in one go. They bragged about it on Twitter the same day.",
    method: "Database Breach via Server Vulnerability",
    soldOn: ["Dark web marketplaces", "Telegram groups"],
    soldPrice: 3500,
    ceoAtTime: "Melanie Perkins",
    ceoPay: 0, // founder, takes minimal salary
    settlementPerPerson: 0,
    gdprFine: null,
    gdprPotential: 240000000,
    companyRevenue: 1700000000,
    adRevenuePerUser: 0,
    grade: { disclosure: "A", compensation: "D", prevention: "B", overall: "C" },
    gradeExplain: { disclosure: "Told users the same day", compensation: "No compensation offered", prevention: "Quickly patched and improved security" },
  },
  {
    name: "Twitter / X",
    date: "2023-01-04",
    discovered: "2022-11-01",
    disclosed: "2023-01-04",
    count: 211524284,
    dataTypes: ["Email addresses", "Names", "Usernames", "Phone numbers"],
    logo: "https://logo.clearbit.com/twitter.com",
    howSimple: "Twitter had a bug where you could type in any email or phone number and find out whose account it was. A hacker automated this and collected 200+ million records before anyone stopped them.",
    method: "API Vulnerability Exploitation",
    soldOn: ["BreachForums", "Telegram", "Hacker forums"],
    soldPrice: 200000,
    ceoAtTime: "Elon Musk",
    ceoPay: 0, // claimed $0 salary but $56B Tesla package
    settlementPerPerson: 0,
    gdprFine: 450000,
    gdprPotential: 832000000,
    companyRevenue: 4400000000,
    adRevenuePerUser: 24,
    grade: { disclosure: "D", compensation: "F", prevention: "F", overall: "F" },
    gradeExplain: { disclosure: "Took 2+ months to tell anyone", compensation: "Nothing. Zero.", prevention: "Fired most of the security team right before this" },
  },
  {
    name: "Dropbox",
    date: "2012-07-01",
    discovered: "2012-07-31",
    disclosed: "2016-08-30",
    count: 68648009,
    dataTypes: ["Email addresses", "Passwords"],
    logo: "https://logo.clearbit.com/dropbox.com",
    howSimple: "A Dropbox employee reused their work password on LinkedIn. When LinkedIn got hacked, the attacker used that same password to get into Dropbox's systems. One reused password = 68 million people exposed.",
    method: "Credential Reuse from LinkedIn Breach",
    soldOn: ["Dark web marketplaces"],
    soldPrice: 1200,
    ceoAtTime: "Drew Houston",
    ceoPay: 15200000,
    settlementPerPerson: 0,
    gdprFine: null,
    gdprPotential: 80000000,
    companyRevenue: 2320000000,
    adRevenuePerUser: 0,
    grade: { disclosure: "F", compensation: "D", prevention: "B", overall: "D" },
    gradeExplain: { disclosure: "FOUR YEARS to tell users. Breach in 2012, disclosed in 2016.", compensation: "Free credit monitoring only", prevention: "Added 2FA and improved password storage" },
  },
  {
    name: "MyFitnessPal",
    date: "2018-02-01",
    discovered: "2018-03-25",
    disclosed: "2018-03-29",
    count: 143606147,
    dataTypes: ["Email addresses", "Passwords", "Usernames", "IP addresses"],
    logo: "https://logo.clearbit.com/myfitnesspal.com",
    howSimple: "Hackers broke into the MyFitnessPal servers and grabbed 144 million accounts. Your calorie tracking app exposed your passwords to the entire internet.",
    method: "Unauthorized Server Access",
    soldOn: ["Dream Market", "Wall Street Market", "Telegram"],
    soldPrice: 20000,
    ceoAtTime: "Kevin Plank (Under Armour CEO)",
    ceoPay: 14200000,
    settlementPerPerson: 2.00,
    gdprFine: null,
    gdprPotential: 204000000,
    companyRevenue: 5190000000,
    adRevenuePerUser: 0,
    grade: { disclosure: "B", compensation: "F", prevention: "D", overall: "D" },
    gradeExplain: { disclosure: "Told people within 4 days of discovery", compensation: "$2 per person if you filed a claim", prevention: "Owned by Under Armour who later sold the app" },
  },
  {
    name: "Exactis",
    date: "2018-06-26",
    discovered: "2018-06-26",
    disclosed: "2018-06-27",
    count: 340000000,
    dataTypes: ["Email addresses", "Phone numbers", "Physical addresses", "Names", "Dates of birth", "Genders", "Credit status information", "Religions", "Marital statuses", "Personal interests", "Smoking habits", "Family members' names", "Education information", "Net worths", "Income levels"],
    logo: null,
    howSimple: "A data broker called Exactis left a database with 340 MILLION people's records sitting on the open internet with no password. A security researcher found it just by looking. Anyone could have grabbed it.",
    method: "Unprotected Elasticsearch Database (No Password)",
    soldOn: ["N/A — was openly accessible to anyone"],
    soldPrice: 0,
    ceoAtTime: "Unknown",
    ceoPay: 0,
    settlementPerPerson: 0,
    gdprFine: null,
    gdprPotential: 0,
    companyRevenue: 0,
    adRevenuePerUser: 0,
    grade: { disclosure: "A", compensation: "F", prevention: "F", overall: "F" },
    gradeExplain: { disclosure: "A researcher told the public immediately", compensation: "Zero. They're a data broker — they collect your data without asking.", prevention: "This is their entire business model" },
  },
];

// Breach sets for different emails
const BREACH_SETS = {
  "demo@gmail.com": [0, 1, 2, 3, 4, 5],
  "test@gmail.com": [0, 3, 4, 6],
  default: [0, 2, 3, 5, 6],
};

const sevColors = { low: "#4ade80", medium: "#facc15", high: "#f97316", critical: "#ef4444" };
const sevLabels = { low: "LOW", medium: "MEDIUM", high: "HIGH", critical: "CRITICAL" };

// Fun comparisons for the dark web price (cheap = outrageous)
const getDarkWebComparison = (val) => {
  if (val < 5) return { item: "a McDonald's coffee", emoji: "☕" };
  if (val < 10) return { item: "a Subway footlong", emoji: "🥖" };
  if (val < 15) return { item: "a Chipotle burrito", emoji: "🌯" };
  if (val < 25) return { item: "a movie ticket", emoji: "🎬" };
  if (val < 40) return { item: "a large pizza", emoji: "🍕" };
  if (val < 60) return { item: "a tank of gas", emoji: "⛽" };
  if (val < 100) return { item: "a pair of Nike Air Forces", emoji: "👟" };
  return { item: "a nice dinner", emoji: "🍽️" };
};

// Damage comparisons (big = terrifying)
const getDamageComparison = (val) => {
  if (val < 20000) return { item: "a used car", emoji: "🚗" };
  if (val < 50000) return { item: "a year of college tuition", emoji: "🎓" };
  if (val < 80000) return { item: "the median American salary", emoji: "💼" };
  if (val < 120000) return { item: "a down payment on a house", emoji: "🏠" };
  if (val < 200000) return { item: "a small business loan", emoji: "🏦" };
  return { item: "a house in most US cities", emoji: "🏡" };
};

function CountUp({ target, duration = 2000, prefix = "$", decimals = 2 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setVal((1 - Math.pow(1 - progress, 3)) * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [target, duration]);
  return <span>{prefix}{val.toFixed(decimals)}</span>;
}

function GlitchText({ text, active }) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!active) { setDisplay(text); return; }
    const chars = "!@#$%^&*0123456789ABCDEF";
    let frame = 0;
    const iv = setInterval(() => {
      if (frame >= 15) { setDisplay(text); clearInterval(iv); return; }
      setDisplay(text.split("").map((c, i) => i < (frame / 15) * text.length ? c : chars[Math.floor(Math.random() * chars.length)]).join(""));
      frame++;
    }, 40);
    return () => clearInterval(iv);
  }, [text, active]);
  return <span>{display}</span>;
}

function Section({ title, children, delay = 0 }) {
  return (
    <div style={{ marginBottom: 36, animation: `fadeIn 0.6s ease ${delay}s both` }}>
      <div style={{
        fontSize: "clamp(13px, 2.5vw, 16px)", letterSpacing: 3, color: "#555", textTransform: "uppercase",
        fontWeight: 700, marginBottom: 16, borderBottom: "1px solid #1a1a1a", paddingBottom: 10,
      }}>{title}</div>
      {children}
    </div>
  );
}

function GradeBox({ letter, label }) {
  const colors = { A: "#4ade80", B: "#a3e635", C: "#facc15", D: "#f97316", F: "#ef4444" };
  return (
    <div style={{ textAlign: "center", minWidth: 60 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
        background: (colors[letter] || "#666") + "22", border: `1px solid ${colors[letter] || "#666"}44`,
        fontSize: 22, fontWeight: 800, color: colors[letter] || "#666", margin: "0 auto 6px",
      }}>{letter}</div>
      <div style={{ fontSize: 11, color: "#555", letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

export default function DarkWebValue() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const [breaches, setBreaches] = useState([]);
  const [phase, setPhase] = useState(0); // 0=scanning, 1=breaches reveal, 2=value, 3=attacks, 4=forensics, 5=receipt
  const [revealCount, setRevealCount] = useState(0);
  const [scanText, setScanText] = useState("");
  const [scanProg, setScanProg] = useState(0);
  const [expandedBreach, setExpandedBreach] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const scanMsgs = [
    "Connecting to breach databases...",
    "Scanning dark web marketplaces...",
    "Cross-referencing leaked credentials...",
    "Checking paste sites and forums...",
    "Analyzing data broker dumps...",
    "Querying underground markets...",
    "Compiling breach report...",
  ];

  const getAllTypes = () => {
    const t = {};
    breaches.forEach(b => b.dataTypes.forEach(dt => {
      if (!t[dt]) t[dt] = { count: 0, ...(PRICES[dt] || { price: 0, icon: "📄", severity: "low" }) };
      t[dt].count++;
    }));
    return Object.entries(t).sort((a, b) => b[1].price - a[1].price);
  };

  const getTotal = () => {
    const allTypes = new Set();
    breaches.forEach(b => b.dataTypes.forEach(dt => allTypes.add(dt)));
    let t = 0;
    allTypes.forEach(dt => { if (PRICES[dt]) t += PRICES[dt].price; });
    return t * (1 + breaches.length * 0.15);
  };

  const getTotalDamage = () => {
    const active = getActiveAttacks().filter(a => a.active);
    return active.reduce((s, a) => s + (a.damageCost || 0), 0);
  };

  const getActiveAttacks = () => {
    const allTypes = new Set();
    breaches.forEach(b => b.dataTypes.forEach(dt => allTypes.add(dt)));
    return ATTACKS.map(a => ({
      ...a,
      active: a.requires.every(r => allTypes.has(r)),
    }));
  };

  const getHighSev = () => {
    const at = new Set();
    breaches.forEach(b => b.dataTypes.forEach(dt => at.add(dt)));
    if ([...at].some(dt => PRICES[dt]?.severity === "critical")) return "critical";
    if ([...at].some(dt => PRICES[dt]?.severity === "high")) return "high";
    if ([...at].some(dt => PRICES[dt]?.severity === "medium")) return "medium";
    return "low";
  };

  const getYearsSinceFirst = () => {
    if (!breaches.length) return 0;
    const earliest = new Date(Math.min(...breaches.map(b => new Date(b.date))));
    return ((Date.now() - earliest) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);
  };

  const getTotalCeoPay = () => breaches.reduce((s, b) => s + (b.ceoPay || 0), 0);
  const getTotalSettlement = () => breaches.reduce((s, b) => s + (b.settlementPerPerson || 0), 0);

  const handleScan = async () => {
    if (!email || !email.includes("@")) return;
    setState("scanning"); setPhase(0); setBreaches([]); setRevealCount(0); setExpandedBreach(null); setShowReceipt(false);

    for (let i = 0; i < scanMsgs.length; i++) {
      setScanText(scanMsgs[i]);
      setScanProg(((i + 1) / scanMsgs.length) * 100);
      await new Promise(r => setTimeout(r, 500 + Math.random() * 300));
    }

    const key = email.toLowerCase();
    const indices = BREACH_SETS[key] || BREACH_SETS.default;
    const data = indices.map(i => BREACH_DB[i]);
    setBreaches(data);
    setState("results"); setPhase(1);

    for (let i = 0; i <= data.length; i++) {
      await new Promise(r => setTimeout(r, 450));
      setRevealCount(i);
    }
    await new Promise(r => setTimeout(r, 600));
    setPhase(2);
    await new Promise(r => setTimeout(r, 1500));
    setPhase(3);
    await new Promise(r => setTimeout(r, 1000));
    setPhase(4);
    await new Promise(r => setTimeout(r, 800));
    setPhase(5);
  };

  const activeAttacks = getActiveAttacks();
  const activeCount = activeAttacks.filter(a => a.active).length;
  const totalDamage = getTotalDamage();
  const darkWebPrice = getTotal();
  const damageComparison = getDamageComparison(totalDamage);
  const darkWebComparison = getDarkWebComparison(darkWebPrice);

  // Show sticky CTA bar once big number is revealed
  const showStickyCta = phase >= 3;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", color: "#e0e0e0",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace", position: "relative", overflow: "hidden",
    }}>
      {/* Scanlines */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.012) 2px, rgba(0,255,65,0.012) 4px)",
      }} />
      {/* Grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(0,255,65,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.025) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }} />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)", position: "relative", zIndex: 1, paddingBottom: showStickyCta ? 100 : undefined }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(28px, 5vw, 48px)" }}>
          <div style={{ fontSize: "clamp(11px, 2vw, 14px)", letterSpacing: 6, color: "#ef4444", marginBottom: 14, textTransform: "uppercase", fontWeight: 600 }}>
            ⚠ Public Intelligence Report
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 800, margin: 0, lineHeight: 1.15,
            background: "linear-gradient(180deg, #fff 0%, #666 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}>
            How Much Could a Data Breach Cost You?
          </h1>
          <p style={{ color: "#555", fontSize: "clamp(13px, 2.5vw, 16px)", marginTop: 12, lineHeight: 1.6, maxWidth: 520, margin: "12px auto 0" }}>
            We check if your email was in any data breaches, then calculate how much financial damage a criminal could do with your stolen info.
          </p>
        </div>

        {/* Input */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 36,
          border: "1px solid #222", borderRadius: 6, overflow: "hidden", background: "#111",
          boxShadow: state === "scanning" ? "0 0 30px rgba(239,68,68,0.12)" : "0 0 20px rgba(0,0,0,0.5)",
          transition: "box-shadow 0.5s",
        }}>
          <div style={{ padding: "16px 14px", color: "#444", fontSize: 16, borderRight: "1px solid #222", display: "flex", alignItems: "center" }}>&gt;_</div>
          <input
            type="email" placeholder="enter your email..." value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleScan()}
            disabled={state === "scanning"}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#00ff41", fontSize: "clamp(15px, 3vw, 18px)", padding: "16px 14px", fontFamily: "inherit",
              opacity: state === "scanning" ? 0.5 : 1,
            }}
          />
          <button onClick={handleScan} disabled={state === "scanning" || !email.includes("@")}
            style={{
              background: state === "scanning" ? "#1a1a1a" : "#ef4444",
              color: state === "scanning" ? "#666" : "#fff",
              border: "none", padding: "16px clamp(16px, 3vw, 28px)", fontSize: "clamp(12px, 2vw, 14px)",
              fontFamily: "inherit", letterSpacing: 2, textTransform: "uppercase",
              cursor: state === "scanning" ? "not-allowed" : "pointer", fontWeight: 700,
              whiteSpace: "nowrap",
            }}>
            {state === "scanning" ? "Scanning..." : "Scan"}
          </button>
        </div>

        {/* Scanning */}
        {state === "scanning" && (
          <div style={{ marginBottom: 36 }}>
            <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2, overflow: "hidden", marginBottom: 16 }}>
              <div style={{
                height: "100%", background: "linear-gradient(90deg, #ef4444, #ff6b6b)",
                width: `${scanProg}%`, transition: "width 0.3s", boxShadow: "0 0 15px rgba(239,68,68,0.4)",
              }} />
            </div>
            <div style={{ fontSize: 14, color: "#ef4444", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1s infinite", display: "inline-block" }} />
              {scanText}
            </div>
          </div>
        )}

        {/* Results — ordered for maximum emotional impact */}
        {state === "results" && (
          <div>

            {/* ——— SECTION 1: BREACH CARDS (personal susceptibility) ——— */}
            {phase >= 1 && (
              <Section title={`🔍 ${breaches.length} data breaches found`} delay={0}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {breaches.map((b, i) => {
                    const visible = i < revealCount;
                    const expanded = expandedBreach === i;
                    const daysBetween = Math.round((new Date(b.disclosed) - new Date(b.date)) / (1000 * 60 * 60 * 24));
                    const perPersonCost = b.soldPrice / b.count;
                    return (
                      <div key={b.name} style={{
                        background: "#111", border: `1px solid ${expanded ? "#333" : "#1a1a1a"}`,
                        borderRadius: 6, overflow: "hidden",
                        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(15px)",
                        transition: "all 0.5s ease", cursor: "pointer",
                      }} onClick={() => setExpandedBreach(expanded ? null : i)}>
                        {/* Header */}
                        <div style={{ padding: "clamp(14px, 3vw, 18px) clamp(14px, 3vw, 20px)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              {b.logo ? (
                                <img src={b.logo} alt="" style={{ width: 28, height: 28, borderRadius: 4, filter: "grayscale(1) brightness(1.5)" }}
                                  onError={e => { e.target.style.display = "none"; }} />
                              ) : (
                                <span style={{ width: 28, height: 28, borderRadius: 4, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>?</span>
                              )}
                              <div>
                                <div style={{ fontWeight: 700, fontSize: "clamp(15px, 3vw, 18px)", color: "#fff" }}>
                                  <GlitchText text={b.name} active={visible && i === revealCount - 1} />
                                </div>
                                <div style={{ fontSize: "clamp(12px, 2vw, 14px)", color: "#555", marginTop: 3 }}>
                                  {new Date(b.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                                  {" · "}{(b.count / 1000000).toFixed(1)}M records stolen
                                </div>
                              </div>
                            </div>
                            <div style={{ fontSize: 13, color: "#444", marginTop: 4, whiteSpace: "nowrap" }}>{expanded ? "▲ less" : "▼ details"}</div>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 12 }}>
                            {b.dataTypes.map(dt => {
                              const p = PRICES[dt];
                              return (
                                <span key={dt} style={{
                                  fontSize: "clamp(10px, 1.8vw, 12px)", padding: "3px 8px", borderRadius: 3,
                                  background: p ? sevColors[p.severity] + "12" : "#222",
                                  color: p ? sevColors[p.severity] : "#555",
                                  border: `1px solid ${p ? sevColors[p.severity] + "25" : "#333"}`,
                                }}>{dt}</span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Expanded forensics */}
                        {expanded && (
                          <div style={{
                            borderTop: "1px solid #1a1a1a", padding: "clamp(14px, 3vw, 20px)",
                            animation: "fadeIn 0.3s ease",
                          }}>
                            <div style={{ marginBottom: 18 }}>
                              <div style={{ fontSize: 12, letterSpacing: 2, color: "#ef4444", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
                                How they got in
                              </div>
                              <div style={{ fontSize: "clamp(13px, 2.5vw, 15px)", color: "#ccc", lineHeight: 1.7 }}>{b.howSimple}</div>
                              <div style={{
                                marginTop: 8, fontSize: 13, color: "#555",
                                padding: "8px 12px", background: "#0a0a0a", borderRadius: 4, display: "inline-block",
                              }}>
                                Technical method: {b.method}
                              </div>
                            </div>

                            <div style={{ marginBottom: 18 }}>
                              <div style={{ fontSize: 12, letterSpacing: 2, color: "#facc15", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
                                Where your data was sold
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {b.soldOn.map(s => (
                                  <span key={s} style={{
                                    fontSize: 13, padding: "5px 10px", background: "#facc1510",
                                    border: "1px solid #facc1525", borderRadius: 4, color: "#facc15",
                                  }}>{s}</span>
                                ))}
                              </div>
                              {b.soldPrice > 0 && (
                                <div style={{ fontSize: 13, color: "#666", marginTop: 8, lineHeight: 1.6 }}>
                                  The full database sold for <span style={{ color: "#facc15" }}>${b.soldPrice.toLocaleString()}</span>.
                                  Your individual record was worth <span style={{ color: "#facc15" }}>${perPersonCost.toFixed(6)}</span>.
                                </div>
                              )}
                            </div>

                            <div style={{ marginBottom: 18 }}>
                              <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
                                How long until they told you
                              </div>
                              <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#999", flexWrap: "wrap" }}>
                                <span style={{ padding: "5px 10px", background: "#111", borderRadius: 4, border: "1px solid #222" }}>
                                  Breached: {new Date(b.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                </span>
                                <span style={{ color: "#333" }}>→</span>
                                <span style={{ padding: "5px 10px", background: "#111", borderRadius: 4, border: "1px solid #222" }}>
                                  Told you: {new Date(b.disclosed).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                </span>
                                <span style={{
                                  padding: "5px 10px", borderRadius: 4, fontWeight: 700, fontSize: 13,
                                  background: daysBetween > 90 ? "#ef444420" : daysBetween > 30 ? "#f9731620" : "#4ade8020",
                                  color: daysBetween > 90 ? "#ef4444" : daysBetween > 30 ? "#f97316" : "#4ade80",
                                }}>
                                  {daysBetween > 365 ? `${(daysBetween / 365).toFixed(1)} YEARS` : `${daysBetween} days`}
                                </span>
                              </div>
                              {daysBetween > 90 && (
                                <div style={{ fontSize: 13, color: "#ef4444", marginTop: 8 }}>
                                  Your data was floating around for {daysBetween > 365 ? `over ${Math.floor(daysBetween / 365)} year${Math.floor(daysBetween / 365) > 1 ? "s" : ""}` : `${daysBetween} days`} before anyone told you.
                                </div>
                              )}
                            </div>

                            <div style={{ marginBottom: 18 }}>
                              <div style={{ fontSize: 12, letterSpacing: 2, color: "#a78bfa", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>
                                Company report card
                              </div>
                              <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                                <GradeBox letter={b.grade.disclosure} label="Speed" />
                                <GradeBox letter={b.grade.compensation} label="Comp" />
                                <GradeBox letter={b.grade.prevention} label="Prevent" />
                                <GradeBox letter={b.grade.overall} label="Overall" />
                              </div>
                              <div style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>
                                {Object.values(b.gradeExplain).map((e, ei) => (
                                  <div key={ei} style={{ marginBottom: 4 }}>• {e}</div>
                                ))}
                              </div>
                            </div>

                            {b.gdprPotential > 0 && (
                              <div style={{
                                padding: "12px 14px", background: "#818cf810", border: "1px solid #818cf822",
                                borderRadius: 6, fontSize: 13, color: "#999", lineHeight: 1.7,
                              }}>
                                🇪🇺 <span style={{ fontWeight: 700, color: "#818cf8" }}>If you lived in Europe:</span> {b.name} could have been fined up to{" "}
                                <span style={{ color: "#818cf8" }}>€{(b.gdprPotential / 1000000).toFixed(0)}M</span> under GDPR.
                                {b.gdprFine ? (
                                  <> They were actually fined <span style={{ color: "#818cf8" }}>€{(b.gdprFine / 1000).toFixed(0)}K</span>.</>
                                ) : (
                                  <> In the US? No federal fine.</>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* ——— SECTION 2: WHAT WAS LEAKED — data types with severity (context before cost) ——— */}
            {phase >= 2 && (
              <Section title={`🏷️ ${getAllTypes().length} types of personal data exposed`} delay={0.1}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {getAllTypes().map(([type, info], i) => (
                    <div key={type} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "clamp(10px, 2vw, 12px) clamp(12px, 2.5vw, 16px)", background: i % 2 === 0 ? "#111" : "#0d0d0d",
                      borderLeft: `3px solid ${sevColors[info.severity]}`,
                      animation: `slideIn 0.25s ease ${i * 0.03}s both`,
                      gap: 8, minWidth: 0,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "clamp(13px, 2.5vw, 15px)", minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: "clamp(16px, 3vw, 20px)", flexShrink: 0 }}>{info.icon}</span>
                        <span style={{ color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{type}</span>
                        <span style={{
                          fontSize: "clamp(9px, 1.5vw, 11px)", padding: "2px 6px", borderRadius: 3,
                          background: sevColors[info.severity] + "22", color: sevColors[info.severity],
                          letterSpacing: 1, textTransform: "uppercase", fontWeight: 700, flexShrink: 0,
                        }}>{info.severity}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: "#444" }}>x{info.count}</span>
                        <span style={{ color: "#ef4444", fontWeight: 700, fontSize: "clamp(12px, 2vw, 14px)", minWidth: 50, textAlign: "right" }}>${info.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: 10, padding: "10px 16px", background: "#0d0d0d", borderRadius: 4,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 13, color: "#666" }}>Dark web value of your data</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#ef4444", fontFamily: "'Space Grotesk', sans-serif" }}>${darkWebPrice.toFixed(2)}</span>
                </div>
              </Section>
            )}

            {/* ——— SECTION 3: THE BIG NUMBER — potential financial damage (anchored by context above) ——— */}
            {phase >= 3 && (
              <div style={{
                background: "linear-gradient(135deg, #1a0000 0%, #0a0a0a 50%, #001a00 100%)",
                border: "1px solid #222", borderRadius: 8, padding: "clamp(28px, 5vw, 40px) clamp(20px, 4vw, 32px)", marginBottom: 36,
                textAlign: "center", animation: "fadeIn 0.8s ease", position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${sevColors[getHighSev()]}, transparent)` }} />
                <div style={{ fontSize: "clamp(12px, 2.5vw, 16px)", letterSpacing: 3, color: sevColors[getHighSev()], textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>
                  Potential financial damage to you
                </div>
                <div style={{
                  fontSize: "clamp(48px, 12vw, 80px)", fontWeight: 800, color: "#fff", margin: "8px 0",
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  textShadow: `0 0 60px ${sevColors[getHighSev()]}33`,
                }}>
                  <CountUp target={totalDamage} duration={2200} prefix="$" decimals={0} />
                </div>
                <div style={{ fontSize: "clamp(13px, 2.5vw, 15px)", color: "#666", marginTop: 6 }}>
                  {breaches.length} breaches · {getAllTypes().length} data types exposed · {activeCount} attack vectors open
                </div>

                {/* Criminal ROI callout */}
                <div style={{
                  marginTop: 20, padding: "clamp(14px, 3vw, 20px)", background: "#ef444410", border: "1px solid #ef444422",
                  borderRadius: 6, lineHeight: 1.7,
                }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: "clamp(16px, 5vw, 40px)", marginBottom: 12 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 800, color: "#4ade80", fontFamily: "'Space Grotesk', sans-serif" }}>${darkWebPrice.toFixed(2)}</div>
                      <div style={{ fontSize: "clamp(10px, 2vw, 13px)", color: "#555", letterSpacing: 1, textTransform: "uppercase" }}>Criminal pays</div>
                    </div>
                    <div style={{ fontSize: "clamp(18px, 4vw, 24px)", color: "#333", alignSelf: "center" }}>→</div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 800, color: "#ef4444", fontFamily: "'Space Grotesk', sans-serif" }}>${totalDamage.toLocaleString()}</div>
                      <div style={{ fontSize: "clamp(10px, 2vw, 13px)", color: "#555", letterSpacing: 1, textTransform: "uppercase" }}>You could lose</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", fontSize: "clamp(13px, 2.5vw, 15px)", color: "#888" }}>
                    {damageComparison.emoji} That's more than <span style={{ color: "#fff", fontWeight: 700 }}>{damageComparison.item}</span>.
                    A criminal spends less than <span style={{ color: "#fff", fontWeight: 700 }}>{darkWebComparison.item}</span> to potentially ruin your finances.
                  </div>
                </div>
              </div>
            )}

            {/* ——— SECTION 4: ATTACK BREAKDOWN — decomposes the big number into concrete threats ——— */}
            {phase >= 4 && (
              <Section title={`⚡ How criminals use your data — ${activeCount} of ${ATTACKS.length} attacks possible`} delay={0.1}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {activeAttacks.map((a, i) => (
                    <div key={i} style={{
                      padding: "clamp(12px, 2.5vw, 16px) clamp(14px, 3vw, 18px)", background: a.active ? "#ef444410" : "#0d0d0d",
                      borderLeft: `3px solid ${a.active ? "#ef4444" : "#1a1a1a"}`,
                      borderRadius: "0 4px 4px 0",
                      opacity: a.active ? 1 : 0.35,
                      animation: `slideIn 0.3s ease ${i * 0.05}s both`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: a.active ? 8 : 0 }}>
                        <span style={{ fontSize: "clamp(18px, 3vw, 22px)" }}>{a.icon}</span>
                        <span style={{ fontSize: "clamp(14px, 2.5vw, 16px)", color: a.active ? "#fff" : "#555", fontWeight: a.active ? 700 : 400, flex: 1 }}>
                          {a.active ? "✓" : "✗"} {a.name}
                        </span>
                        {a.active && a.damageCost && (
                          <span style={{ fontSize: "clamp(14px, 2.5vw, 17px)", fontWeight: 700, color: "#ef4444", fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>
                            ${a.damageCost.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {a.active && (
                        <div style={{ paddingLeft: "clamp(28px, 5vw, 32px)" }}>
                          <div style={{ fontSize: "clamp(13px, 2.5vw, 15px)", color: "#999", lineHeight: 1.7 }}>
                            {a.simple}
                          </div>
                          {a.damageSource && (
                            <div style={{ fontSize: 12, color: "#444", marginTop: 5, fontStyle: "italic" }}>
                              Avg loss: {a.damageSource}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: 12, padding: "clamp(12px, 2.5vw, 16px)", background: "#ef444412", borderRadius: 6,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: "clamp(13px, 2.5vw, 15px)", color: "#888" }}>Total potential exposure from {activeCount} active attacks</span>
                  <span style={{ fontSize: "clamp(18px, 3vw, 22px)", fontWeight: 800, color: "#ef4444", fontFamily: "'Space Grotesk', sans-serif" }}>${totalDamage.toLocaleString()}</span>
                </div>
              </Section>
            )}

            {/* ——— SECTION 5: CEO PAY vs YOUR SETTLEMENT (rage/share trigger) ——— */}
            {phase >= 4 && getTotalCeoPay() > 0 && (
              <Section title="💰 What the CEOs made vs what you got" delay={0.2}>
                <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                  <div style={{
                    flex: "1 1 200px", background: "#ef444415", border: "1px solid #ef444433", borderRadius: 6,
                    padding: "clamp(16px, 3vw, 24px)", textAlign: "center",
                  }}>
                    <div style={{ fontSize: "clamp(10px, 2vw, 12px)", letterSpacing: 2, color: "#ef4444", textTransform: "uppercase", marginBottom: 8 }}>CEO pay (combined)</div>
                    <div style={{ fontSize: "clamp(26px, 5vw, 32px)", fontWeight: 800, color: "#ef4444", fontFamily: "'Space Grotesk', sans-serif" }}>
                      ${(getTotalCeoPay() / 1000000).toFixed(1)}M
                    </div>
                    <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>The year your data got stolen</div>
                  </div>
                  <div style={{
                    flex: "1 1 200px", background: "#4ade8015", border: "1px solid #4ade8033", borderRadius: 6,
                    padding: "clamp(16px, 3vw, 24px)", textAlign: "center",
                  }}>
                    <div style={{ fontSize: "clamp(10px, 2vw, 12px)", letterSpacing: 2, color: "#4ade80", textTransform: "uppercase", marginBottom: 8 }}>Your settlement</div>
                    <div style={{ fontSize: "clamp(26px, 5vw, 32px)", fontWeight: 800, color: "#4ade80", fontFamily: "'Space Grotesk', sans-serif" }}>
                      ${getTotalSettlement().toFixed(2)}
                    </div>
                    <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>Total you got from all class actions</div>
                  </div>
                </div>
                <div style={{ fontSize: "clamp(13px, 2.5vw, 15px)", color: "#666", lineHeight: 1.7, padding: "14px 16px", background: "#111", borderRadius: 6 }}>
                  The people in charge made <span style={{ color: "#fff", fontWeight: 700 }}>
                  {getTotalSettlement() > 0
                    ? `${Math.round(getTotalCeoPay() / Math.max(getTotalSettlement(), 0.01)).toLocaleString()}x`
                    : "millions of dollars"
                  }</span> {getTotalSettlement() > 0 ? "more than you got as compensation" : "while you got absolutely nothing"}. They kept their jobs. You got a "we take your privacy seriously" email.
                </div>
              </Section>
            )}

            {/* ——— SECTION 6: RECEIPT (shareable artifact) ——— */}
            {phase >= 5 && (
              <Section title="🧾 Your data receipt" delay={0.2}>
                <div
                  style={{
                    background: "#f5f0e8", color: "#222", fontFamily: "'Courier New', monospace",
                    padding: "clamp(20px, 4vw, 28px) clamp(16px, 3vw, 24px)", borderRadius: 6, maxWidth: 420, margin: "0 auto",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
                  }}>
                  <div style={{ textAlign: "center", borderBottom: "1px dashed #999", paddingBottom: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>☠ DARK WEB MARKET ☠</div>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Identity Package #4,827,193</div>
                    <div style={{ fontSize: 11, color: "#666" }}>{new Date().toLocaleDateString()}</div>
                  </div>
                  {getAllTypes().map(([type, info]) => (
                    <div key={type} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", color: "#333" }}>
                      <span>{type}</span>
                      <span>${info.price.toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px dashed #999", marginTop: 12, paddingTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
                      <span>DARK WEB PRICE</span>
                      <span>${darkWebPrice.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", padding: "4px 0" }}>
                      <span>What a criminal pays for you</span>
                      <span>({breaches.length} breaches)</span>
                    </div>
                    <div style={{ borderTop: "1px dashed #999", marginTop: 10, paddingTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", padding: "4px 0" }}>
                        <span>Active attack vectors</span>
                        <span>{activeCount}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, borderTop: "2px solid #c0392b", marginTop: 10, paddingTop: 10, color: "#c0392b" }}>
                      <span>YOUR EXPOSURE</span>
                      <span>${totalDamage.toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#888", textAlign: "center", marginTop: 6 }}>
                      Potential financial damage to you
                    </div>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 16, borderTop: "1px dashed #999", paddingTop: 14 }}>
                    <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6 }}>
                      Criminal investment: ${darkWebPrice.toFixed(2)}
                      <br />Criminal ROI: {Math.round(totalDamage / Math.max(darkWebPrice, 0.01)).toLocaleString()}x return
                      <br />Your CEOs made ${(getTotalCeoPay() / 1000000).toFixed(1)}M
                      <br />You got ${getTotalSettlement().toFixed(2)} in settlements
                      <br />Thank you for being the product ♥
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* ——— SECTION 7: PROTECTION / CTA (efficacy — the resolution) ——— */}
            {phase >= 5 && (
              <div data-section="protect">
              <Section title={`🛡️ Reduce your exposure — save up to $${totalDamage.toLocaleString()}`} delay={0.3}>
                <div style={{
                  padding: "clamp(14px, 3vw, 18px)", background: "#ef444412", border: "1px solid #ef444425",
                  borderRadius: 6, marginBottom: 14, fontSize: "clamp(13px, 2.5vw, 15px)", color: "#ccc", lineHeight: 1.7, textAlign: "center",
                }}>
                  Your data is already out there. You can't undo the breaches — but you can <span style={{ color: "#fff", fontWeight: 700 }}>shut down the attack vectors</span> before someone uses them.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    {
                      action: "Remove your data from broker sites",
                      why: "Data brokers are selling your personal info legally right now. Incogni contacts them on your behalf and forces them to delete it. Covers 180+ brokers automatically.",
                      link: "https://get.incogni.io/aff_c?offer_id=1151&aff_id=34653",
                      linkLabel: "Get Incogni (55% off)",
                      saves: "Blocks identity theft, targeted scams, and physical stalking",
                      urgent: true, featured: true,
                    },
                    {
                      action: "Get a password manager — stop reusing passwords",
                      why: "Your leaked password works on every site where you used it. A password manager creates unique passwords for everything and remembers them all. 1Password is the gold standard.",
                      link: "https://1password.com",
                      linkLabel: "Get 1Password",
                      saves: "Blocks account takeover, email compromise, and cloud storage theft",
                      urgent: true, featured: true,
                    },
                    {
                      action: "Encrypt your internet connection with a VPN",
                      why: "Your IP address and browsing habits are leaked. A VPN encrypts all your traffic so your ISP, hackers on public wifi, and trackers can't see what you're doing.",
                      link: "https://nordvpn.com",
                      linkLabel: "Get NordVPN (up to 72% off)",
                      saves: "Blocks traffic interception, IP tracking, and public wifi attacks",
                      urgent: true, featured: true,
                    },
                    {
                      action: "Freeze your credit at all 3 bureaus (free)",
                      why: "This stops anyone from opening credit cards or loans in your name. It's free and takes 5 minutes per bureau.",
                      link: "https://www.annualcreditreport.com",
                      linkLabel: "AnnualCreditReport.com",
                      saves: "Blocks new credit cards, fraudulent loans, and tax fraud",
                      urgent: true,
                    },
                    {
                      action: "Turn on 2-factor authentication everywhere",
                      why: "Even if someone has your password, they can't log in without your phone. Start with email — that's the master key to everything.",
                      link: null,
                      saves: "Blocks account takeover even with stolen passwords",
                      urgent: true,
                    },
                    {
                      action: "Set up identity theft monitoring",
                      why: "Get alerts if someone tries to open accounts, take loans, or file taxes using your info. Aura monitors your credit, SSN, bank accounts, and the dark web in real time.",
                      link: "https://www.aura.com",
                      linkLabel: "Try Aura (14-day free trial)",
                      saves: "Early warning on fraudulent accounts and credit changes",
                      urgent: false, featured: true,
                    },
                    {
                      action: "Remove your data from even more brokers",
                      why: "DeleteMe manually removes your info from 750+ data broker sites and re-checks every quarter to make sure it stays deleted.",
                      link: "https://joindeleteme.com",
                      linkLabel: "Get DeleteMe (20% off)",
                      saves: "Deeper broker removal coverage — works alongside Incogni",
                      urgent: false,
                    },
                    {
                      action: "Check if your passwords have been leaked",
                      why: "Even passwords you think are safe might be in breach databases. Check them without exposing them using k-anonymity.",
                      link: "https://haveibeenpwned.com/Passwords",
                      linkLabel: "HaveIBeenPwned Passwords (free)",
                      saves: "Identify which passwords need changing right now",
                      urgent: false,
                    },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: "clamp(14px, 3vw, 18px)",
                      background: item.featured ? "#0a1a0f" : item.urgent ? "#ef444408" : "#111",
                      border: `1px solid ${item.featured ? "#4ade8033" : item.urgent ? "#ef444425" : "#1a1a1a"}`,
                      borderRadius: 6,
                      animation: `slideIn 0.3s ease ${i * 0.08}s both`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                        {item.urgent && <span style={{
                          fontSize: "clamp(9px, 1.5vw, 11px)", padding: "3px 8px", borderRadius: 3,
                          background: item.featured ? "#4ade8022" : "#ef444422",
                          color: item.featured ? "#4ade80" : "#ef4444",
                          fontWeight: 700, letterSpacing: 1,
                        }}>{item.featured ? "RECOMMENDED" : "URGENT"}</span>}
                        <span style={{ fontSize: "clamp(14px, 2.5vw, 16px)", color: "#fff", fontWeight: 700 }}>{item.action}</span>
                      </div>
                      <div style={{ fontSize: "clamp(13px, 2.5vw, 15px)", color: "#888", lineHeight: 1.7 }}>{item.why}</div>
                      {item.saves && (
                        <div style={{ fontSize: "clamp(12px, 2vw, 13px)", color: "#4ade80", marginTop: 8, opacity: 0.8 }}>
                          ✓ {item.saves}
                        </div>
                      )}
                      {item.link && (
                        <div style={{ marginTop: 10 }}>
                          <span style={{
                            fontSize: "clamp(13px, 2.5vw, 15px)",
                            color: item.featured ? "#111" : "#4ade80",
                            background: item.featured ? "#4ade80" : "transparent",
                            padding: item.featured ? "10px 20px" : "0",
                            borderRadius: item.featured ? 6 : 0,
                            fontWeight: item.featured ? 700 : 400,
                            cursor: "pointer",
                            borderBottom: item.featured ? "none" : "1px solid #4ade8044",
                            paddingBottom: item.featured ? undefined : 2,
                            display: "inline-block",
                          }}
                            onClick={e => { e.stopPropagation(); window.open(item.link, "_blank"); }}>
                            {item.featured ? (item.linkLabel || "Get started →") : `→ ${item.linkLabel || item.link.replace("https://", "")}`}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
              </div>
            )}

            {/* ——— DISCLAIMER ——— */}
            {phase >= 5 && (
              <div style={{
                padding: "16px 18px", background: "#0d0d0d", border: "1px solid #1a1a1a",
                borderRadius: 6, fontSize: 13, color: "#444", lineHeight: 1.7,
                animation: "fadeIn 0.6s ease 0.5s both",
              }}>
                <strong style={{ color: "#555" }}>How this works:</strong> Breach data from HaveIBeenPwned.
                Dark web prices from Privacy Affairs Dark Web Price Index and Comparitech research reports.
                Financial exposure estimates based on FTC Consumer Sentinel, FBI IC3 Annual Reports, and IRS data.
                Figures are averages — actual losses vary. This tool uses demo data — connect a HIBP API key for real results.
              </div>
            )}
          </div>
        )}

        {/* Idle state */}
        {state === "idle" && (
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(16px, 4vw, 32px)", flexWrap: "wrap", marginBottom: 32 }}>
              {[
                { v: "$12,000", l: "Account takeover" }, { v: "$48,000", l: "SIM swap" }, { v: "$16,000", l: "Tax fraud" },
                { v: "$10,000", l: "Credit card fraud" }, { v: "$32,000", l: "Bank drain" }, { v: "$11,000", l: "Email hijack" },
              ].map(x => (
                <div key={x.l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(16px, 3vw, 22px)", fontWeight: 800, color: "#ef4444", fontFamily: "'Space Grotesk', sans-serif" }}>{x.v}</div>
                  <div style={{ fontSize: "clamp(9px, 1.5vw, 11px)", color: "#444", marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>{x.l}</div>
                </div>
              ))}
            </div>
            <p style={{ color: "#444", fontSize: 13 }}>Try any email — uses demo breach data for privacy.</p>
          </div>
        )}
      </div>

      {/* ——— STICKY CTA BAR ——— */}
      {showStickyCta && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99,
          background: "linear-gradient(180deg, transparent 0%, #0a0a0a 20%)",
          padding: "20px 0 0",
        }}>
          <div style={{
            maxWidth: 760, margin: "0 auto", padding: "14px clamp(16px, 4vw, 24px)",
            background: "#111", borderTop: "1px solid #ef444433",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            flexWrap: "wrap",
          }}>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <div style={{ fontSize: "clamp(14px, 2.5vw, 16px)", color: "#fff", fontWeight: 700 }}>
                Your exposure: <span style={{ color: "#ef4444" }}>${totalDamage.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: "clamp(11px, 2vw, 13px)", color: "#666", marginTop: 2 }}>
                Criminals pay ${darkWebPrice.toFixed(2)} for your data
              </div>
            </div>
            <span style={{
              fontSize: "clamp(13px, 2.5vw, 15px)", fontWeight: 700, color: "#111", background: "#4ade80",
              padding: "12px clamp(16px, 3vw, 24px)", borderRadius: 6, cursor: "pointer",
              whiteSpace: "nowrap", textAlign: "center", flex: "0 0 auto",
            }}
              onClick={() => {
                const el = document.querySelector('[data-section="protect"]');
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}>
              Protect yourself →
            </span>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Space+Grotesk:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: #555; font-size: clamp(14px, 2.5vw, 16px); }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 3px; }
      `}</style>
    </div>
  );
}
