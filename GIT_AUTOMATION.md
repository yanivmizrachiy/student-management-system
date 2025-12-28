# GitHub Automation Playbook

מטרה: להפעיל את כל הכלים שיצרנו כך שכל פעולה בגיט תהיה מבוקרת, אוטומטית וחכמה.

## 1. מה למחוק ומה להשאיר?
- **שמור:** קבצי מקור (`.html`, `.js`, `.css`, .md), סקריפטים (validator/protection), `server.py`, `live-reload.js`.
- **מחק/התעלם:** קבצים זמניים (`.change-snapshots/`, `.last-update.json`, `.log`, `.tmp`, `.bak`, `.DS_Store`, `node_modules/`, `__pycache__/`, קבצי IDE).
- `.gitignore` כבר מגדיר את כל אלה – אל תשמור גרסאות מיותרות.

## 2. איך לשמור חכם?
1. הפעל הגדרות hooks:
   ```
   git config core.hooksPath .githooks
   ```
2. תוודא שתמיד פועל `scripts/precommit.py` – הוא מפעיל את `protect-layer-html.py`.
3. לפני כל שינוי משמעותי ב-layer.html:
   ```
   python protect-layer-html.py layer.html
   ```
4. אחרי השינוי – הפעל שוב את אותו הסקריפט לוודא ש`layer.html` נשאר תקין.

## 3. מה לשמור בגיט?
- תיעוד חדש (`CHANGE_VALIDATION_GUIDE.md`, `PROTECTION_RULES.md`, `WORKFLOW_PROTECTION.md`, `GIT_AUTOMATION.md`) כדי שאחרים יבינו את המנגנון.
- סקריפטים שנבדקים (למשל `scripts/precommit.py`, `protect-layer-html.py`, `pre-change-validator.py`).
- הדבק `README` עם הסבר על האוטומציה.

## 4. איך לשמור בגיט בצורה חכמה?
1. עבודה ב-branch נפרד לכל שינוי.
2. לפני commit:
   - `python protect-layer-html.py layer.html`
   - אם צריך, `python pre-change-validator.py before layer.html`
3. שים את הקבצים הרלוונטיים בעקומת stage:
   ```
   git add layer.html scripts/precommit.py protect-layer-html.py .githooks/pre-commit .gitignore README.md GIT_AUTOMATION.md
   ```
4. בצע commit רק לאחר הפעלת ה-hook והשגיאה תאופס.

## 5. Automation נוספות
- שקול להוסיף script אחיד (לדוגמה `scripts/validate.sh`) שיקרא את כל הכלים – כך ה-hook פשוט מפעיל אותו.
- השתמש ב-`live-reload.js` בהפעלה מקומית בלבד (וודא ש`.last-update.json` לא מתוייג).

## 6. צילום מצב וניקוי קבוע
- מדי חודש מריץ `git status` ומוחק קבצים שמאופסים עם `.gitignore`.
- הסר קבצים ישנים/נסיוניים (למשל מסמכי תכנון ישנים או גיבויים) מהמאגרים.

## 7. תיעוד ושיתופים
- הפנה את הצוות ל-`README.md`, `GIT_AUTOMATION.md` ו-`PROTECTION_RULES.md`.
- וודא שכולם מכירים את הסקריפטים ואיך להפעיל אותם.

## 8. בדיקת דפי השכבות ב-GitHub Pages

1. הפעל את השרת המקומי כדי לוודא שהדפים עובדים בדיוק כמו ב-GitHub:
   ```bash
   cd "Glide לניהול תלמידים_files"
   python server.py
   ```
   - פתח ב-`http://localhost:8000/layer.html?layer=9`, נקה `localStorage` (DevTools > Application > Clear Storage) או פתח בחלון Incognito, ועדכן כדי לוודא שכרטיס נורית מויאל מופיע עם `class="group-card"` ו-`span` של `נורית מויאל`.
2. סנכרן הכל ל־GitHub:
   ```bash
   git add .
   git commit -m "Update layers"
   git push origin main
   ```
   - ה-hook מפעיל `protect-layer-html.py`/`scripts/precommit.py` ומוודא שהקובץ לא נשבר; במידה והבדיקה נכשלת הכרטיס של נורית חושף בעיה.
3. לאחר הפוש, פתח את הקישור היציב `https://yanivmizrachiy.github.io/student-management-system/layer.html?layer=9`:
   - נקה `localStorage` או פתח בחלון Incognito כדי לאלץ את החידוש.
   - ודא שנמצא אזור `class="group-card"` עם `span` שמכיל `נורית מויאל` וכתובתו "כיתה: ..." ו"21 תלמידים" (או המונה הרצוי).
   - אם עדיין רואים “0 תלמידים” במציאות, בדוק את הקונסול אם `auto-load-data.js` ציין `📦 טוען את כל הקבוצות...`.

אל תשכח שסקריפטים אלו מתעדכנים תמיד – העלה את כל הקבצים ל-GitHub לפני שאתה משווה את ההרצה המקומית לעמוד המתארח.

בכך נשמור על ריפו נקי, מסונכרן, וכשיר לפריסה חכמה ומבוקרת.

