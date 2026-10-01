#!/usr/bin/env bash
# Applies all migrations to a fresh database and runs the booking tests.
# Usage: PGHOST=localhost PGUSER=postgres supabase/tests/run.sh
# Uses (and drops!) the database named by $TEST_DB, default "booking_test".
set -euo pipefail

cd "$(dirname "$0")/../.."
DB="${TEST_DB:-booking_test}"
PSQL=(psql -v ON_ERROR_STOP=1 -q -X)

"${PSQL[@]}" -d postgres -c "DROP DATABASE IF EXISTS \"$DB\"" -c "CREATE DATABASE \"$DB\""
for role in anon authenticated service_role; do
  "${PSQL[@]}" -d postgres -c "DO \$\$ BEGIN CREATE ROLE $role NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END \$\$" 
done

"${PSQL[@]}" -d "$DB" -f supabase/tests/supabase_stub.sql
for f in supabase/migrations/*.sql; do
  echo "→ $f"
  "${PSQL[@]}" -d "$DB" -f "$f"
done
"${PSQL[@]}" -d "$DB" -f supabase/tests/booking_test.sql
