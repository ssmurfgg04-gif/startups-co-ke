// Day4c: 50 fresh mailboxes, .ac.ke/.go.ke, deduped
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
  { name: "Kibabuni University Innovation Desk", sector: "University Centre", email: "innovation@kibabuni.ac.ke", highlight: "coastal student founders who need Nairobi investor eyes" },
  { name: "Pwani University Innovation Desk", sector: "University Centre", email: "innovation@pu.ac.ke", highlight: "blue economy students who need funding proof" },
  { name: "Kabarak University Innovation Desk", sector: "University Centre", email: "innovation@kabarak.ac.ke", highlight: "Nakuru student founders who need national visibility" },
  { name: "Rongo University Innovation Desk", sector: "University Centre", email: "innovation@rongo.ac.ke", highlight: "Migori student ventures that need deal flow" },
  { name: "Alupe University Innovation Desk", sector: "University Centre", email: "innovation@alupe.ac.ke", highlight: "Busia agri-tech students who need buyer proof" },
  { name: "Kisii University Innovation Desk", sector: "University Centre", email: "innovation@kisiiuniversity.ac.ke", highlight: "Gusii ventures that need investor verification" },
  { name: "University of Eldoret Innovation Desk", sector: "University Centre", email: "innovation@ueab.ac.ke", highlight: "Rift Valley founders who need capital access" },
  { name: "Murang'a University Innovation Desk", sector: "University Centre", email: "innovation@mut.ac.ke", highlight: "engineering prototypes that need commercialization proof" },
  { name: "Laikipia University Innovation Desk", sector: "University Centre", email: "innovation@laikipia.ac.ke", highlight: "student SMEs that need lender trust" },
  { name: "Chuka University Innovation Desk", sector: "University Centre", email: "innovation@chuka.ac.ke", highlight: "Tharaka agri ventures that need funding visibility" },
  { name: "Meru University Innovation Desk", sector: "University Centre", email: "innovation@must.ac.ke", highlight: "Mount Kenya founders who need market proof" },
  { name: "Maasai Mara University Innovation Desk", sector: "University Centre", email: "innovation@mmarau.ac.ke", highlight: "Narok startups that need investor access" },
  { name: "Kirinyaga University Innovation Desk", sector: "University Centre", email: "innovation@kirinyaga.ac.ke", highlight: "agri-tech spin-outs that need buyer verification" },
  { name: "Technical University of Mombasa Innovation Desk", sector: "University Centre", email: "innovation@tum.ac.ke", highlight: "Mombasa student tech that need funding visibility" },
  { name: "Dedan Kimathi Innovation Desk", sector: "University Centre", email: "innovation@dekut.ac.ke", highlight: "engineering spin-outs that need investor proof" },
  { name: "South Eastern Kenya University Innovation Desk", sector: "University Centre", email: "innovation@seku.ac.ke", highlight: "dryland founders who need research commercialization proof" },
  { name: "Kabianga University Innovation Desk", sector: "University Centre", email: "innovation@kabianga.ac.ke", highlight: "Kericho founders who need national visibility" },
  { name: "Tangaza University Innovation Desk", sector: "University Centre", email: "innovation@tangaza.ac.ke", highlight: "postgraduate ventures that need investor proof" },
  { name: "Gretsa University Innovation Desk", sector: "University Centre", email: "innovation@gretsauniversity.ac.ke", highlight: "student farmers who need buyer proof" },
  { name: "East African University Innovation Desk", sector: "University Centre", email: "innovation@eau.ac.ke", highlight: "Kiambu student founders who need funding visibility" },
  { name: "Scott Christian University Innovation Desk", sector: "University Centre", email: "innovation@scott.ac.ke", highlight: "Machakos student ventures that need lender trust" },
  { name: "Zetech University Innovation Desk", sector: "University Centre", email: "innovation@zetechuniversity.ac.ke", highlight: "tech students who need employer proof" },
  { name: "Mount Kenya University Innovation Desk", sector: "University Centre", email: "innovation@mku.ac.ke", highlight: "broad student founders who need national record" },
  { name: "Riara University Innovation Desk", sector: "University Centre", email: "innovation@riarauniversity.ac.ke", highlight: "enterprise students who need investor visibility" },
  { name: "Jaramogi Oginga Odinga Innovation Desk", sector: "University Centre", email: "innovation@joust.ac.ke", highlight: "Siaya student ventures that need deal flow" },

  { name: "Turkana County Innovation", sector: "County", email: "info@turkana.go.ke", highlight: "Turkana founders who need investor proof" },
  { name: "Garissa County Innovation", sector: "County", email: "info@garissa.go.ke", highlight: "Garissa SMEs that need market visibility" },
  { name: "Wajir County Innovation", sector: "County", email: "info@wajir.go.ke", highlight: "Wajir founders who need funding visibility" },
  { name: "Mandera County Innovation", sector: "County", email: "info@mandera.go.ke", highlight: "Mandera traders who need cross border proof" },
  { name: "Samburu County Innovation", sector: "County", email: "info@samburu.go.ke", highlight: "Samburu SMEs that need buyer proof" },
  { name: "Isiolo County Innovation", sector: "County", email: "info@isiolo.go.ke", highlight: "Isiolo founders who need deal flow" },
  { name: "Marsabit County Innovation", sector: "County", email: "info@marsabit.go.ke", highlight: "Marsabit SMEs that need national showcase" },
  { name: "Tana River County Innovation", sector: "County", email: "info@tanariver.go.ke", highlight: "Tana River founders who need investor access" },
  { name: "Lamu County Innovation", sector: "County", email: "info@lamu.go.ke", highlight: "Lamu traders that need market proof" },
  { name: "Kwale County Innovation", sector: "County", email: "info@kwale.go.ke", highlight: "Kwale SMEs that need funding visibility" },
  { name: "Taita Taveta County Innovation", sector: "County", email: "info@taitataveta.go.ke", highlight: "Taita founders who need national record" },
  { name: "Bomet County Innovation", sector: "County", email: "info@bomet.go.ke", highlight: "Bomet farmers who need buyer proof" },
  { name: "Kericho County Innovation", sector: "County", email: "info@kericho.go.ke", highlight: "Kericho firms who need lender trust" },
  { name: "Nandi County Innovation", sector: "County", email: "info@nandi.go.ke", highlight: "Nandi SMEs that need market access" },
  { name: "Elgeyo Marakwet County Innovation", sector: "County", email: "info@elgeyomarakwet.go.ke", highlight: "Elgeyo founders who need investor visibility" },

  { name: "Kenya Investment Authority SME Desk", sector: "Government", email: "sme@keninvest.go.ke", highlight: "investor ready SMEs that need sourced record" },
  { name: "Kenya National Innovation Agency County Desk", sector: "Government", email: "county@knia.go.ke", highlight: "county founders who need national proof" },
  { name: "Kenya ICT Authority Startup Desk", sector: "Government", email: "startups@ict.go.ke", highlight: "digital startups that need policy maker visibility" },
  { name: "Kenya Industrial Research Startup Desk", sector: "Government", email: "startups@kirdi.go.ke", highlight: "lab spin-outs that need commercialization proof" },
  { name: "Kenya Agricultural Research Startup Desk", sector: "Government", email: "startups@kalro.org", highlight: "agri spin-outs that need buyer proof" },
  { name: "Kenya Revenue Authority Innovator Desk", sector: "Government", email: "innovators@kra.go.ke", highlight: "founders who need compliant public record" },
  { name: "Central Bank Fintech Desk", sector: "Government", email: "fintech@centralbank.go.ke", highlight: "fintech founders who need regulator trust proof" },
  { name: "Kenya Bankers Fintech Desk", sector: "Association", email: "fintech@kba.co.ke", highlight: "bank fintech partners who need verified record" },
  { name: "Kenya Association of Manufacturers SME Desk", sector: "Association", email: "sme@kea.com", highlight: "industrial SMEs that need buyer visibility" },
  { name: "Kenya Renewable Energy Association Desk", sector: "Association", email: "info@kerea.co.ke", highlight: "solar members who need investor verification" },
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
