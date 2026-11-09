// Day4b: 50 more, .ac.ke/.go.ke only for high delivery, deduped
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
  { name: "Kibabuni University Innovation Hub", sector: "University Centre", email: "info@kibabuni.ac.ke", highlight: "coastal student founders who need Nairobi investor eyes" },
  { name: "Pwani University Innovation Hub", sector: "University Centre", email: "info@pu.ac.ke", highlight: "blue economy students who need funding proof" },
  { name: "Kabarak University Innovation Hub", sector: "University Centre", email: "info@kabarak.ac.ke", highlight: "Nakuru student founders who need national visibility" },
  { name: "Rongo University Innovation Hub", sector: "University Centre", email: "info@rongo.ac.ke", highlight: "Migori student ventures that need deal flow" },
  { name: "Alupe University Innovation Hub", sector: "University Centre", email: "info@alupe.ac.ke", highlight: "Busia agri-tech students who need buyer proof" },
  { name: "Kisii University Innovation Hub", sector: "University Centre", email: "info@kisiiuniversity.ac.ke", highlight: "Gusii ventures that need investor verification" },
  { name: "University of Eldoret Innovation Hub", sector: "University Centre", email: "info@ueab.ac.ke", highlight: "Rift Valley founders who need capital access" },
  { name: "Murang'a University Innovation Hub", sector: "University Centre", email: "info@mut.ac.ke", highlight: "engineering prototypes that need commercialization proof" },
  { name: "Laikipia University Innovation Hub", sector: "University Centre", email: "info@laikipia.ac.ke", highlight: "student SMEs that need lender trust" },
  { name: "Chuka University Innovation Hub", sector: "University Centre", email: "info@chuka.ac.ke", highlight: "Tharaka agri ventures that need funding visibility" },
  { name: "Meru University Innovation Hub", sector: "University Centre", email: "info@must.ac.ke", highlight: "Mount Kenya founders who need market proof" },
  { name: "Maasai Mara University Innovation Hub", sector: "University Centre", email: "info@mmarau.ac.ke", highlight: "Narok startups that need investor access" },
  { name: "Kirinyaga University Innovation Hub", sector: "University Centre", email: "info@kirinyaga.ac.ke", highlight: "agri-tech spin-outs that need buyer verification" },
  { name: "Technical University of Mombasa Innovation Hub", sector: "University Centre", email: "info@tum.ac.ke", highlight: "Mombasa student tech that need funding visibility" },
  { name: "Dedan Kimathi Innovation Hub", sector: "University Centre", email: "info@dekut.ac.ke", highlight: "engineering spin-outs that need investor proof" },
  { name: "South Eastern Kenya University Innovation Hub", sector: "University Centre", email: "info@seku.ac.ke", highlight: "dryland founders who need research commercialization proof" },
  { name: "Jaramogi Oginga Odinga University Innovation Hub", sector: "University Centre", email: "info@joust.ac.ke", highlight: "Siaya student ventures that need deal flow" },
  { name: "Kabianga University Innovation Hub", sector: "University Centre", email: "info@kabianga.ac.ke", highlight: "Kericho founders who need national visibility" },
  { name: "Tangaza University Innovation", sector: "University Centre", email: "info@tangaza.ac.ke", highlight: "postgraduate ventures that need investor proof" },
  { name: "Gretsa University Innovation Hub", sector: "University Centre", email: "info@gretsauniversity.ac.ke", highlight: "student farmers who need buyer proof" },
  { name: "East African University Innovation", sector: "University Centre", email: "info@eau.ac.ke", highlight: "Kiambu student founders who need funding visibility" },
  { name: "Scott Christian University Innovation", sector: "University Centre", email: "info@scott.ac.ke", highlight: "Machakos student ventures that need lender trust" },
  { name: "Zetech University Innovation Centre", sector: "University Centre", email: "info@zetechuniversity.ac.ke", highlight: "tech students who need employer proof" },
  { name: "Mount Kenya University Innovation Centre", sector: "University Centre", email: "info@mku.ac.ke", highlight: "broad student founders who need national record" },
  { name: "Riara University Innovation Centre", sector: "University Centre", email: "info@riarauniversity.ac.ke", highlight: "enterprise students who need investor visibility" },

  { name: "Nairobi County Trade Innovation", sector: "County", email: "info@nairobi.go.ke", highlight: "Nairobi SMEs that need investor showcase" },
  { name: "Kiambu County Innovation", sector: "County", email: "info@kiambu.go.ke", highlight: "Kiambu founders who need national deal flow" },
  { name: "Mombasa County Investment", sector: "County", email: "info@mombasa.go.ke", highlight: "coastal SMEs that need buyer proof" },
  { name: "Kisumu County Innovation", sector: "County", email: "info@kisumu.go.ke", highlight: "Kisumu startups that need investor visibility" },
  { name: "Uasin Gishu County Innovation", sector: "County", email: "info@uasinngishu.go.ke", highlight: "Eldoret founders who need capital access" },
  { name: "Nakuru County Investment", sector: "County", email: "info@nakuru.go.ke", highlight: "Nakuru SMEs that need sourced national record" },
  { name: "Kakamega County Innovation", sector: "County", email: "info@kakamega.go.ke", highlight: "Western startups that need funding proof" },
  { name: "Meru County Innovation", sector: "County", email: "info@meru.go.ke", highlight: "Meru ventures that need market proof" },
  { name: "Machakos County Innovation", sector: "County", email: "info@machakos.go.ke", highlight: "Ukambani founders who need investor visibility" },
  { name: "Kilifi County Innovation", sector: "County", email: "info@kilifi.go.ke", highlight: "coastal startups that need national showcase" },
  { name: "Nyeri County Innovation", sector: "County", email: "info@nyeri.go.ke", highlight: "central Kenya founders who need capital visibility" },
  { name: "Homa Bay County Innovation", sector: "County", email: "info@homabay.go.ke", highlight: "lake region founders who need investor proof" },
  { name: "Busia County Innovation", sector: "County", email: "info@busia.go.ke", highlight: "border traders who need market visibility" },
  { name: "Siaya County Innovation", sector: "County", email: "info@siaya.go.ke", highlight: "Siaya SMEs that need lender trust" },
  { name: "Vihiga County Innovation", sector: "County", email: "info@vihiga.go.ke", highlight: "Vihiga founders who need deal flow" },

  { name: "Kenya Investment Authority Innovation Desk", sector: "Government", email: "info@keninvest.go.ke", highlight: "investor ready SMEs that need sourced record" },
  { name: "Kenya National Innovation Agency County Desk", sector: "Government", email: "info@knia.go.ke", highlight: "county founders who need national proof" },
  { name: "Konza Technopolis Tenant Desk", sector: "Government", email: "info@konza.go.ke", highlight: "tech tenants who need client verification" },
  { name: "Kenya ICT Authority Startup Desk", sector: "Government", email: "info@ict.go.ke", highlight: "digital startups that need policy maker visibility" },
  { name: "Kenya Industrial Research Institute Startup Desk", sector: "Government", email: "info@kirdi.go.ke", highlight: "lab spin-outs that need commercialization proof" },
  { name: "Kenya Agricultural Research Startup Desk", sector: "Government", email: "info@kalro.org", highlight: "agri spin-outs that need buyer proof" },
  { name: "Kenya Revenue Authority Startup Tax Desk", sector: "Government", email: "info@kra.go.ke", highlight: "founders who need tax compliant public record" },
  { name: "Central Bank of Kenya Fintech Desk", sector: "Government", email: "info@centralbank.go.ke", highlight: "fintech founders who need regulator trust proof" },
  { name: "Kenya Bankers Association Fintech Desk", sector: "Association", email: "info@kba.co.ke", highlight: "bank fintech partners who need verified record" },
  { name: "Kenya Association of Manufacturers Startup Desk", sector: "Association", email: "info@kea.com", highlight: "industrial SMEs that need buyer visibility" },
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
