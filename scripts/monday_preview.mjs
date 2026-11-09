import fs from "node:fs";
const brief = fs.readFileSync("worker/brief.mjs", "utf8");
const draft = fs.readFileSync("qa/drafts/brief-002.md", "utf8");
const key = process.env.RESEND_API_KEY || "";
if (!key) {
  console.log("no RESEND_API_KEY, skip preview send");
  process.exit(0);
}
const to = process.env.DESK_EMAIL || "jack@startups.co.ke";
const m = brief.match(/subject: '([^']+)'/);
const subject = `${m ? m[1] : "The Ecosystem Brief preview"} (Monday smoke test)`;
const text = `Monday smoke test preview. Draft below.\n\n${draft.slice(0, 4000)}`;
const r = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({ from: "startups.co.ke <notices@startups.co.ke>", to, subject, text }),
});
const body = await r.text();
console.log("preview send:", r.status, body.slice(0, 200));
if (!r.ok) process.exit(1);
