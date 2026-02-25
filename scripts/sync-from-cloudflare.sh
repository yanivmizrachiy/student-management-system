#!/bin/bash
# 🔄 Cloudflare D1 to PostgreSQL Sync Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
CLOUDFLARE_DB="math-tutor-db"
EXPORT_DIR="data-exports"
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
DRY_RUN=false
BACKUP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run) DRY_RUN=true; shift ;;
        --backup) BACKUP=true; shift ;;
        *) shift ;;
    esac
done

echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}   🔄 Cloudflare D1 → PostgreSQL Sync${NC}"
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo ""

# Create directories
mkdir -p "$EXPORT_DIR"
mkdir -p "$BACKUP_DIR"

# Check prerequisites
echo -e "${YELLOW}🔍 בדיקת דרישות מוקדמות...${NC}"

if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler לא מותקן!${NC}"
    echo -e "${YELLOW}התקן: npm install -g wrangler${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Wrangler: $(wrangler --version)${NC}"

# Check Cloudflare auth
echo -e "\n${YELLOW}🔐 בדיקת התחברות ל-Cloudflare...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  לא מחובר ל-Cloudflare!${NC}"
    echo -e "${CYAN}מתחבר...${NC}"
    wrangler login
fi

echo -e "${GREEN}✅ מחובר ל-Cloudflare${NC}"

# List available databases
echo -e "\n${YELLOW}📊 רשימת Databases זמינים:${NC}"
wrangler d1 list

# Export from Cloudflare
echo -e "\n${YELLOW}📥 מייצא נתונים מ-Cloudflare D1...${NC}"

EXPORT_FILE="$EXPORT_DIR/students_$TIMESTAMP.json"

echo -e "${CYAN}   📍 Database: $CLOUDFLARE_DB${NC}"
echo -e "${CYAN}   📍 Export to: $EXPORT_FILE${NC}"

# Export students
echo -e "\n${YELLOW}👨‍🎓 מייצא תלמידים...${NC}"

if ! wrangler d1 execute "$CLOUDFLARE_DB" --remote --command="SELECT * FROM students" --json > "$EXPORT_FILE" 2>&1; then
    echo -e "${YELLOW}⚠️  שגיאה בייצוא מ-Cloudflare D1${NC}"
    echo -e "${CYAN}בודק אם ה-database קיים...${NC}"
    echo -e "${CYAN}💡 נסה: cd math-tutor-app/worker && wrangler d1 list${NC}"
    exit 1
fi

echo -e "${GREEN}✅ נתונים יוצאו: $EXPORT_FILE${NC}"

# Count students
if command -v jq &> /dev/null; then
    STUDENT_COUNT=$(jq 'if type=="array" then length else .results | length end' "$EXPORT_FILE" 2>/dev/null || echo "0")
else
    # Fallback if jq not available
    STUDENT_COUNT=$(grep -o '"first_name"' "$EXPORT_FILE" | wc -l || echo "0")
fi

echo -e "${CYAN}📊 נמצאו $STUDENT_COUNT תלמידים${NC}"

