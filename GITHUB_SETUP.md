# הגדרת GitHub - הוראות

## ✅ מה כבר מוכן:

1. ✅ Git repository נוצר
2. ✅ כל קבצי הקוד החשובים נוספו:
   - index.html
   - layer.html
   - group.html
   - student.html
   - teacher.html
   - class.html
   - data.js
   - init_data.html
   - README.md
   - .gitignore

3. ✅ 2 commits נוצרו:
   - גרסה ראשונית עם כל הקבצים
   - הוספת README

## 🔗 חיבור ל-GitHub:

### שלב 1: צור repository חדש ב-GitHub
1. היכנס ל-https://github.com
2. לחץ על "+" → "New repository"
3. תן שם ל-repository (למשל: `student-management-system`)
4. אל תסמן "Initialize with README" (כבר יש לנו)
5. לחץ "Create repository"

### שלב 2: חבר את ה-local repository ל-GitHub
הפעל את הפקודות הבאות (החלף `YOUR_USERNAME` ו-`YOUR_REPO_NAME`):

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

או אם אתה משתמש ב-SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 📝 סטטוס נוכחי:

```bash
# לבדיקת סטטוס:
git status

# לראות את ה-commits:
git log --oneline

# לראות את הקבצים שנשמרו:
git ls-files
```

## 🔄 עדכונים עתידיים:

לאחר שינויים, כדי לשמור ולסנכרן:

```bash
git add .
git commit -m "תיאור השינוי"
git push
```

## ⚠️ הערות:

- קבצי הדוחות (הקבצים מסוג `.md` שהם דוחות) **לא נוספו** ל-Git כי הם דוחות בדיקה זמניים
- אם תרצה להוסיף אותם, הרץ: `git add *.md`
- הנתונים נשמרים ב-localStorage בדפדפן - הם **לא** חלק מה-Git repository

