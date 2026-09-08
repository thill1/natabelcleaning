#!/usr/bin/env bash
# =============================================================================
# NataBel — configure Resend + Cloudflare + Vercel for email delivery, in one
# command. Idempotent: safe to re-run.
#
# It will:
#   1. Register the sending domain in Resend (or reuse it if already there)
#   2. Read back the DKIM / SPF / MX records Resend generates
#   3. Publish those records to Cloudflare (create or update)
#   4. Poll Resend until the domain reports "verified"
#   5. Point LEAD_FROM_EMAIL at the verified domain in Vercel production
#   6. Redeploy, then fire a live lead through the production endpoint and
#      report whether email delivery actually succeeded
#
# ---------------------------------------------------------------------------
# USAGE
#
#   export RESEND_API_KEY='re_...'    # resend.com/api-keys
#   export CF_API_TOKEN='...'         # see CLOUDFLARE TOKEN below
#   ./scripts/setup-resend-dns.sh
#
# Optional overrides:
#   ZONE=natabelpristinecleaning.com   # domain to send from
#   FROM_EMAIL=leads@$ZONE             # envelope sender
#   REGION=us-east-1                   # Resend region
#   SKIP_DEPLOY=1                      # configure only, no redeploy/test
#
# ---------------------------------------------------------------------------
# CLOUDFLARE TOKEN
#   dash.cloudflare.com/profile/api-tokens > Create Token > "Edit zone DNS"
#   Permission needed: Zone > DNS > Edit, scoped to your zone.
#
#   IMPORTANT: the token must come from the Cloudflare account that actually
#   holds the zone. As of this writing natabelpristinecleaning.com is NOT in
#   Tghill@gmail.com's Cloudflare account (which holds only sentientpartners.ai
#   and sentientpartners.vip), so a token minted there will fail step 3 with
#   "zone not found". Log into the account that owns the domain, or move the
#   domain, or set ZONE to one you do control.
#
# Tokens are read from the environment and never written to disk.
# =============================================================================
set -euo pipefail

ZONE="${ZONE:-natabelpristinecleaning.com}"
REGION="${REGION:-us-east-1}"
FROM_EMAIL="${FROM_EMAIL:-leads@$ZONE}"
VERCEL_SCOPE="${VERCEL_SCOPE:-troy-hills-projects}"

for tool in curl jq; do
  command -v "$tool" >/dev/null || { echo "Missing required tool: $tool" >&2; exit 1; }
done
: "${RESEND_API_KEY:?Set RESEND_API_KEY first (see header)}"
: "${CF_API_TOKEN:?Set CF_API_TOKEN first (see header)}"

R_AUTH=(-H "Authorization: Bearer $RESEND_API_KEY")
CF_AUTH=(-H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json")

say()  { printf '\n\033[1m%s\033[0m\n' "$*"; }
fail() { printf '\033[31m%s\033[0m\n' "$*" >&2; exit 1; }

# --- 1. Find or create the domain in Resend --------------------------------
say "1/6  Resend: locating $ZONE"
domain_id="$(curl -sS "${R_AUTH[@]}" https://api.resend.com/domains \
  | jq -r --arg z "$ZONE" '(.data // [])[] | select(.name == $z) | .id' | head -1)"

if [ -z "$domain_id" ]; then
  echo "      not found - creating (region: $REGION)"
  create="$(curl -sS -X POST "${R_AUTH[@]}" -H 'Content-Type: application/json' \
    https://api.resend.com/domains -d "{\"name\":\"$ZONE\",\"region\":\"$REGION\"}")"
  domain_id="$(echo "$create" | jq -r '.id // empty')"
  [ -n "$domain_id" ] || { echo "$create" | jq .; fail "Could not create the domain in Resend."; }
  echo "      created: $domain_id"
else
  echo "      found: $domain_id"
fi

# --- 2. Read the records Resend requires -----------------------------------
say "2/6  Resend: reading required DNS records"
records="$(curl -sS "${R_AUTH[@]}" "https://api.resend.com/domains/$domain_id" | jq -c '.records // []')"
count="$(echo "$records" | jq 'length')"
[ "$count" -gt 0 ] || fail "Resend returned no records to publish."
echo "$records" | jq -r '.[] | "      \(.type)  \(.name)"'

# --- 3. Publish to Cloudflare ----------------------------------------------
say "3/6  Cloudflare: publishing $count record(s)"
zone_id="$(curl -sS "${CF_AUTH[@]}" "https://api.cloudflare.com/client/v4/zones?name=$ZONE" \
  | jq -r '.result[0].id // empty')"
