// Outreach Day 2: 50 institutional targets, deduped against outreach_log.csv
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
  { name: "Strathmore University", sector: "University", email: "info@strathmore.edu", highlight: "tech and business training in Nairobi" },
  { name: "University of Nairobi", sector: "University", email: "info@uonbi.ac.ke", highlight: "Kenya's research and tech talent pipeline" },
  { name: "USIU Africa", sector: "University", email: "info@usiu.ac.ke", highlight: "innovation programs for builders" },
  { name: "Kenyatta University", sector: "University", email: "info@ku.ac.ke", highlight: "research and innovation at scale" },
  { name: "JKUAT", sector: "University", email: "info@jkuat.ac.ke", highlight: "agriculture, tech and entrepreneurship research" },
  { name: "Daystar University", sector: "University", email: "info@daystar.ac.ke", highlight: "digital media and tech talent" },
  { name: "Mount Kenya University", sector: "University", email: "info@mku.ac.ke", highlight: "broad STEM and business training" },
  { name: "Riara University", sector: "University", email: "info@riarauniversity.ac.ke", highlight: "tech and enterprise programs" },
  { name: "Zetech University", sector: "University", email: "info@zetechuniversity.ac.ke", highlight: "growing tech and innovation programs" },
  { name: "Catholic University of Eastern Africa", sector: "University", email: "info@cuea.edu", highlight: "engineering and computing research" },
  { name: "Kenya National Innovation Agency", sector: "Government", email: "info@knia.go.ke", highlight: "national innovation policy and support" },
  { name: "KenInvest", sector: "Government", email: "info@keninvest.go.ke", highlight: "investment promotion for Kenya" },
  { name: "Konza Technopolis", sector: "Government", email: "info@konza.go.ke", highlight: "Kenya's smart tech city program" },
  { name: "KIRDI", sector: "Government", email: "info@kirdi.go.ke", highlight: "industrial research and development" },
  { name: "KALRO", sector: "Government", email: "info@kalro.org", highlight: "agricultural research for Kenyan farmers" },
  { name: "KEMRI", sector: "Government", email: "info@kemri.org", highlight: "health research in Kenya" },
  { name: "Kenya Climate Innovation Center", sector: "Incubator", email: "info@kcic.or.ke", highlight: "climate tech incubation in Nairobi" },
  { name: "Kenya ICT Authority", sector: "Government", email: "info@ict.go.ke", highlight: "Kenya's digital economy programs" },
  { name: "Communications Authority of Kenya", sector: "Government", email: "info@ca.go.ke", highlight: "telecoms regulation in Kenya" },
  { name: "Data Protection Commission Kenya", sector: "Government", email: "info@odpc.go.ke", highlight: "data governance for digital startups" },
  { name: "Central Bank of Kenya", sector: "Government", email: "info@centralbank.go.ke", highlight: "financial sector policy in Kenya" },
  { name: "Kenya Revenue Authority", sector: "Government", email: "info@kra.go.ke", highlight: "tax policy for growing businesses" },
  { name: "Kenya Bankers Association", sector: "Association", email: "info@kba.co.ke", highlight: "banking sector coordination in Kenya" },
  { name: "KEPSA", sector: "Association", email: "info@kepsa.or.ke", highlight: "private sector voice in Kenya" },
  { name: "KNCCI", sector: "Association", email: "info@kncci.org", highlight: "chamber for Kenyan businesses" },
  { name: "Nairobi Garage", sector: "Incubator", email: "info@nairobi-garage.com", highlight: "startup coworking in Nairobi" },
  { name: "Kenya Angels Network", sector: "Fund", email: "info@kenyaangelsnetwork.com", highlight: "angel investing for Kenyan startups" },
  { name: "African Business Angels Network", sector: "Fund", email: "info@abanangels.org", highlight: "angel investing across Africa" },
  { name: "Saviu Capital", sector: "Fund", email: "info@saviucapital.com", highlight: "venture capital for tech in Africa" },
  { name: "Ascent Capital Africa", sector: "Fund", email: "info@ascentcapital.co.ke", highlight: "growth capital in East Africa" },
  { name: "GroFin Africa", sector: "Fund", email: "info@grofin.com", highlight: "SME financing in Africa" },
  { name: "Fanisi Capital", sector: "Fund", email: "info@fanisicapital.com", highlight: "SME investment in East Africa" },
  { name: "Enza Capital", sector: "Fund", email: "info@enzacapital.com", highlight: "venture capital for Kenyan founders" },
  { name: "CrossBoundary Energy", sector: "Fund", email: "info@crossboundary.com", highlight: "energy access investment in Africa" },
  { name: "Wedo Global", sector: "Incubator", email: "info@wedoglobal.org", highlight: "startup support across Africa" },
  { name: "Enactus Kenya", sector: "Incubator", email: "info@enactus.or.ke", highlight: "student social enterprise in Kenya" },
  { name: "Sandbox", sector: "Incubator", email: "hello@sandboxinnovations.co.ke", highlight: "innovation workspace in Nairobi" },
  { name: "Africa's Talking", sector: "Company", email: "hello@africastalking.com", highlight: "communication APIs used across Africa" },
  { name: "Safaricom", sector: "Company", email: "info@safaricom.co.ke", highlight: "M-Pesa and connectivity in Kenya" },
  { name: "Kenya Red Cross", sector: "NGO", email: "info@redcross.or.ke", highlight: "humanitarian tech and community work" },
  { name: "Mercy Corps Kenya", sector: "NGO", email: "info@mercycorps.org", highlight: "livelihoods and youth programs in Kenya" },
  { name: "British Council Kenya", sector: "NGO", email: "info@britishcouncil.or.ke", highlight: "education and innovation programs" },
  { name: "GIZ Kenya", sector: "NGO", email: "info@giz.de", highlight: "development cooperation in Kenya" },
  { name: "United Nations Kenya", sector: "NGO", email: "info@un.org", highlight: "development programs in Kenya" },
  { name: "Impact Hub Nairobi", sector: "Incubator", email: "hello@impacthub.net", highlight: "social innovation community in Nairobi" },
  { name: "Metropol Labs", sector: "Company", email: "hello@metropol.co.ke", highlight: "digital solutions for Kenyan firms" },
  { name: "Digital Divide Data", sector: "Company", email: "info@digitaldividedata.org", highlight: "digital jobs support in Africa" },
  { name: "Kenya Association of Software and IT Services", sector: "Association", email: "info@kasitow.org", highlight: "software and IT services in Kenya" },
  { name: "African Union Development Agency", sector: "Government", email: "info@au.int", highlight: "continental development coordination" },
  { name: "Kenya Ports Authority", sector: "Government", email: "info@kpa.go.ke", highlight: "trade and logistics gateway for Kenya" },
];

function makeEmail(t) {
  const subject = `${t.name} on the Kenya startup record`;
  const text = `Hi ${t.name} team,

I run startups.co.ke, a public record of Kenyan startups: who raised, from whom, with named sources. Free to read, free to be listed.

Your ${t.highlight} caught my eye. A listing takes 3 minutes and gives you a permanent page linked to your site, plus visibility to our readers.

List here: ${SITE}

No cost, no approval queue, live the moment you publish.

Best,
The startups.co.ke desk
notices@startups.co.ke`;
  return { to: t.email, subject, text };
}

function csvEsc(s) {
  return JSON.stringify(s ?? "");
}

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
