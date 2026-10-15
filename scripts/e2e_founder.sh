#!/bin/bash
# E2E — FOUNDER PERSONA (session: e2e-fdr2)
# Journey: claim profile w/ logo upload → submit startup w/ logo → post job → event reminder → job bookmark
set -e
cd /home/z/my-project
AB="agent-browser --session e2e-fdr2"
LOG=qa/e2e-fdr2.log
: > $LOG
log() { echo "[$(date +%H:%M:%S)] $*" | tee -a $LOG; }
UPLOAD=/home/z/my-project/public/logos/basigo.png   # real PNG used as the founder's upload

$AB set viewport 1280 800 >/dev/null 2>&1

log "STEP 1: M-KOPA profile -> Claim profile (with logo upload)"
$AB open http://localhost:3000/startups/m-kopa >/dev/null 2>&1
$AB wait --load networkidle >/dev/null 2>&1 || true
sleep 1.2
$AB eval "localStorage.setItem('sck-consent','essential')" >/dev/null 2>&1
$AB eval "document.querySelector('[data-modal=claim]').click()" >/dev/null 2>&1
sleep 0.6
$AB eval "(() => { const dlg=document.getElementById('modal-claim'); dlg.querySelector('#cl-name').value='June Founder'; dlg.querySelector('#cl-email').value='june@mkopa-alum.com'; return 'filled'; })()" >/dev/null 2>&1
REF=$($AB snapshot -i 2>/dev/null | rg -o "@e[0-9]+.*file.*" | head -1 | rg -o "@e[0-9]+" | head -1)
log "  file input ref: $REF"
if [ -n "$REF" ]; then $AB upload "$REF" "$UPLOAD" >/dev/null 2>&1 && log "  logo attached"; else
  $AB eval "(() => { const inp=document.querySelector('#modal-claim input[type=file]'); const dt=new DataTransfer(); dt.items.add(new File(['x'],'x.png',{type:'image/png'})); inp.files=dt.files; return 'synthetic-file'; })()" >/dev/null 2>&1
  log "  synthetic file attached (ref not found)"
fi
$AB eval "(() => { document.getElementById('modal-claim').querySelector('button[type=submit]').click(); return 'claim-submitted'; })()" 2>&1 | tail -1 | awk '{print "  -> " $0}'
sleep 2.5
$AB eval "(() => { const t=document.querySelector('#toaster [role=alert], .toast, [data-toast]'); return t ? 'toast: '+t.textContent.trim().slice(0,60) : 'no-toast-found'; })()" 2>&1 | tail -1 | awk '{print "  " $0}'

log "STEP 2: Submit your startup (with logo upload)"
$AB open http://localhost:3000/ >/dev/null 2>&1
sleep 1.5
$AB eval "(() => { const b=document.querySelector('[data-modal=submit]'); if(!b) return 'no-trigger'; b.click(); return 'opened'; })()" 2>&1 | tail -1 | awk '{print "  -> " $0}'
sleep 0.6
$AB eval "(() => { const dlg=document.getElementById('modal-submit'); dlg.querySelector('#su-name').value='Zuka Robotics'; dlg.querySelector('#su-email').value='hello@zukarobotics.co.ke'; dlg.querySelector('#su-tag').value='Autonomous greenhouse robots for Kenyan flower farms'; return 'filled'; })()" >/dev/null 2>&1
$AB eval "(() => { const inp=document.querySelector('#modal-submit input[type=file]'); const dt=new DataTransfer(); dt.items.add(new File([new Uint8Array([137,80,78,71,13,10,26,10])],'zuka.png',{type:'image/png'})); inp.files=dt.files; return 'logo-file-set'; })()" 2>&1 | tail -1 | awk '{print "  " $0}'
$AB eval "(() => { document.getElementById('modal-submit').querySelector('button[type=submit]').click(); return 'startup-submitted'; })()" 2>&1 | tail -1 | awk '{print "  -> " $0}'
sleep 2.5

log "STEP 3: Post a job"
$AB open http://localhost:3000/jobs >/dev/null 2>&1
sleep 1.5
$AB eval "(() => { document.querySelector('[data-modal=postjob]').click(); return 'opened'; })()" >/dev/null 2>&1
sleep 0.6
$AB eval "(() => { const dlg=document.getElementById('modal-postjob'); const set=(sel,v)=>{const el=dlg.querySelector(sel); if(el) el.value=v;}; set('#pj-company','Zuka Robotics'); set('#pj-email','hello@zukarobotics.co.ke'); set('#pj-title','Robotics Engineer'); const ta=dlg.querySelector('textarea'); if(ta) ta.value='Build autonomous greenhouse robots. Rust + embedded. '; return 'filled'; })()" >/dev/null 2>&1
$AB eval "(() => { document.getElementById('modal-postjob').querySelector('button[type=submit]').click(); return 'job-submitted'; })()" 2>&1 | tail -1 | awk '{print "  -> " $0}'
sleep 2.5

log "STEP 4: Hackathon reminder (register modal)"
$AB open http://localhost:3000/hackathons >/dev/null 2>&1
sleep 1.5
$AB eval "(() => { const b=document.querySelector('[data-modal=register]'); b.click(); return 'opened'; })()" >/dev/null 2>&1
sleep 0.6
$AB eval "(() => { const dlg=document.getElementById('modal-register'); dlg.querySelectorAll('input').forEach(x=>{ if(x.type==='email') x.value='june@mkopa-alum.com'; else if(!x.type||x.type==='text') x.value='June Founder'; }); const t=dlg.querySelector('textarea'); if(t) t.value='Team of 3, fintech track.'; dlg.querySelector('button[type=submit]').click(); return 'register-submitted'; })()" 2>&1 | tail -1 | awk '{print "  -> " $0}'
sleep 2.5

log "STEP 5: expand first job row + bookmark"
$AB open http://localhost:3000/jobs >/dev/null 2>&1
sleep 1.5
$AB eval "(() => { document.querySelector('#job-rows [data-expand]').click(); return 'expanded'; })()" >/dev/null 2>&1
sleep 0.5
$AB eval "(() => { document.querySelector('.bookmark-btn').click(); return 'bookmarked'; })()" 2>&1 | tail -1 | awk '{print "  -> " $0}'
sleep 0.8
$AB eval "(() => { const bm=Object.keys(localStorage).filter(k=>k.includes('bookmark')); return 'keys: '+bm.join(',')+' val: '+(bm.length?localStorage.getItem(bm[0]).slice(0,60):'none'); })()" 2>&1 | tail -1 | awk '{print "  " $0}'

log "FOUNDER PERSONA DONE"