[ -n "$zone_id" ] || fail "Zone $ZONE not visible to this Cloudflare token.
Read the CLOUDFLARE TOKEN note at the top of this script - the usual cause is a
token minted in a Cloudflare account that does not hold this domain."
echo "      zone: $zone_id"

publish_failed=0
while read -r rec; do
  r_type="$(echo "$rec"  | jq -r '.type')"
  r_name="$(echo "$rec"  | jq -r '.name')"
  r_value="$(echo "$rec" | jq -r '.value')"
  r_prio="$(echo "$rec"  | jq -r '.priority // empty')"

  case "$r_name" in
    "$ZONE"|*".$ZONE") fqdn="$r_name" ;;
    ""|"@")            fqdn="$ZONE" ;;
    *)                 fqdn="$r_name.$ZONE" ;;
  esac

  body="$(jq -nc --arg t "$r_type" --arg n "$fqdn" --arg c "$r_value" --arg p "$r_prio" \
    '{type:$t, name:$n, content:$c, ttl:1}
     + (if $p == "" then {} else {priority: ($p|tonumber)} end)')"

  existing="$(curl -sS "${CF_AUTH[@]}" \
    "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records?type=$r_type&name=$fqdn" \
    | jq -r '.result[0].id // empty')"

  if [ -n "$existing" ]; then
    out="$(curl -sS -X PUT "${CF_AUTH[@]}" \
      "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records/$existing" --data "$body")"
    action="updated"
  else
    out="$(curl -sS -X POST "${CF_AUTH[@]}" \
      "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records" --data "$body")"
    action="created"
  fi

  if [ "$(echo "$out" | jq -r '.success')" = "true" ]; then
    echo "      $action  $r_type  $fqdn"
  else
    publish_failed=1
    echo "      FAILED   $r_type  $fqdn"
    echo "$out" | jq -r '.errors[]? | "               \(.code): \(.message)"'
  fi
done < <(echo "$records" | jq -c '.[]')

[ "$publish_failed" -eq 0 ] || fail "One or more records failed to publish; fix the errors above and re-run."

# --- 4. Verify --------------------------------------------------------------
say "4/6  Resend: verifying (DNS propagation can take a few minutes)"
status=""
for attempt in $(seq 1 12); do
  curl -sS -X POST "${R_AUTH[@]}" "https://api.resend.com/domains/$domain_id/verify" >/dev/null || true
  status="$(curl -sS "${R_AUTH[@]}" "https://api.resend.com/domains/$domain_id" | jq -r '.status')"
  echo "      attempt $attempt: $status"
  [ "$status" = "verified" ] && break
  sleep 20
done

if [ "$status" != "verified" ]; then
  say "Records are published but Resend still reports '$status'."
  echo "This is normally propagation. Re-run in a few minutes - it will pick up where it left off."
  exit 0
fi

# --- 5. Point Vercel at the verified sender --------------------------------
say "5/6  Vercel: setting LEAD_FROM_EMAIL to $FROM_EMAIL"
if command -v vercel >/dev/null; then
  vercel env rm LEAD_FROM_EMAIL production --yes --scope "$VERCEL_SCOPE" >/dev/null 2>&1 || true
  printf '%s' "$FROM_EMAIL" | vercel env add LEAD_FROM_EMAIL production --scope "$VERCEL_SCOPE" >/dev/null
  echo "      set"
else
  echo "      vercel CLI not found - set LEAD_FROM_EMAIL=$FROM_EMAIL manually"
fi

if [ "${SKIP_DEPLOY:-}" = "1" ]; then
  say "Done (SKIP_DEPLOY=1). Redeploy to pick up LEAD_FROM_EMAIL."
  exit 0
fi

# --- 6. Redeploy and prove it end to end -----------------------------------
say "6/6  Vercel: redeploying, then testing live delivery"
vercel --prod --yes --scope "$VERCEL_SCOPE" >/dev/null 2>&1 || true
sleep 10

result="$(curl -sS -X POST "https://www.$ZONE/api/lead" \
  -H 'Content-Type: application/json' \
  -d '{"form_type":"job_application_express","lead_source_label":"TEST - setup script","name":"Setup Verification","email":"'"$FROM_EMAIL"'","phone":"(916) 555-0000","message":"Automated verification. Please ignore."}')"

echo "      $result"
if [ "$(echo "$result" | jq -r '.delivery.email // false')" = "true" ]; then
  say "SUCCESS - email delivery is live to every address in LEAD_TO_EMAIL."
else
  say "Domain verified, but the live test did not report email delivery."
  echo "Check: vercel logs \$(vercel ls natabelcleaning-prod --scope $VERCEL_SCOPE | sed -n '5p' | awk '{print \$3}') --scope $VERCEL_SCOPE"
fi
