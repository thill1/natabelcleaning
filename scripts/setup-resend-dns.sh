#!/usr/bin/env bash
# =============================================================================
# NataBel — verify the sending domain in Resend, end to end.
#
# Adds the domain to Resend, reads back the DNS records it generates, publishes
# them to Cloudflare, then asks Resend to verify. Idempotent: safe to re-run,
# it reuses an existing domain and updates records in place.
#
# Tokens are read from the environment and never written to disk.
#
#   export RESEND_API_KEY='re_...'      # resend.com/api-keys
#   export CF_API_TOKEN='...'           # see NOTE below
#   ./scripts/setup-resend-dns.sh
#
# NOTE: the Cloudflare token needs exactly one permission —
#   Zone > DNS > Edit, restricted to natabelpristinecleaning.com.
#   Create at: dash.cloudflare.com/profile/api-tokens > Create Token
#              > "Edit zone DNS" template.
#   Do not use a Global API Key; this token only needs to touch DNS.
# =============================================================================
set -euo pipefail

ZONE="${ZONE:-natabelpristinecleaning.com}"
REGION="${REGION:-us-east-1}"

for tool in curl jq; do
  command -v "$tool" >/dev/null || { echo "Missing required tool: $tool" >&2; exit 1; }
done
: "${RESEND_API_KEY:?Set RESEND_API_KEY first (see header)}"
: "${CF_API_TOKEN:?Set CF_API_TOKEN first (see header)}"

R_AUTH=(-H "Authorization: Bearer $RESEND_API_KEY")
CF_AUTH=(-H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json")

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }

# --- 1. Find or create the domain in Resend --------------------------------
say "1/4  Resend: looking for $ZONE"
domain_id="$(curl -sS "${R_AUTH[@]}" https://api.resend.com/domains \
  | jq -r --arg z "$ZONE" '(.data // [])[] | select(.name == $z) | .id' | head -1)"

if [ -z "$domain_id" ]; then
  echo "      not found - creating it (region: $REGION)"
  create="$(curl -sS -X POST "${R_AUTH[@]}" -H 'Content-Type: application/json' \
    https://api.resend.com/domains -d "{\"name\":\"$ZONE\",\"region\":\"$REGION\"}")"
  domain_id="$(echo "$create" | jq -r '.id // empty')"
  [ -n "$domain_id" ] || { echo "Failed to create domain:"; echo "$create" | jq .; exit 1; }
  echo "      created: $domain_id"
else
  echo "      already present: $domain_id"
fi

# --- 2. Read the records Resend wants --------------------------------------
say "2/4  Resend: reading required DNS records"
records="$(curl -sS "${R_AUTH[@]}" "https://api.resend.com/domains/$domain_id" | jq -c '.records // []')"
count="$(echo "$records" | jq 'length')"
[ "$count" -gt 0 ] || { echo "Resend returned no records - nothing to publish." >&2; exit 1; }
echo "$records" | jq -r '.[] | "      \(.type)  \(.name)"'

# --- 3. Publish them to Cloudflare -----------------------------------------
say "3/4  Cloudflare: publishing $count record(s) to $ZONE"
zone_id="$(curl -sS "${CF_AUTH[@]}" "https://api.cloudflare.com/client/v4/zones?name=$ZONE" \
  | jq -r '.result[0].id // empty')"
[ -n "$zone_id" ] || { echo "Zone $ZONE not found - check the token has access to it." >&2; exit 1; }
echo "      zone: $zone_id"

echo "$records" | jq -c '.[]' | while read -r rec; do
  r_type="$(echo "$rec" | jq -r '.type')"
  r_name="$(echo "$rec" | jq -r '.name')"
  r_value="$(echo "$rec" | jq -r '.value')"
  r_prio="$(echo "$rec"  | jq -r '.priority // empty')"

  # Resend returns names relative to the zone; Cloudflare wants the FQDN.
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
    echo "      FAILED   $r_type  $fqdn"
    echo "$out" | jq -r '.errors[]? | "               \(.code): \(.message)"'
  fi
done

# --- 4. Ask Resend to verify ------------------------------------------------
say "4/4  Resend: verifying (DNS can take a few minutes to propagate)"
curl -sS -X POST "${R_AUTH[@]}" "https://api.resend.com/domains/$domain_id/verify" >/dev/null || true

for attempt in 1 2 3 4 5 6 7 8 9 10; do
  status="$(curl -sS "${R_AUTH[@]}" "https://api.resend.com/domains/$domain_id" | jq -r '.status')"
  echo "      attempt $attempt: $status"
  if [ "$status" = "verified" ]; then
    say "Done - $ZONE is verified. Email delivery is live; no redeploy needed."
    exit 0
  fi
  sleep 20
  curl -sS -X POST "${R_AUTH[@]}" "https://api.resend.com/domains/$domain_id/verify" >/dev/null || true
done

say "Still '$status' after ~3 minutes. DNS is published; verification usually catches up shortly."
echo "Re-run this script, or check https://resend.com/domains"
