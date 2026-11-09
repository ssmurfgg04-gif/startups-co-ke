// Outreach Day 4: 50 new institutions, distinct from prior 171 rows.
// Mid tier that need deal flow, not big brands. Personalized need each.
import fs from "node:fs";

const _envKey = process.env.RESEND_API_KEY || "";
const keySrc = _envKey ? "re_x" : (fs.existsSync("scripts/send_outreach.mjs") ? fs.readFileSync("scripts/send_outreach.mjs", "utf8") : "");
const m = _envKey ? [_envKey] : keySrc.match(/re_[A-Za-z0-9_]+/);
if (!m) throw new Error("Resend key not found in send_outreach.mjs");
const RESEND_KEY = m[0];
const FROM = "startups.co.ke <notices@startups.co.ke>";
const REPLY_TO = "notices@startups.co.ke";
const SITE = "https://startups.co.ke/startups/community";
const today = new Date().toISOString().slice(0, 10);

const targets = [
  { name: "Kenyatta University Chandaria Centre", sector: "University Centre", email: "info@ku.ac.ke", highlight: "student ventures that need investor proof beyond campus" },
  { name: "JKUAT Incubation Centre", sector: "University Centre", email: "info@jkuat.ac.ke", highlight: "agri-tech prototypes that need buyer verification" },
  { name: "Daystar Innovation Hub", sector: "University Centre", email: "info@daystar.ac.ke", highlight: "media and tech students that need founder visibility" },
  { name: "USIU Innovation Centre", sector: "University Centre", email: "info@usiu.ac.ke", highlight: "student builders who need a sourced national record" },
  { name: "Strathmore iLabAfrica", sector: "University Centre", email: "info@strathmore.edu", highlight: "research spin-outs that need commercialization proof" },
  { name: "University of Nairobi Innovation Hub", sector: "University Centre", email: "info@uonbi.ac.ke", highlight: "lab spin-outs that need investor verification" },
  { name: "Pan African Christian University Innovation", sector: "University Centre", email: "info@pacuniversity.ac.ke", highlight: "student SMEs that need lender trust" },
  { name: "Africa Nazarene University Innovation", sector: "University Centre", email: "info@anu.ac.ke", highlight: "student ventures that need market proof" },
  { name: "East African University Innovation", sector: "University Centre", email: "info@eau.ac.ke", highlight: "student founders who need deal flow" },
  { name: "Gretsa University Innovation", sector: "University Centre", email: "info@gretsauniversity.ac.ke", highlight: "student agri ventures that need funding visibility" },

  { name: "Nairobi County Trade Department", sector: "County", email: "info@nairobi.go.ke", highlight: "Nairobi SMEs that need investor showcase" },
  { name: "Kiambu County Trade Department", sector: "County", email: "info@kiambu.go.ke", highlight: "Kiambu founders who need national deal flow" },
  { name: "Mombasa County Trade Department", sector: "County", email: "info@mombasa.go.ke", highlight: "coastal SMEs that need buyer proof" },
  { name: "Kisumu County Trade Department", sector: "County", email: "info@kisumu.go.ke", highlight: "Kisumu startups that need investor visibility" },
  { name: "Uasin Gishu County Trade", sector: "County", email: "info@uasinngishu.go.ke", highlight: "Eldoret founders who need capital access" },
  { name: "Nakuru County Trade Department", sector: "County", email: "info@nakuru.go.ke", highlight: "Nakuru SMEs that need sourced national record" },
  { name: "Kakamega County Trade", sector: "County", email: "info@kakamega.go.ke", highlight: "Western startups that need funding proof" },
  { name: "Meru County Trade", sector: "County", email: "info@meru.go.ke", highlight: "Meru ventures that need market proof" },
  { name: "Machakos County Trade", sector: "County", email: "info@machakos.go.ke", highlight: "Ukambani founders who need investor visibility" },
  { name: "Kilifi County Trade", sector: "County", email: "info@kilifi.go.ke", highlight: "coastal startups that need national showcase" },

  { name: "Kenya Association of Software Companies", sector: "Association", email: "info@kasitow.org", highlight: "member firms that need client proof" },
  { name: "Kenya Association of Manufacturers", sector: "Association", email: "info@kea.com", highlight: "industrial SMEs that need buyer visibility" },
  { name: "Federation of East Africa Freight Forwarders", sector: "Association", email: "info@feaforg.com", highlight: "logistics SMEs that need shipper trust" },
  { name: "Kenya Association of Realtors", sector: "Association", email: "info@karanet.org", highlight: "proptech members who need market proof" },
  { name: "Kenya Association of Private Hospitals", sector: "Association", email: "info@kashp.co.ke", highlight: "health tech members who need funder proof" },
  { name: "Kenya Flower Growers Association", sector: "Association", email: "info@kenyaflowerexporters.org", highlight: "horticulture SMEs that need export buyer trust" },
  { name: "Kenya Dairy Farmers Federation", sector: "Association", email: "info@kdf.org.ke", highlight: "dairy SMEs that need market visibility" },
  { name: "Kenya Coffee Growers Association", sector: "Association", email: "info@kcgc.co.ke", highlight: "coffee SMEs that need premium buyer proof" },
  { name: "Kenya Association of Travel Agents", sector: "Association", email: "info@kata.co.ke", highlight: "travel tech members who need client trust" },
  { name: "Kenya Renewable Energy Association", sector: "Association", email: "info@kerea.co.ke", highlight: "solar members who need investor verification" },

  { name: "Equity Bank Innovation Unit", sector: "Corporate", email: "info@equitybank.co.ke", highlight: "fintech pilots that need startup pipeline proof" },
  { name: "KCB Innovation Unit", sector: "Corporate", email: "info@kcbgroup.com", highlight: "fintech ventures that need verified local record" },
  { name: "Absa Innovation Lab", sector: "Corporate", email: "info@absa.africa", highlight: "bank tech pilots that need founder visibility" },
  { name: "Co-op Bank Innovation", sector: "Corporate", email: "info@coopbank.co.ke", highlight: "SME tech that need lender trust" },
  { name: "NCBA Innovation", sector: "Corporate", email: "info@ncbagroup.com", highlight: "payment startups that need market proof" },
  { name: "Safaricom Spark", sector: "Corporate", email: "info@safaricom.co.ke", highlight: "startup partners that need public verification" },
  { name: "KenyaPipeline Company", sector: "Corporate", email: "info@kpc.co.ke", highlight: "energy tech that need investor proof" },
  { name: "Kenya Power Innovation", sector: "Corporate", email: "info@kplc.co.ke", highlight: "energy startups that need pilot visibility" },
  { name: "M-Pesa Africa Innovation", sector: "Corporate", email: "info@safaricom.co.ke", highlight: "M-Pesa partners that need sourced record" },
  { name: "Airtel Africa Innovation", sector: "Corporate", email: "info@airtel.com", highlight: "telco startups that need deal flow proof" },

  { name: "TechCabal Kenya Desk", sector: "Media", email: "info@techcabal.com", highlight: "storytellers who need founder sourced data" },
  { name: "WeeTracker Kenya", sector: "Media", email: "info@weetracker.com", highlight: "deal coverage that needs founder verified data" },
  { name: "Disrupt Africa Kenya", sector: "Media", email: "info@disruptafrica.com", highlight: "startup coverage that needs sourced profiles" },
  { name: "Kenyan Wall Street", sector: "Media", email: "info@kenyanwallstreet.com", highlight: "business readers who need startup data" },
  { name: "Business Daily Kenya", sector: "Media", email: "info@businessdailyafrica.com", highlight: "corporate readers who need startup intel" },
  { name: "Capital FM Kenya", sector: "Media", email: "info@capitalfm.co.ke", highlight: "youth audience that needs founder stories" },
  { name: "Kahawa Tungu", sector: "Media", email: "info@kahawatungu.com", highlight: "policy readers who need startup accountability data" },
  { name: "HackWithHer Kenya", sector: "Community", email: "info@hackwithher.co.ke", highlight: "women hackers who need investor proof" },
  { name: "Women in Tech Kenya", sector: "Community", email: "info@womenintech.co.ke", highlight: "women founders who need funding visibility" },
  { name: "Nairobi Gov Code", sector: "Community", email: "info@nairobgovcode.org", highlight: "civic hackers who need public record proof" },
];

