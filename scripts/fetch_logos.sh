#!/bin/bash
# Fetch real logos via unavatar.io (D5) into public/logos/
# 200px, fallbacks to favicon providers; 404 => file not written => UI falls back to monogram tile
cd /home/z/my-project
mkdir -p public/logos

fetch() { # $1=slug  $2=domain
  code=$(curl -sL -o "public/logos/$1.png" -w "%{http_code}" --max-time 20 "https://unavatar.io/$2?fallback=false")
  size=$(wc -c < "public/logos/$1.png" 2>/dev/null || echo 0)
  if [ "$code" != "200" ] || [ "$size" -lt 500 ]; then
    rm -f "public/logos/$1.png"
    echo "MISS  $1 ($2) code=$code"
  else
    echo "OK    $1 ($2) ${size}b"
  fi
}

# companies
fetch m-kopa m-kopa.com
fetch basigo basi-go.com
fetch sunculture sunculture.com
fetch apollo apolloagriculture.com
fetch pula pula-advisors.com
fetch cellulant cellulant.io
fetch twiga twiga.com
fetch sendy sendy.co.ke
fetch copia copia.co.ke
fetch ilara ilarahealth.com
fetch honeycoin honeycoin.app
fetch flexpay flexpay.co.ke
fetch tanda tanda.co.ke
fetch pesapal pesapal.com
fetch roam roam-electric.com
fetch iprocure iprocure.co.ke
fetch turaco turaco.co.ke
fetch marketforce marketforce.io
fetch wasoko wasoko.com
fetch carepay carepay.com
# investors (logos used on investor cards when present)
fetch novastar novastarventures.com
fetch enza enza.capital
fetch tlcom tlcomcapital.com
fetch antler antler.co
fetch blueorchard blueorchard.com
fetch flourish flourishventures.com
fetch delta40 delta40.co
fetch waterequity waterequity.com
fetch renew renewcapital.com
fetch havaic havaic.co
fetch saviu saviu.vc
fetch ajim ajimcapital.com
fetch villgro villgroafrica.org

echo "---"; ls public/logos | wc -l; echo "logo files present"
