#!/bin/bash
# Retry logo misses: direct favicon.ico then Google s2, small delay to dodge 429s
cd /home/z/my-project
mkdir -p public/logos

try1() { curl -sL -o "public/logos/$1.png" --max-time 15 "https://$2/favicon.ico"; s=$(wc -c < "public/logos/$1.png" 2>/dev/null||echo 0); [ "$s" -ge 500 ] && { echo "OK-d  $1 ($2)"; return 0; }; return 1; }
try2() { curl -sL -o "public/logos/$1.png" --max-time 15 "https://www.google.com/s2/favicons?domain=$2&sz=128"; s=$(wc -c < "public/logos/$1.png" 2>/dev/null||echo 0); [ "$s" -ge 500 ] && { echo "OK-g  $1 ($2)"; return 0; }; return 1; }
get()  { try1 "$1" "$2" || try2 "$1" "$2" || { rm -f "public/logos/$1.png"; echo "MISS  $1"; }; }

get enza enza.capital
get delta40 delta40.earth
get turaco turaco.co.ke
get marketforce marketforce.io
get flexpay flexpay.co.ke
get tanda tanda.co.ke
get iprocure iprocure.co.ke
sleep 12
get waterequity waterequity.com
get renew renewcapital.com
get saviu saviu.vc
get ajim ajimcapital.com
get villgro villgroafrica.org
echo "---"; ls public/logos | wc -l
