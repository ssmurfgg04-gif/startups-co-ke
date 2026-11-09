// Day4d: 20 county high delivery
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
  { name: "Embu County Innovation", sector: "County", email: "info@embu.go.ke", highlight: "Embu startups that need investor visibility" },
  { name: "Tharaka Nithi County Innovation", sector: "County", email: "info@tharakadistrict.go.ke", highlight: "Tharaka founders who need market proof" },
  { name: "Kirinyaga County Innovation", sector: "County", email: "info@kirinyaga.go.ke", highlight: "Kirinyaga agri ventures that need buyer proof" },
  { name: "Murang'a County Innovation", sector: "County", email: "info@muranga.go.ke", highlight: "Murang'a SMEs that need lender trust" },
  { name: "Nyandarua County Innovation", sector: "County", email: "info@nyandarua.go.ke", highlight: "Nyandarua farmers who need funding visibility" },
  { name: "Kajiado County Innovation", sector: "County", email: "info@kajiado.go.ke", highlight: "Kajiado founders who need investor access" },
  { name: "Trans Nzoia County Innovation", sector: "County", email: "info@transnzoia.go.ke", highlight: "Trans Nzoia SMEs that need market proof" },
  { name: "Bungoma County Innovation", sector: "County", email: "info@bungoma.go.ke", highlight: "Bungoma founders who need deal flow" },
  { name: "Baringo County Innovation", sector: "County", email: "info@baringo.go.ke", highlight: "Baringo SMEs that need buyer visibility" },
  { name: "West Pokot County Innovation", sector: "County", email: "info@westpokot.go.ke", highlight: "West Pokot founders who need funding proof" },
  { name: "Makueni County Innovation", sector: "County", email: "info@makueni.go.ke", highlight: "Makueni startups that need investor proof" },
  { name: "Kitui County Innovation", sector: "County", email: "info@kitui.go.ke", highlight: "Kitui founders who need market access" },
  { name: "Nyamira County Innovation", sector: "County", email: "info@nyamira.go.ke", highlight: "Nyamira SMEs that need lender trust" },
  { name: "Homa Bay County Trade", sector: "County", email: "info@homabay.go.ke", highlight: "lake region founders who need investor proof" },
  { name: "Nyeri County Trade", sector: "County", email: "info@nyeri.go.ke", highlight: "central Kenya founders who need capital visibility" },
  { name: "Vihiga County Trade", sector: "County", email: "info@vihiga.go.ke", highlight: "Vihiga founders who need deal flow" },
  { name: "Migori County Innovation", sector: "County", email: "info@migori.go.ke", highlight: "Migori SMEs that need buyer proof" },
  { name: "Kakamega County Innovation Desk", sector: "County", email: "innovation@kakamega.go.ke", highlight: "Western startups that need funding proof" },
  { name: "Kwale County Trade", sector: "County", email: "info@kwale.go.ke", highlight: "Kwale SMEs that need funding visibility" },
  { name: "Lamu County Trade", sector: "County", email: "info@lamu.go.ke", highlight: "Lamu traders that need market proof" },
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
