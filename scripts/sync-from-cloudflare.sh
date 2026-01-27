#!/bin/bash
# 🔄 Sync data from math-tutor-app (Cloudflare D1) to PostgreSQL

set -e

DRY_RUN=false
BACKUP=true
CLOUDFLARE_DB="math-tutor-db"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --no-backup)
      BACKUP=false
      shift
      ;;
    --db)
      CLOUDFLARE_DB="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "═══════════════════════════════════════════"
echo "   🔄 Cloudflare D1 → PostgreSQL Sync"
echo "═══════════════════════════════════════════"
echo ""

# Check wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler not installed!"
    echo "Install: npm install -g wrangler"
    exit 1
fi

# Check Cloudflare auth
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  Not authenticated to Cloudflare"
    wrangler login
fi

echo "✅ Connected to Cloudflare"

# Create directories
mkdir -p data-exports backups

# Export from Cloudflare
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
EXPORT_FILE="data-exports/students_${TIMESTAMP}.json"

echo ""
echo "📥 Exporting from Cloudflare D1..."
wrangler d1 execute "$CLOUDFLARE_DB" --remote --command="SELECT * FROM students" --json > "$EXPORT_FILE"

STUDENT_COUNT=$(jq '. | if type == "array" then length else .results | length end' "$EXPORT_FILE")
echo "✅ Exported $STUDENT_COUNT students"

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "🔍 DRY RUN - Not importing to PostgreSQL"
    echo "Data saved to: $EXPORT_FILE"
    exit 0
fi

# Backup PostgreSQL
if [ "$BACKUP" = true ]; then
    echo ""
    echo "💾 Backing up PostgreSQL..."
    BACKUP_FILE="backups/postgres_${TIMESTAMP}.sql"
    docker exec student_management_postgres pg_dump -U postgres student_management > "$BACKUP_FILE" 2>&1
    echo "✅ Backup created: $BACKUP_FILE"
fi

# Generate SQL
echo ""
echo "🔄 Generating SQL import..."
SQL_FILE="data-exports/import_${TIMESTAMP}.sql"

cat > "$SQL_FILE" << EOF
-- Auto-generated import from Cloudflare D1
-- Timestamp: ${TIMESTAMP}

BEGIN;

-- Ensure grades exist
INSERT INTO grades (id, name, student_count)
VALUES
    (gen_random_uuid(), 'כיתה ז''', 0),
    (gen_random_uuid(), 'כיתה ח''', 0),
    (gen_random_uuid(), 'כיתה ט''', 0)
ON CONFLICT DO NOTHING;

-- Ensure default group exists
INSERT INTO groups (id, name, grade_id, student_count)
SELECT gen_random_uuid(), 'קבוצה ראשית', g.id, 0
FROM grades g
WHERE g.name = 'כיתה ז'''
LIMIT 1
ON CONFLICT DO NOTHING;

EOF

# Convert students
jq -r '. | if type == "array" then .[] else .results[] end | @json' "$EXPORT_FILE" | while read -r student; do
    FULL_NAME=$(echo "$student" | jq -r '.full_name // ""' | sed "s/'/''/g")
    FIRST_NAME=$(echo "$FULL_NAME" | awk '{print $1}')
    LAST_NAME=$(echo "$FULL_NAME" | sed "s/^$FIRST_NAME //")
    
    cat >> "$SQL_FILE" << EOF

INSERT INTO students (id, first_name, last_name, student_id, grade_id, group_id, status)
SELECT
    gen_random_uuid(),
    '$FIRST_NAME',
    '$LAST_NAME',
    'ST' || LPAD((RANDOM() * 99999)::INT::TEXT, 5, '0'),
    g.id,
    gr.id,
    'active'
FROM grades g, groups gr
WHERE g.name = 'כיתה ז''' AND gr.name = 'קבוצה ראשית'
ON CONFLICT (student_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

EOF
done

echo "COMMIT;" >> "$SQL_FILE"

# Import to PostgreSQL
echo ""
echo "📥 Importing to PostgreSQL..."

# Check if PostgreSQL is running
if ! docker ps --filter "name=student_management_postgres" --format "{{.Names}}" | grep -q student_management_postgres; then
    echo "⚠️  PostgreSQL not running, starting..."
    cd backend
    docker-compose up -d
    cd ..
    sleep 10
fi

# Execute SQL
cat "$SQL_FILE" | docker exec -i student_management_postgres psql -U postgres -d student_management 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Import successful! $STUDENT_COUNT students imported"
else
    echo ""
    echo "❌ Import failed!"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════"
echo "   ✅ Sync Complete!"
echo "═══════════════════════════════════════════"
