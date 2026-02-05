#!/bin/bash
# 🔄 סקריפט סנכרון חכם מ-Cloudflare D1 (Linux/Mac)

set -e

MATH_TUTOR_PATH="${1:-../math-tutor-app}"
DRY_RUN="${2:-false}"

echo "═══════════════════════════════════════════"
echo "   🔄 סנכרון נתונים מ-math-tutor-app"
echo "═══════════════════════════════════════════"
echo ""

# בדיקת קיום math-tutor-app
if [ ! -d "$MATH_TUTOR_PATH" ]; then
    echo "❌ לא נמצא: $MATH_TUTOR_PATH"
    echo "💡 הורד את math-tutor-app מ-GitHub או ציין נתיב:"
    echo "   ./sync-from-cloudflare.sh /path/to/math-tutor-app [dry-run]"
    exit 1
fi

echo "✅ נמצא: $MATH_TUTOR_PATH"
echo ""

# בדיקת wrangler
echo "🔍 בדיקת Wrangler CLI..."
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler לא מותקן!"
    echo "💡 התקן: npm install -g wrangler"
    exit 1
fi

echo "✅ Wrangler מותקן"
echo ""

# בדיקת חיבור
echo "🔍 בדיקת חיבור ל-Cloudflare..."
cd "$MATH_TUTOR_PATH/worker"
if ! wrangler whoami &> /dev/null; then
    echo "❌ לא מחובר ל-Cloudflare!"
    echo "💡 התחבר: wrangler login"
    exit 1
fi

echo "✅ מחובר ל-Cloudflare"
echo ""

# ייצוא נתונים
echo "📥 ייצוא נתונים..."
mkdir -p ../../data-exports

TABLES=("students" "lessons" "payments" "receipts" "settings")

for table in "${TABLES[@]}"; do
    echo "  ⏳ מייצא $table..."
    if wrangler d1 execute math-tutor-db --remote --command="SELECT * FROM $table" --json > "../../data-exports/$table.json" 2>&1; then
        echo "  ✅ $table"
    else
        echo "  ❌ שגיאה בייצוא $table"
    fi
done

cd ../..

if [ "$DRY_RUN" = "true" ]; then
    echo ""
    echo "🔍 מצב Dry Run - הנתונים יוצאו אך לא יובאו"
    echo ""
    echo "📊 סיכום נתונים שיוצאו:"
    
    for table in "${TABLES[@]}"; do
        if [ -f "data-exports/$table.json" ]; then
            COUNT=$(cat "data-exports/$table.json" | grep -o '"' | wc -l)
            echo "  📄 $table: $((COUNT / 2)) שדות"
        fi
    done
    
    echo ""
    echo "💡 להרצה אמיתית הסר את הפרמטר dry-run"
else
    echo ""
    echo "✅ נתונים יוצאו בהצלחה!"
    echo ""
    echo "📝 הערה: ייבוא לְ-PostgreSQL זמין רק בסקריפט PowerShell"
    echo "   להרצה מלאה השתמש ב: .\\scripts\\sync-from-cloudflare.ps1"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "   ✅ סנכרון הושלם!"
echo "═══════════════════════════════════════════"
echo ""
echo "📂 נתונים ב: data-exports/"
