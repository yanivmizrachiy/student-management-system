#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
מנגנון בדיקה לפני שינויים - Pre-Change Validator
בודק את המצב הנוכחי של הקבצים לפני ביצוע שינויים
"""

import os
import json
import hashlib
from pathlib import Path
from datetime import datetime

class PreChangeValidator:
    def __init__(self, project_root='.'):
        self.project_root = Path(project_root)
        self.snapshot_dir = self.project_root / '.change-snapshots'
        self.snapshot_dir.mkdir(exist_ok=True)
    
    def create_snapshot(self, file_path):
        """יוצר snapshot של קובץ לפני שינוי"""
        file_path = Path(file_path)
        if not file_path.exists():
            return None
        
        # קרא את התוכן
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"❌ שגיאה בקריאת קובץ {file_path}: {e}")
            return None
        
        # צור hash של התוכן
        content_hash = hashlib.md5(content.encode('utf-8')).hexdigest()
        
        # צור snapshot
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        snapshot_file = self.snapshot_dir / f"{file_path.stem}_{timestamp}_{content_hash[:8]}.snapshot"
        
        snapshot = {
            'original_path': str(file_path),
            'timestamp': timestamp,
            'content_hash': content_hash,
            'content': content,
            'file_size': len(content),
            'line_count': len(content.splitlines())
        }
        
        try:
            with open(snapshot_file, 'w', encoding='utf-8') as f:
                json.dump(snapshot, f, ensure_ascii=False, indent=2)
            print(f"✅ Snapshot נוצר: {snapshot_file.name}")
            return snapshot_file
        except Exception as e:
            print(f"❌ שגיאה בשמירת snapshot: {e}")
            return None
    
    def validate_file_structure(self, file_path):
        """בודק את המבנה הבסיסי של קובץ"""
        issues = []
        file_path = Path(file_path)
        
        if not file_path.exists():
            return {'status': 'error', 'issues': ['קובץ לא קיים']}
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return {'status': 'error', 'issues': [f'שגיאה בקריאה: {e}']}
        
        # בדיקות ספציפיות לפי סוג קובץ
        if file_path.suffix == '.html':
            # בדיקת script tags
            script_open = content.count('<script')
            script_close = content.count('</script>')
            if script_open != script_close:
                issues.append(f'⚠️ Script tags לא תואמים: {script_open} פתוחים, {script_close} סגורים')
            
            # בדיקת body tag
            if '<body' not in content:
                issues.append('❌ אין body tag!')
            
            # בדיקת DOCTYPE
            if not content.strip().startswith('<!DOCTYPE'):
                issues.append('⚠️ אין DOCTYPE declaration')
        
        elif file_path.suffix == '.js':
            # בדיקות בסיסיות ל-JavaScript
            open_braces = content.count('{')
            close_braces = content.count('}')
            if open_braces != close_braces:
                issues.append(f'⚠️ סוגריים מסולסלים לא תואמים: {open_braces} פתוחים, {close_braces} סגורים')
            
            open_parens = content.count('(')
            close_parens = content.count(')')
            if open_parens != close_parens:
                issues.append(f'⚠️ סוגריים רגילים לא תואמים: {open_parens} פתוחים, {close_parens} סגורים')
        
        return {
            'status': 'ok' if len(issues) == 0 else 'warning',
            'issues': issues,
            'file_size': len(content),
            'line_count': len(content.splitlines())
        }
    
    def check_dependencies(self, file_path):
        """בודק שהתלויות קיימות"""
        file_path = Path(file_path)
        if not file_path.exists() or file_path.suffix != '.html':
            return {'status': 'skip', 'missing': []}
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            return {'status': 'error', 'missing': []}
        
        # רשימת תלויות לכל קובץ
        dependencies = {
            'layer.html': ['data.js', 'shared-utils.js', 'auto-load-data.js', 'live-reload.js'],
            'index.html': ['data.js', 'auto-load-data.js', 'live-reload.js'],
            'group.html': ['data.js', 'shared-utils.js', 'auto-load-data.js', 'live-reload.js'],
            'class.html': ['data.js', 'shared-utils.js', 'auto-load-data.js', 'live-reload.js'],
            'student.html': ['data.js', 'shared-utils.js', 'auto-load-data.js', 'live-reload.js'],
            'teacher.html': ['data.js', 'shared-utils.js', 'auto-load-data.js', 'live-reload.js']
        }
        
        file_name = file_path.name
        required_deps = dependencies.get(file_name, [])
        missing = []
        
        for dep in required_deps:
            if dep not in content:
                missing.append(dep)
            else:
                # בדוק שהקובץ קיים
                dep_path = self.project_root / dep
                if not dep_path.exists():
                    missing.append(f"{dep} (קובץ לא קיים)")
        
        return {
            'status': 'ok' if len(missing) == 0 else 'missing',
            'required': required_deps,
            'missing': missing
        }
    
    def compare_with_snapshot(self, file_path, snapshot_file):
        """משווה קובץ עם snapshot"""
        file_path = Path(file_path)
        snapshot_path = Path(snapshot_file)
        
        if not snapshot_path.exists():
            return {'status': 'error', 'message': 'Snapshot לא נמצא'}
        
        try:
            with open(snapshot_path, 'r', encoding='utf-8') as f:
                snapshot = json.load(f)
        except Exception as e:
            return {'status': 'error', 'message': f'שגיאה בקריאת snapshot: {e}'}
        
        if not file_path.exists():
            return {'status': 'error', 'message': 'קובץ לא קיים'}
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                current_content = f.read()
        except Exception as e:
            return {'status': 'error', 'message': f'שגיאה בקריאת קובץ: {e}'}
        
        original_hash = snapshot.get('content_hash', '')
        current_hash = hashlib.md5(current_content.encode('utf-8')).hexdigest()
        
        changes = {
            'status': 'different' if original_hash != current_hash else 'identical',
            'original_hash': original_hash,
            'current_hash': current_hash,
            'original_size': snapshot.get('file_size', 0),
            'current_size': len(current_content),
            'original_lines': snapshot.get('line_count', 0),
            'current_lines': len(current_content.splitlines())
        }
        
        return changes
    
    def validate_before_change(self, file_path):
        """מבצע את כל הבדיקות לפני שינוי"""
        print(f"\n🔍 בודק קובץ: {file_path}")
        print("=" * 60)
        
        # 1. יצירת snapshot
        snapshot = self.create_snapshot(file_path)
        
        # 2. בדיקת מבנה
        structure_check = self.validate_file_structure(file_path)
        print(f"\n📋 בדיקת מבנה: {structure_check['status']}")
        for issue in structure_check.get('issues', []):
            print(f"  {issue}")
        
        # 3. בדיקת תלויות
        deps_check = self.check_dependencies(file_path)
        print(f"\n🔗 בדיקת תלויות: {deps_check['status']}")
        if deps_check.get('missing'):
            print("  ❌ תלויות חסרות:")
            for dep in deps_check['missing']:
                print(f"    - {dep}")
        else:
            print("  ✅ כל התלויות קיימות")
        
        return {
            'snapshot': snapshot,
            'structure': structure_check,
            'dependencies': deps_check
        }
    
    def validate_after_change(self, file_path, snapshot_file):
        """בודק אחרי שינוי"""
        print(f"\n✅ בודק אחרי שינוי: {file_path}")
        print("=" * 60)
        
        # 1. בדיקת מבנה
        structure_check = self.validate_file_structure(file_path)
        print(f"\n📋 בדיקת מבנה: {structure_check['status']}")
        for issue in structure_check.get('issues', []):
            print(f"  {issue}")
        
        # 2. בדיקת תלויות
        deps_check = self.check_dependencies(file_path)
        print(f"\n🔗 בדיקת תלויות: {deps_check['status']}")
        if deps_check.get('missing'):
            print("  ❌ תלויות חסרות:")
            for dep in deps_check['missing']:
                print(f"    - {dep}")
        else:
            print("  ✅ כל התלויות קיימות")
        
        # 3. השוואה עם snapshot
        if snapshot_file:
            comparison = self.compare_with_snapshot(file_path, snapshot_file)
            print(f"\n🔄 השוואה עם snapshot:")
            if comparison['status'] == 'identical':
                print("  ⚠️ הקובץ לא השתנה!")
            else:
                print(f"  ✅ הקובץ השתנה")
                print(f"    גודל מקורי: {comparison['original_size']} bytes")
                print(f"    גודל נוכחי: {comparison['current_size']} bytes")
                print(f"    שורות מקוריות: {comparison['original_lines']}")
                print(f"    שורות נוכחיות: {comparison['current_lines']}")
        
        return {
            'structure': structure_check,
            'dependencies': deps_check,
            'comparison': comparison if snapshot_file else None
        }

if __name__ == '__main__':
    import sys
    
    validator = PreChangeValidator()
    
    if len(sys.argv) < 2:
        print("שימוש: python pre-change-validator.py <command> <file>")
        print("  commands: before, after, compare")
        sys.exit(1)
    
    command = sys.argv[1]
    file_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    if command == 'before' and file_path:
        validator.validate_before_change(file_path)
    elif command == 'after' and file_path:
        snapshot_file = sys.argv[3] if len(sys.argv) > 3 else None
        validator.validate_after_change(file_path, snapshot_file)
    else:
        print("❌ פקודה לא חוקית")

