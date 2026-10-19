#!/bin/bash
# E2E — INVESTOR PERSONA (session: e2e-inv)
# Journey: search → profile → funding tab → intro request (Supabase write) → funding chart + export → investor filters → newsletter
set -e
cd /home/z/my-project
AB="agent-browser --session e2e-inv"
LOG=qa/e2e-investor.log
: > $LOG
log() { echo "[$(date +%H:%M:%S)] $*" | tee -a $LOG; }

$AB set viewport 1280 800 >/dev/null 2>&1

log "STEP 1: land on home"
$AB open http://localhost:3000/ >/dev/null 2>&1
$AB wait --load networkidle >/dev/null 2>&1 || true
sleep 1
$AB eval "localStorage.setItem('sck-consent','essential')" >/dev/null 2>&1
$AB reload >/dev/null 2>&1; sleep 1.2
TITLE=$($AB get title 2>/dev/null | tail -1)
log "  title: $TITLE"

log "STEP 2: hero search 'solar'"
$AB fill 'input[name="q"]' "solar" >/dev/null 2>&1
$AB press Enter >/dev/null 2>&1
$AB wait --url "**/startups?q=solar" >/dev/null 2>&1 || true
sleep 1.5
ROWS=$($AB eval "Array.from(document.querySelectorAll('#rows a')).map(a=>a.querySelector('.font-medium')?.textContent?.trim()).join('|')" 2>/dev/null | tail -1)
log "  filtered rows: $ROWS"

log "STEP 3: open SunCulture profile"
$AB eval "location.href='/startups/sunculture'" >/dev/null 2>&1
sleep 1.5
$AB eval "document.querySelector('[data-tab=funding]').click()" >/dev/null 2>&1
sleep 0.5
FUND=$($AB eval "document.getElementById('panel-funding').textContent.includes('Securitisation') ? 'securitisation-round-visible' : 'MISSING'" 2>/dev/null | tail -1)
log "  funding tab: $FUND"

log "STEP 4: request introduction (modal -> Supabase)"
$AB eval "document.querySelector('[data-modal=intro]').click()" >/dev/null 2>&1
sleep 0.6
$AB snapshot -i >/dev/null 2>&1
log "  filling intro form"
$AB find label fill "Founders email" 2>/dev/null | head -1 || true
# generic: fill inputs by name inside the intro dialog
$AB eval "const d=document.getElementById('modal-intro'); const i=Array.from(d.querySelectorAll('input')); i.forEach(x=>{ if(x.type==='email') x.value='investor@fund.com'; else if(!x.type||x.type==='text') x.value='Ana Investor'; if(x.tagName==='TEXTAREA') x.value='Thesis fit: climate irrigation.'; }); const t=d.querySelector('textarea'); if(t) t.value='Thesis fit: climate irrigation.'; 'filled'" 2>/dev/null | tail -1
$AB eval "d=document.getElementById('modal-intro'); d.querySelector('button[type=submit]').click(); 'submitted'" 2>/dev/null | tail -1
sleep 2.5
TOAST=$($AB eval "document.querySelector('.toast')?.textContent?.slice(0,80) || document.body.textContent.includes('review queue') ? 'toast-ok' : 'no-toast'" 2>/dev/null | tail -1)
log "  post-submit: $TOAST"

log "STEP 5: funding page — sector switcher + CSV export"
$AB open http://localhost:3000/funding >/dev/null 2>&1
sleep 1.5
$AB eval "document.querySelector('[data-series=Fintech]').click()" >/dev/null 2>&1
sleep 0.5
BARS=$($AB eval "Array.from(document.querySelectorAll('.quarter-bar')).map(b=>b.style.height).slice(0,3).join(',')" 2>/dev/null | tail -1)
log "  fintech bar heights (first 3): $BARS"
$AB eval "document.getElementById('export-btn').click()" >/dev/null 2>&1
sleep 1
EXP=$($AB eval "document.body.textContent.includes('Export ready') ? 'export-toast-ok' : 'no-export-toast'" 2>/dev/null | tail -1)
log "  export: $EXP"

log "STEP 6: investors — verified filter"
$AB open http://localhost:3000/investors >/dev/null 2>&1
sleep 1.5
$AB eval "const cb=document.getElementById('inv-verified'); cb.checked=true; cb.dispatchEvent(new Event('change',{bubbles:true})); 'checked'" >/dev/null 2>&1
sleep 0.8
CNT=$($AB eval "document.getElementById('inv-count').textContent" 2>/dev/null | tail -1)
log "  verified-only count: $CNT"

log "STEP 7: newsletter subscribe (footer modal)"
$AB eval "document.querySelector('[data-modal=newsletter]').click()" >/dev/null 2>&1
sleep 0.6
$AB eval "const d=document.getElementById('modal-newsletter'); const em=d.querySelector('input[type=email]'); em.value='lp@fundbrief.com'; d.querySelector('button[type=submit]').click(); 'subscribed'" 2>/dev/null | tail -1
sleep 2.5
log "INVESTOR PERSONA DONE"