if [ "$STUDENT_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  אין תלמידים לייבא!${NC}"
    echo -e "${CYAN}💡 ודא שיש נתונים ב-Cloudflare D1 database${NC}"
    exit 0
fi

if [ "$DRY_RUN" = true ]; then
    echo -e "\n${YELLOW}🔍 Dry Run Mode - לא מייבא לPostgreSQL${NC}"
    echo -e "${CYAN}הנתונים נשמרו ב: $EXPORT_FILE${NC}"
    exit 0
fi

# Backup if requested
if [ "$BACKUP" = true ]; then
    echo -e "\n${YELLOW}💾 יצירת גיבוי של PostgreSQL...${NC}"
    BACKUP_FILE="$BACKUP_DIR/postgres_backup_$TIMESTAMP.sql"
    
    if docker exec student_management_postgres pg_dump -U postgres student_management > "$BACKUP_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ גיבוי נוצר: $BACKUP_FILE${NC}"
    else
        echo -e "${YELLOW}⚠️  לא ניתן ליצור גיבוי (ה-database אולי לא רץ)${NC}"
    fi
fi

# Create SQL import
echo -e "\n${YELLOW}🔄 ממיר נתונים לפורמט PostgreSQL...${NC}"

SQL_FILE="$EXPORT_DIR/import_$TIMESTAMP.sql"

cat > "$SQL_FILE" << 'EOF'
-- Auto-generated import script
-- Source: Cloudflare D1 (math-tutor-db)
-- Target: PostgreSQL (student_management)

BEGIN;

-- Create grades if not exist
INSERT INTO grades (id, name, student_count) 
VALUES 
    (gen_random_uuid(), 'כיתה ז''', 0),
    (gen_random_uuid(), 'כיתה ח''', 0),
    (gen_random_uuid(), 'כיתה ט''', 0)
ON CONFLICT DO NOTHING;

-- Create default group if not exist
INSERT INTO groups (id, name, grade_id, student_count) 
SELECT gen_random_uuid(), 'קבוצה ראשית', g.id, 0
FROM grades g
WHERE g.name = 'כיתה ז'''
ON CONFLICT DO NOTHING;

EOF

# Parse JSON and create INSERT statements
if command -v jq &> /dev/null; then
    # Use jq if available
    jq -r '.results[] // .[] | @json' "$EXPORT_FILE" 2>/dev/null | while read -r student_json; do
        FIRST_NAME=$(echo "$student_json" | jq -r '.first_name // ""' | sed "s/'/''/g")
        LAST_NAME=$(echo "$student_json" | jq -r '.last_name // ""' | sed "s/'/''/g")
        STUDENT_ID=$(echo "$student_json" | jq -r '.student_id // ""')
        
        if [ -z "$STUDENT_ID" ]; then
            STUDENT_ID="S$RANDOM"
        fi
        
        cat >> "$SQL_FILE" << EOF

INSERT INTO students (id, first_name, last_name, student_id, grade_id, group_id, status)
SELECT 
    gen_random_uuid(),
    '$FIRST_NAME',
    '$LAST_NAME',
    '$STUDENT_ID',
    g.id,
    gr.id,
    'active'
FROM grades g
CROSS JOIN groups gr
WHERE g.name = 'כיתה ז''' AND gr.name = 'קבוצה ראשית'
ON CONFLICT (student_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
EOF
    done
else
    echo -e "${YELLOW}⚠️  jq לא מותקן - המרה פשוטה${NC}"
    # Basic fallback without jq
    echo "-- Data conversion requires jq. Install with: sudo apt-get install jq" >> "$SQL_FILE"
fi

echo "COMMIT;" >> "$SQL_FILE"

echo -e "${GREEN}✅ SQL נוצר: $SQL_FILE${NC}"

# Import to PostgreSQL
echo -e "\n${YELLOW}📥 מייבא ל-PostgreSQL...${NC}"

# Check if PostgreSQL is running
if ! docker ps --filter "name=student_management_postgres" --format "{{.Names}}" | grep -q "student_management_postgres"; then
    echo -e "${YELLOW}⚠️  PostgreSQL container לא רץ!${NC}"
    echo -e "${CYAN}מפעיל PostgreSQL...${NC}"
    
    cd backend
    docker-compose up -d
    cd ..
    
    echo -e "${CYAN}⏳ ממתין ש-PostgreSQL יהיה מוכן...${NC}"
    sleep 10
fi

# Execute SQL
if cat "$SQL_FILE" | docker exec -i student_management_postgres psql -U postgres -d student_management > /dev/null 2>&1; then
    echo -e "\n${GREEN}✅ ייבוא הושלם בהצלחה!${NC}"
    echo -e "${CYAN}📊 $STUDENT_COUNT תלמידים יובאו${NC}"
else
    echo -e "\n${RED}❌ שגיאה בייבוא!${NC}"
    echo -e "${YELLOW}💡 בדוק את ה-logs למעלה${NC}"
    exit 1
fi

echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ סנכרון הושלם!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo -e "\n${CYAN}קבצים שנוצרו:${NC}"
echo -e "${NC}  📄 $EXPORT_FILE${NC}"
echo -e "${NC}  📄 $SQL_FILE${NC}"
if [ "$BACKUP" = true ]; then
    echo -e "${NC}  💾 $BACKUP_FILE${NC}"
fi
echo ""
