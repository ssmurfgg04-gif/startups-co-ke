#!/bin/bash
# VLM round screenshots v2 — scroll through pages so reveal animations fire before capture
set -e
cd /home/z/my-project
mkdir -p qa/screenshots
AB="agent-browser --session vlm2"

scroll_all() {
  for i in $(seq 1 14); do $AB scroll down 700 >/dev/null 2>&1; sleep 0.15; done
  $AB eval "window.scrollTo(0,0)" >/dev/null 2>&1
  sleep 0.6
}

shot() { # $1=name $2=url
  $AB open "$2" >/dev/null 2>&1
  $AB eval "localStorage.setItem('sck-consent','essential')" >/dev/null 2>&1
  $AB wait --load networkidle >/dev/null 2>&1 || true
  $AB wait 900 >/dev/null 2>&1 || true
  scroll_all
  $AB screenshot "qa/screenshots/$1.png" --full
  echo "shot $1"
}

$AB set viewport 1280 800 >/dev/null 2>&1
$AB open "http://localhost:3000/" >/dev/null 2>&1
$AB eval "localStorage.setItem('sck-consent','essential')" >/dev/null 2>&1
$AB reload >/dev/null 2>&1
shot 01-home-full "http://localhost:3000/"
shot 02-startups-directory "http://localhost:3000/startups"
shot 03-profile-mkopa "http://localhost:3000/startups/m-kopa"
shot 04-profile-twiga-failure "http://localhost:3000/startups/twiga"
shot 05-investors "http://localhost:3000/investors"
shot 06-funding "http://localhost:3000/funding"
shot 07-hackathons "http://localhost:3000/hackathons"
shot 08-jobs "http://localhost:3000/jobs"
shot 09-article-sh93bn "http://localhost:3000/news/sh93bn-lesson"
shot 10-research "http://localhost:3000/research"
$AB set device "iPhone 14" >/dev/null 2>&1
$AB open "http://localhost:3000/" >/dev/null 2>&1
$AB wait --load networkidle >/dev/null 2>&1 || true
$AB wait 900 >/dev/null 2>&1 || true
scroll_all
$AB screenshot "qa/screenshots/11-home-mobile.png" --full
echo "shot 11-home-mobile"
$AB set viewport 1280 800 >/dev/null 2>&1
ls qa/screenshots/ | wc -l
