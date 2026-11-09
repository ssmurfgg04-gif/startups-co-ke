// Outreach Day 3: 50 mid-tier institutions that actually need visibility.
// Big brands (Strathmore, UoN) do not need a listing, so excluded.
// Strategy: student spin-outs for universities, county founders for regional hubs,
// portfolio proof for incubators, donor proof for NGOs, verified pipeline for small funds.
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
  { name: "Dedan Kimathi University of Technology", sector: "University Innovation Hub", email: "info@dekut.ac.ke", highlight: "engineering spin-outs that need investor proof beyond campus" },
  { name: "Kibabuni University", sector: "University Innovation Hub", email: "info@kibabuni.ac.ke", highlight: "Kwale student founders who are invisible to Nairobi capital" },
  { name: "Pwani University", sector: "University Innovation Hub", email: "info@pu.ac.ke", highlight: "blue economy student ventures that need funding visibility" },
  { name: "Kabarak University", sector: "University Innovation Hub", email: "info@kabarak.ac.ke", highlight: "Nakuru student founders who need a sourced national record" },
  { name: "Rongo University", sector: "University Innovation Hub", email: "info@rongo.ac.ke", highlight: "Migori student founders who need deal flow" },
  { name: "Alupe University", sector: "University Innovation Hub", email: "info@alupe.ac.ke", highlight: "Busia agri-tech students who need buyer proof" },
  { name: "Kisii University", sector: "University Innovation Hub", email: "info@kisiiuniversity.ac.ke", highlight: "Gusii student ventures that need investor verification" },
  { name: "University of Eldoret", sector: "University Innovation Hub", email: "info@ueab.ac.ke", highlight: "Rift Valley student founders who need national visibility" },
  { name: "Murang'a University of Technology", sector: "University Innovation Hub", email: "info@mut.ac.ke", highlight: "engineering prototypes that need commercialization proof" },
  { name: "Laikipia University", sector: "University Innovation Hub", email: "info@laikipia.ac.ke", highlight: "student SMEs that need lender trust" },
  { name: "Chuka University", sector: "University Innovation Hub", email: "info@chuka.ac.ke", highlight: "Tharaka student agri ventures that need funding visibility" },
  { name: "Meru University of Science and Technology", sector: "University Innovation Hub", email: "info@must.ac.ke", highlight: "Mount Kenya student founders who need market proof" },
  { name: "Maasai Mara University", sector: "University Innovation Hub", email: "info@mmarau.ac.ke", highlight: "Narok student startups that need investor access" },
  { name: "Kirinyaga University", sector: "University Innovation Hub", email: "info@kirinyaga.ac.ke", highlight: "agri-tech spin-outs that need buyer verification" },
  { name: "Technical University of Mombasa", sector: "University Innovation Hub", email: "info@tum.ac.ke", highlight: "coastal student tech that need funding visibility" },

  { name: "Lake Hub Kisumu", sector: "Regional Hub", email: "info@lakehub.co.ke", highlight: "Kisumu founders who need national deal flow outside Nairobi" },
  { name: "SwahiliBox Mombasa", sector: "Regional Hub", email: "info@swahilibox.com", highlight: "coastal founders who need investor ready sourced profiles" },
  { name: "EldoHub", sector: "Regional Hub", email: "info@eldohub.co.ke", highlight: "Eldoret startups that need Nairobi capital visibility" },
  { name: "Nakuru Tech Hub", sector: "Regional Hub", email: "info@nakurutechhub.co.ke", highlight: "Nakuru founders who need national proof for pilots" },
  { name: "Kakamega Innovation Hub", sector: "Regional Hub", email: "info@kakamegahub.co.ke", highlight: "Western Kenya founders who need funding visibility" },
  { name: "Machakos Innovation Hub", sector: "Regional Hub", email: "info@machakoshub.co.ke", highlight: "Ukambani founders who need investor access" },
  { name: "Meru Innovation Hub", sector: "Regional Hub", email: "info@meruhub.co.ke", highlight: "Mount Kenya ventures that need market proof" },
  { name: "Kilifi Innovation Hub", sector: "Regional Hub", email: "info@kilifihub.co.ke", highlight: "coastal SMEs that need lender and buyer trust" },
  { name: "Nyeri Innovation Hub", sector: "Regional Hub", email: "info@nyerihub.co.ke", highlight: "central Kenya founders who need capital visibility" },
  { name: "Kisii Innovation Hub", sector: "Regional Hub", email: "info@kisiihub.co.ke", highlight: "Gusii founders who need a sourced national record" },

  { name: "BuniHub", sector: "Incubator", email: "info@buni.co.ke", highlight: "portfolio founders who need investor proof between demo days" },
  { name: "CcHUB Kenya", sector: "Incubator", email: "info@cchub.co.ke", highlight: "Kenya pipeline that needs sourced verification for pan African deals" },
  { name: "Seedstars Nairobi", sector: "Incubator", email: "info@seedstars.com", highlight: "pre seed founders who need local market proof" },
  { name: "Pangea Accelerator", sector: "Incubator", email: "info@pangeaaccelerator.com", highlight: "cohort startups that need permanent investor pages" },
  { name: "Hanga Digital", sector: "Incubator", email: "info@hangadigital.com", highlight: "digital talent startups that need client proof" },
  { name: "Zidisha", sector: "Incubator", email: "info@zidisha.org", highlight: "SME borrowers who need lender trust via public record" },
  { name: "Growth Collective Kenya", sector: "Incubator", email: "info@growthcollective.ke", highlight: "SME founders who need growth capital visibility" },
  { name: "Fusion X Kenya", sector: "Incubator", email: "info@fusionx.co.ke", highlight: "early founders who need sourced traction pages" },
  { name: "Maisha", sector: "Incubator", email: "info@maisha.co.ke", highlight: "community founders who need national showcase" },
  { name: "Nairobi Innovation Centre", sector: "Incubator", email: "info@nairobiinnovation.co.ke", highlight: "Nairobi SME ventures that need verified public profiles" },

  { name: "BRAC Kenya", sector: "NGO", email: "info@brac.net", highlight: "youth SMEs that need donor proof of impact" },
  { name: "Hand in Hand East Africa", sector: "NGO", email: "info@handinhandeastafrica.org", highlight: "SME graduates who need market visibility for donors" },
  { name: "Kenya Association of Women Business Owners", sector: "NGO", email: "info@kawbo.co.ke", highlight: "women SMEs that need buyer and lender proof" },
  { name: "Oxfam Kenya", sector: "NGO", email: "info@oxfam.org.ke", highlight: "community enterprises that need partner verification" },
  { name: "World Vision Kenya", sector: "NGO", email: "info@worldvision.co.ke", highlight: "youth innovators who need showcase and funding proof" },
  { name: "Save the Children Kenya", sector: "NGO", email: "info@savethechildren.or.ke", highlight: "youth startup programs that need donor visibility" },
  { name: "Plan International Kenya", sector: "NGO", email: "info@plan-international.org", highlight: "girls innovators who need investor and donor proof" },
  { name: "Youth Enterprise Development Fund", sector: "Government Fund", email: "info@youthfund.go.ke", highlight: "youth ventures that need a sourced national record" },

  { name: "Ubuntu Ventures", sector: "Fund", email: "info@ubuntoventures.com", highlight: "Kenya pipeline that needs verification not pitch claims" },
  { name: "Launch Africa Ventures", sector: "Fund", email: "info@launchafrica.com", highlight: "East Africa pre seed founders who need sourced deal flow" },
  { name: "Sango Capital", sector: "Fund", email: "info@sangocapital.com", highlight: "Kenya pre seed deals that need market proof" },
  { name: "Yew Capital", sector: "Fund", email: "info@yewcapital.com", highlight: "small founders who need a verified public record" },
  { name: "Amethis", sector: "Fund", email: "info@amethis.com", highlight: "mid market Kenya SMEs that need investor visibility" },
  { name: "AfricInvest", sector: "Fund", email: "info@africinvest.com", highlight: "Kenya SME pipeline that needs sourced company data" },
  { name: "Knife Capital", sector: "Fund", email: "info@knifecapital.com", highlight: "cross border founders who need Kenya entity proof" },
  { name: "Zeona Capital", sector: "Fund", email: "info@zeonacapital.com", highlight: "climate deals in Kenya that need local venture proof" },
  { name: "Velocity Africa", sector: "Fund", email: "info@velocityafrica.com", highlight: "fintech pipeline that needs verification beyond decks" },
  { name: "Ascent Century", sector: "Fund", email: "info@century.co.ke", highlight: "SME lending pipeline that needs public trust" },
];

function makeEmail(t) {
  const subject = `${t.name} on the Kenya startup record`;
  const text = `Hi ${t.name} team,

I run startups.co.ke, the public record of Kenyan startups. What they raised, from whom, sourced.

Your ${t.highlight} caught my eye. Your founders get a permanent sourced page investors verify in seconds. 3 minutes, free, live now.

List here: ${SITE}

No cost, no queue, live immediately.

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
