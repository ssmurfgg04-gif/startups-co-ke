// Rebuild outreach_log.csv from full Resend history (paginated)
import fs from "node:fs";

const _envKey = process.env.RESEND_API_KEY || "";
const keySrc = _envKey ? "re_x" : (fs.existsSync("scripts/send_outreach.mjs") ? fs.readFileSync("scripts/send_outreach.mjs", "utf8") : "");
const m = _envKey ? [_envKey] : keySrc.match(/re_[A-Za-z0-9_]+/);
if (!m) throw new Error("Resend key not found");
const RESEND_KEY = m[0];

async function fetchPage(after) {
  const url = after ? `https://api.resend.com/emails?limit=100&after=${after}` : `https://api.resend.com/emails?limit=100`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${RESEND_KEY}` } });
  const body = await r.text();
  let parsed;
  try { parsed = JSON.parse(body); } catch { throw new Error(`Bad JSON ${r.status} ${body.slice(0, 200)}`); }
  if (!r.ok) throw new Error(`Resend ${r.status}: ${body.slice(0, 200)}`);
  return parsed;
}

(async () => {
  const all = [];
  let after = null;
  let pages = 0;
  while (true) {
    const data = await fetchPage(after);
    const emails = data.data || [];
    if (!emails.length) break;
    all.push(...emails);
    pages++;
    console.log(`page ${pages}: ${emails.length} total so far ${all.length} has_more=${data.has_more}`);
    if (!data.has_more) break;
    after = emails[emails.length - 1].id;
    if (pages > 20) { console.log("safety stop at 20 pages"); break; }
  }
  const outreach = all.filter(e => (e.subject || "").includes("on the Kenya startup record"));
  console.log(`outreach total: ${outreach.length} / all ${all.length}`);

  // Build name -> sector map from target files, to restore sector column
  const sectorMap = new Map();
  for (const f of ["scripts/send_outreach.mjs", "scripts/send_outreach2.mjs", "scripts/send_outreach3.mjs", "scripts/retarget.mjs", "scripts/send_outreach_institutions.mjs"]) {
    try {
      const txt = fs.readFileSync(f, "utf8");
      const re = /\{\s*name:\s*"([^"]+)"\s*,\s*sector:\s*"([^"]+)"/g;
      let mm;
      while ((mm = re.exec(txt)) !== null) sectorMap.set(mm[1].toLowerCase(), mm[2]);
    } catch {}
  }

  const rows = ["date,sent_at,name,sector,email,subject,status,resend_id,last_event"];
  // sort by created_at desc (already desc from API)
  for (const e of outreach) {
    const name = (e.subject || "").replace(" on the Kenya startup record", "");
    const sector = sectorMap.get(name.toLowerCase()) || "";
    const email = (e.to && e.to[0]) || "";
    const date = (e.created_at || "").slice(0, 10);
    rows.push(`${date},${e.created_at},${JSON.stringify(name)},${sector},${email},${JSON.stringify(e.subject)},sent,${e.id},${e.last_event}`);
  }
  fs.writeFileSync("qa/outreach/outreach_log.csv", rows.join("\n") + "\n");
  console.log(`wrote ${rows.length - 1} rows to qa/outreach/outreach_log.csv`);
})();