function makeEmail(t) {
  const subject = `${t.name} on the Kenya startup record`;
  const text = `Hi ${t.name} team,

I run startups.co.ke, the public record of Kenyan startups. What they raised, from whom, sourced.

Your ${t.highlight} caught my eye. Your ventures get a permanent sourced page investors verify in seconds. 3 minutes, free, live now.

List here: ${SITE}

No cost, no queue, live immediately.

Best,
The startups.co.ke desk
notices@startups.co.ke`;
  return { to: t.email, subject, text };
}

function csvEsc(s) { return JSON.stringify(s ?? ""); }

async function sendBatch(messages) {
  const res = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(messages.map(m => ({ from: FROM, to: m.to, subject: m.subject, text: m.text, reply_to: REPLY_TO }))),
  });
  const body = await res.text();
  let parsed;
  try { parsed = JSON.parse(body); } catch { parsed = { raw: body }; }
  if (!res.ok) throw new Error(`Resend ${res.status}: ${body}`);
  return parsed;
}

(async () => {
  const csvPath = "qa/outreach/outreach_log.csv";
  let existing = "";
  try { existing = fs.readFileSync(csvPath, "utf8"); } catch {}
  const sentEmails = new Set();
  const lines = existing.split(/\r?\n/).filter(Boolean);
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    const emailRaw = (parts[4] || "").replace(/^"|"$/g, "").trim().toLowerCase();
    if (emailRaw) sentEmails.add(emailRaw);
  }
  const uniq = [];
  const seen = new Set();
  for (const t of targets) {
    const e = t.email.toLowerCase();
    if (sentEmails.has(e)) { console.log(`skip already sent: ${t.name} <${t.email}>`); continue; }
    if (seen.has(e)) continue;
    seen.add(e);
    uniq.push(t);
  }
  console.log(`targets: ${targets.length}, unique new: ${uniq.length}`);
  if (uniq.length === 0) { console.log("DONE nothing to send"); return; }
  const chunkSize = 25;
  let sent = 0, failed = 0;
  const newRows = [];
  for (let i = 0; i < uniq.length; i += chunkSize) {
    const chunk = uniq.slice(i, i + chunkSize);
    const msgs = chunk.map(makeEmail);
    try {
      const r = await sendBatch(msgs);
      const ids = (r.data || []).map(x => x.id);
      chunk.forEach((t, idx) => {
        newRows.push(`${today},${new Date().toISOString()},${csvEsc(t.name)},${t.sector},${t.email},${csvEsc(msgs[idx].subject)},sent,${ids[idx] || ""},`);
        sent++;
      });
      console.log(`chunk ${i / chunkSize + 1}: sent ${chunk.length}`);
    } catch (e) {
      console.error(`chunk ${i / chunkSize + 1} failed:`, e.message);
      chunk.forEach((t, idx) => {
        newRows.push(`${today},${new Date().toISOString()},${csvEsc(t.name)},${t.sector},${t.email},${csvEsc(msgs[idx].subject)},failed,,`);
        failed++;
      });
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  if (newRows.length) {
    fs.appendFileSync(csvPath, (existing.endsWith("\n") || existing === "" ? "" : "\n") + newRows.join("\n") + "\n");
  }
  console.log(`DONE sent=${sent} failed=${failed} total_new=${uniq.length}`);
})();
