#!/bin/bash
# Fresh research batch for startups.co.ke real-data population (Task 2)
# Results saved to research/ following repo convention
cd /home/z/my-project
mkdir -p research

# 1) More real companies (recent funding / status)
z-ai function -n web_search -a '{"query": "iProcure Kenya agritech funding raise", "num": 6}' -o research/c6-iprocure.json
z-ai function -n web_search -a '{"query": "Turaco insurance Kenya funding Series", "num": 6}' -o research/c7-turaco.json
z-ai function -n web_search -a '{"query": "MarketForce Kenya RejaBima funding 2025", "num": 6}' -o research/c8-marketforce.json
z-ai function -n web_search -a '{"query": "Wasoko Kenya funding 2025 2026 status", "num": 6}' -o research/c9-wasoko.json
z-ai function -n web_search -a '{"query": "CarePay Kenya M-TIBU funding health", "num": 6}' -o research/c10-carepay.json

# 2) Real job openings at Kenyan startups
z-ai function -n web_search -a '{"query": "Kenyan startups hiring engineer jobs Nairobi October 2026", "num": 8}' -o research/j1-jobs.json
z-ai function -n web_search -a '{"query": "SunCulture careers jobs Kenya 2026", "num": 6}' -o research/j2-sunculture.json
z-ai function -n web_search -a '{"query": "Pula advisors careers Kenya jobs", "num": 6}' -o research/j3-pula.json

# 3) Latest Kenya ecosystem news (October 2026) for fresh wire
z-ai function -n web_search -a '{"query": "Kenya startup funding news October 2026", "num": 8, "recency_days": 21}' -o research/n1-oct2026.json
z-ai function -n web_search -a '{"query": "Nairobi hackathon December 2026 January 2027", "num": 8}' -o research/h2-events.json

# 4) arXiv fresh pass: African fintech / startup ecosystem papers
curl -s "http://export.arxiv.org/api/query?search_query=all:%22African+startups%22+OR+all:%22mobile+money%22+Kenya&start=0&max_results=6&sortBy=submittedDate&sortOrder=descending" -o research/arxiv4.xml
echo "DONE batch 1"
