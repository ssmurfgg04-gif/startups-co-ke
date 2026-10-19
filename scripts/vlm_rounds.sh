#!/bin/bash
# VLM review rounds via z-ai vision CLI (10 rounds, D7 taste loop)
cd /home/z/my-project
mkdir -p qa/vlm

SYS="You are a ruthless, detail-oriented senior product designer and front-end reviewer (minimalist-ui taste protocol, anti-cliche). You review screenshots of a Kenya startup-intelligence site whose brand is data-terminal-x-editorial: paper #F6F3EA bg, ink #181712, green #0E4630, amber #B87503, Fraunces display serif, IBM Plex Mono labels, hairline rules, offset shadows, square corners. For the given page: (1) List concrete visual DEFECTS you can actually see (overlap, clipping, misalignment, contrast failures, broken or blurry images, crowded rows, orphaned labels, inconsistent chips, countdown issues, table issues) - cite section names. (2) List the TOP 3 highest-impact fixes with exact CSS/layout guidance. (3) Score /10 for credibility to a PitchBook-reading investor. Be specific and terse. No generic praise. If the page is clean, say so and score honestly."

run() { # $1=name $2=file
  if [ -s "qa/vlm/$1.md" ]; then echo "skip $1 (exists)"; return; fi
  z-ai vision -p "$SYS — Page: $2" -i "qa/screenshots/$2" -o "qa/vlm/$1.raw.json" >/dev/null 2>&1
  python3 -c "
import json,sys
try:
    d=json.load(open('qa/vlm/$1.raw.json'))
    c=d.get('content') or (d.get('choices',[{}])[0].get('message',{}).get('content','')) or str(d)[:500]
except Exception as e:
    c='(parse fail) '+str(e)
open('qa/vlm/$1.md','w').write('# $1\n\nFile: $2\n\n'+c+'\n')
print('✔ $1', len(c), 'chars')
"
}

run round-01-home 01-home-full.png
run round-02-directory 02-startups-directory.png
run round-03-profile-mkopa 03-profile-mkopa.png
run round-04-twiga-failure 04-profile-twiga-failure.png
run round-05-investors 05-investors.png
run round-06-funding 06-funding.png
run round-07-hackathons 07-hackathons.png
run round-08-jobs 08-jobs.png
run round-09-article 09-article-sh93bn.png
run round-10-research 10-research.png
echo "ALL ROUNDS DONE"; ls qa/vlm/*.md | wc -l
